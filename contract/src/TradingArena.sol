// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "./interfaces/ITradingArena.sol";
import "./AgentRegistry.sol";
import "./StrategyVault.sol";

/**
 * @title TradingArena
 * @notice AI Trading Arena 主合约
 * @dev 整合 Agent 注册、策略执行、排行榜等功能
 */
contract TradingArena is ITradingArena, Ownable, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ============ State Variables ============

    /// @notice Agent 注册表合约
    AgentRegistry public immutable agentRegistry;

    /// @notice 策略金库合约
    StrategyVault public immutable strategyVault;

    /// @notice 执行 ID 计数器
    uint256 private _executionIdCounter;

    /// @notice 执行 ID => 执行记录
    mapping(uint256 => StrategyExecution) private _executions;

    /// @notice Agent ID => 执行 ID 列表
    mapping(uint256 => uint256[]) private _agentExecutions;

    /// @notice 用户 => 执行 ID 列表
    mapping(address => uint256[]) private _userExecutions;

    /// @notice Agent ID => 统计数据
    mapping(uint256 => AgentStatsInternal) private _agentStats;

    /// @notice TEE 签名者地址 (用于验证 0G Compute 的 TEE 签名)
    address public teeSigner;

    /// @notice 是否启用 TEE 验证
    bool public teeVerificationEnabled = false;

    // ============ Internal Structs ============

    struct AgentStatsInternal {
        uint256 totalTrades;
        uint256 successfulTrades;
        int256 totalPnL;
        int256 cumulativeReturn;
        uint256 lastTradeTime;
    }

    // ============ Events ============

    event TeeSignerUpdated(address indexed newSigner);
    event TeeVerificationToggled(bool enabled);

    // ============ Errors ============

    error AgentNotActive(uint256 agentId);
    error InvalidStorageRootHash();
    error InvalidTeeSignature();
    error ExecutionNotFound(uint256 executionId);
    error ExecutionAlreadyCompleted(uint256 executionId);
    error NotExecutionOwner(uint256 executionId);

    // ============ Constructor ============

    constructor(
        address _agentRegistry,
        address payable _strategyVault
    ) Ownable(msg.sender) {
        require(_agentRegistry != address(0), "Invalid registry address");
        require(_strategyVault != address(0), "Invalid vault address");
        
        agentRegistry = AgentRegistry(_agentRegistry);
        strategyVault = StrategyVault(_strategyVault);
        _executionIdCounter = 1;
    }

    // ============ Agent Management (Delegated to Registry) ============

    /**
     * @inheritdoc ITradingArena
     */
    function registerAgent(
        string calldata name,
        string calldata description,
        string calldata modelProvider,
        bytes calldata metadata
    ) external override returns (uint256 agentId) {
        agentId = agentRegistry.registerAgent(name, description, modelProvider, metadata);
        
        emit AgentRegistered(agentId, msg.sender, name, modelProvider);
    }

    /**
     * @inheritdoc ITradingArena
     */
    function updateAgentStatus(uint256 agentId, bool isActive) external override {
        agentRegistry.setAgentStatus(agentId, isActive);
        emit AgentStatusUpdated(agentId, isActive);
    }

    /**
     * @inheritdoc ITradingArena
     */
    function getAgent(uint256 agentId) external view override returns (AgentInfo memory) {
        AgentRegistry.Agent memory agent = agentRegistry.getAgent(agentId);
        AgentStatsInternal storage stats = _agentStats[agentId];

        return AgentInfo({
            agentId: agent.id,
            owner: agent.owner,
            name: agent.name,
            description: agent.description,
            modelProvider: agent.modelProvider,
            isActive: agent.isActive,
            createdAt: agent.createdAt,
            totalTrades: stats.totalTrades,
            successfulTrades: stats.successfulTrades,
            totalPnL: stats.totalPnL
        });
    }

    /**
     * @inheritdoc ITradingArena
     */
    function getActiveAgents() external view override returns (AgentInfo[] memory) {
        AgentRegistry.Agent[] memory agents = agentRegistry.getActiveAgents();
        AgentInfo[] memory result = new AgentInfo[](agents.length);

        for (uint256 i = 0; i < agents.length; i++) {
            AgentStatsInternal storage stats = _agentStats[agents[i].id];
            result[i] = AgentInfo({
                agentId: agents[i].id,
                owner: agents[i].owner,
                name: agents[i].name,
                description: agents[i].description,
                modelProvider: agents[i].modelProvider,
                isActive: agents[i].isActive,
                createdAt: agents[i].createdAt,
                totalTrades: stats.totalTrades,
                successfulTrades: stats.successfulTrades,
                totalPnL: stats.totalPnL
            });
        }

        return result;
    }

    // ============ Strategy Execution ============

    /**
     * @inheritdoc ITradingArena
     */
    function executeStrategy(
        uint256 agentId,
        bytes calldata strategyData,
        bytes32 storageRootHash,
        bytes calldata teeSignature
    ) external payable override nonReentrant whenNotPaused returns (uint256 executionId) {
        // 验证 Agent 状态
        AgentRegistry.Agent memory agent = agentRegistry.getAgent(agentId);
        if (!agent.isActive) revert AgentNotActive(agentId);

        // 验证存证哈希
        if (storageRootHash == bytes32(0)) revert InvalidStorageRootHash();

        // 验证 TEE 签名 (如果启用)
        if (teeVerificationEnabled) {
            _verifyTeeSignature(agentId, strategyData, storageRootHash, teeSignature);
        }

        // 处理资金
        uint256 amount = msg.value;
        if (amount > 0) {
            // 为用户存入金库
            strategyVault.depositFor{value: amount}(msg.sender);
        }

        // 获取用户在金库中的可用余额
        uint256 userBalance = strategyVault.getAvailableBalance(msg.sender);
        require(userBalance > 0, "No funds available");

        // 计算执行金额
        uint256 executeAmount;
        if (amount > 0) {
            // 如果发送了ETH，使用发送的金额
            executeAmount = amount;
        } else {
            // 如果没有发送ETH，计算可以安全锁定的最大金额（不超过50%）
            uint256 totalBalance = strategyVault.balanceOf(msg.sender);
            uint256 maxLockable = totalBalance / 2;  // 50%
            executeAmount = userBalance < maxLockable ? userBalance : maxLockable;
        }

        executionId = _executionIdCounter++;

        // 锁定资金
        strategyVault.lockFunds(executionId, msg.sender, agentId, executeAmount);

        // 创建执行记录
        _executions[executionId] = StrategyExecution({
            executionId: executionId,
            agentId: agentId,
            user: msg.sender,
            amount: executeAmount,
            storageRootHash: storageRootHash,
            strategyData: strategyData,
            pnl: 0,
            timestamp: block.timestamp,
            isCompleted: false
        });

        _agentExecutions[agentId].push(executionId);
        _userExecutions[msg.sender].push(executionId);

        emit StrategyExecuted(executionId, agentId, msg.sender, executeAmount, storageRootHash, block.timestamp);
    }

    /**
     * @inheritdoc ITradingArena
     */
    function completeStrategy(uint256 executionId, int256 pnl) external override nonReentrant whenNotPaused {
        StrategyExecution storage execution = _executions[executionId];
        if (execution.executionId == 0) revert ExecutionNotFound(executionId);
        if (execution.isCompleted) revert ExecutionAlreadyCompleted(executionId);
        
        // 只有执行者或合约 owner 可以完成执行
        if (execution.user != msg.sender && msg.sender != owner()) {
            revert NotExecutionOwner(executionId);
        }

        execution.pnl = pnl;
        execution.isCompleted = true;

        // 释放资金并结算
        strategyVault.releaseFunds(executionId, pnl);

        // 更新 Agent 统计
        AgentStatsInternal storage stats = _agentStats[execution.agentId];
        stats.totalTrades++;
        if (pnl > 0) {
            stats.successfulTrades++;
        }
        stats.totalPnL += pnl;
        stats.lastTradeTime = block.timestamp;

        emit StrategyCompleted(executionId, execution.agentId, pnl);
    }

    /**
     * @inheritdoc ITradingArena
     */
    function getExecution(uint256 executionId) external view override returns (StrategyExecution memory) {
        if (_executions[executionId].executionId == 0) revert ExecutionNotFound(executionId);
        return _executions[executionId];
    }

    /**
     * @inheritdoc ITradingArena
     */
    function getUserExecutions(address user) external view override returns (StrategyExecution[] memory) {
        uint256[] storage executionIds = _userExecutions[user];
        StrategyExecution[] memory result = new StrategyExecution[](executionIds.length);

        for (uint256 i = 0; i < executionIds.length; i++) {
            result[i] = _executions[executionIds[i]];
        }

        return result;
    }

    /**
     * @notice 获取 Agent 的执行历史
     * @param agentId Agent ID
     * @return 执行记录列表
     */
    function getAgentExecutions(uint256 agentId) external view returns (StrategyExecution[] memory) {
        uint256[] storage executionIds = _agentExecutions[agentId];
        StrategyExecution[] memory result = new StrategyExecution[](executionIds.length);

        for (uint256 i = 0; i < executionIds.length; i++) {
            result[i] = _executions[executionIds[i]];
        }

        return result;
    }

    // ============ Leaderboard ============

    /**
     * @inheritdoc ITradingArena
     */
    function getLeaderboard(uint256 limit) external view override returns (AgentStats[] memory) {
        AgentRegistry.Agent[] memory agents = agentRegistry.getActiveAgents();
        uint256 count = agents.length < limit ? agents.length : limit;
        
        // 创建临时数组存储统计数据
        AgentStats[] memory allStats = new AgentStats[](agents.length);
        
        for (uint256 i = 0; i < agents.length; i++) {
            AgentStatsInternal storage stats = _agentStats[agents[i].id];
            uint256 winRate = stats.totalTrades > 0 
                ? (stats.successfulTrades * 10000) / stats.totalTrades 
                : 0;
            
            allStats[i] = AgentStats({
                agentId: agents[i].id,
                name: agents[i].name,
                totalPnL: stats.totalPnL,
                winRate: winRate,
                totalTrades: stats.totalTrades,
                sharpeRatio: _calculateSharpeRatio(agents[i].id)
            });
        }

        // 简单排序 (按 totalPnL 降序)
        for (uint256 i = 0; i < allStats.length; i++) {
            for (uint256 j = i + 1; j < allStats.length; j++) {
                if (allStats[j].totalPnL > allStats[i].totalPnL) {
                    AgentStats memory temp = allStats[i];
                    allStats[i] = allStats[j];
                    allStats[j] = temp;
                }
            }
        }

        // 返回前 limit 个
        AgentStats[] memory result = new AgentStats[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = allStats[i];
        }

        return result;
    }

    // ============ Fund Management (Delegated to Vault) ============

    /**
     * @inheritdoc ITradingArena
     */
    function deposit() external payable override {
        strategyVault.depositFor{value: msg.value}(msg.sender);
        emit FundsDeposited(msg.sender, msg.value);
    }

    /**
     * @inheritdoc ITradingArena
     */
    function withdraw(uint256 amount) external override {
        strategyVault.withdrawFor(msg.sender, amount);
        emit FundsWithdrawn(msg.sender, amount);
    }

    /**
     * @inheritdoc ITradingArena
     */
    function balanceOf(address user) external view override returns (uint256) {
        return strategyVault.balanceOf(user);
    }

    // ============ Admin Functions ============

    /**
     * @notice 设置 TEE 签名者地址
     * @param _teeSigner 新的签名者地址
     */
    function setTeeSigner(address _teeSigner) external onlyOwner {
        teeSigner = _teeSigner;
        emit TeeSignerUpdated(_teeSigner);
    }

    /**
     * @notice 切换 TEE 验证开关
     * @param enabled 是否启用
     */
    function setTeeVerificationEnabled(bool enabled) external onlyOwner {
        teeVerificationEnabled = enabled;
        emit TeeVerificationToggled(enabled);
    }

    /**
     * @notice 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Internal Functions ============

    /**
     * @dev 验证 TEE 签名
     */
    function _verifyTeeSignature(
        uint256 agentId,
        bytes calldata strategyData,
        bytes32 storageRootHash,
        bytes calldata teeSignature
    ) internal view {
        require(teeSigner != address(0), "TEE signer not set");
        
        bytes32 messageHash = keccak256(
            abi.encodePacked(agentId, strategyData, storageRootHash)
        );
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recovered = ethSignedMessageHash.recover(teeSignature);
        
        if (recovered != teeSigner) revert InvalidTeeSignature();
    }

    /**
     * @dev 计算夏普比率 (简化版)
     */
    function _calculateSharpeRatio(uint256 agentId) internal view returns (int256) {
        AgentStatsInternal storage stats = _agentStats[agentId];
        if (stats.totalTrades == 0) return 0;

        // 简化计算: (平均收益 / 总交易数) * 100
        // 实际应用中应该使用更复杂的计算
        return (stats.totalPnL * 100) / int256(stats.totalTrades);
    }

    // ============ Receive ============

    receive() external payable {
        strategyVault.depositFor{value: msg.value}(msg.sender);
        emit FundsDeposited(msg.sender, msg.value);
    }
}
