// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITradingArena
 * @notice AI Trading Arena 主合约接口
 * @dev 定义 Agent 管理、策略执行、排行榜等核心功能
 */
interface ITradingArena {
    // ============ Structs ============

    /// @notice Agent 基本信息
    struct AgentInfo {
        uint256 agentId;
        address owner;
        string name;
        string description;
        string modelProvider;
        bool isActive;
        uint256 createdAt;
        uint256 totalTrades;
        uint256 successfulTrades;
        int256 totalPnL;
    }

    /// @notice Agent 统计数据
    struct AgentStats {
        uint256 agentId;
        string name;
        int256 totalPnL;
        uint256 winRate;
        uint256 totalTrades;
        int256 sharpeRatio;
    }

    /// @notice 策略执行记录
    struct StrategyExecution {
        uint256 executionId;
        uint256 agentId;
        address user;
        uint256 amount;
        bytes32 storageRootHash;
        bytes strategyData;
        int256 pnl;
        uint256 timestamp;
        bool isCompleted;
    }

    // ============ Events ============

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        string modelProvider
    );

    event AgentStatusUpdated(
        uint256 indexed agentId,
        bool isActive
    );

    event StrategyExecuted(
        uint256 indexed executionId,
        uint256 indexed agentId,
        address indexed user,
        uint256 amount,
        bytes32 storageRootHash,
        uint256 timestamp
    );

    event StrategyCompleted(
        uint256 indexed executionId,
        uint256 indexed agentId,
        int256 pnl
    );

    event FundsDeposited(
        address indexed user,
        uint256 amount
    );

    event FundsWithdrawn(
        address indexed user,
        uint256 amount
    );

    // ============ Agent Management ============

    /**
     * @notice 注册新的 AI Agent
     * @param name Agent 名称
     * @param description Agent 描述
     * @param modelProvider AI 模型提供商
     * @param metadata 额外元数据
     * @return agentId 新注册的 Agent ID
     */
    function registerAgent(
        string calldata name,
        string calldata description,
        string calldata modelProvider,
        bytes calldata metadata
    ) external returns (uint256 agentId);

    /**
     * @notice 更新 Agent 状态
     * @param agentId Agent ID
     * @param isActive 是否激活
     */
    function updateAgentStatus(uint256 agentId, bool isActive) external;

    /**
     * @notice 获取 Agent 信息
     * @param agentId Agent ID
     * @return Agent 详细信息
     */
    function getAgent(uint256 agentId) external view returns (AgentInfo memory);

    /**
     * @notice 获取所有活跃的 Agents
     * @return 活跃 Agent 列表
     */
    function getActiveAgents() external view returns (AgentInfo[] memory);

    // ============ Strategy Execution ============

    /**
     * @notice 执行交易策略
     * @param agentId Agent ID
     * @param strategyData 策略数据
     * @param storageRootHash 0G Storage 存证哈希
     * @param teeSignature TEE 签名
     */
    function executeStrategy(
        uint256 agentId,
        bytes calldata strategyData,
        bytes32 storageRootHash,
        bytes calldata teeSignature
    ) external payable returns (uint256 executionId);

    /**
     * @notice 完成策略执行并结算
     * @param executionId 执行 ID
     * @param pnl 盈亏
     */
    function completeStrategy(uint256 executionId, int256 pnl) external;

    /**
     * @notice 获取执行记录
     * @param executionId 执行 ID
     * @return 执行详情
     */
    function getExecution(uint256 executionId) external view returns (StrategyExecution memory);

    /**
     * @notice 获取用户的执行历史
     * @param user 用户地址
     * @return 执行记录列表
     */
    function getUserExecutions(address user) external view returns (StrategyExecution[] memory);

    // ============ Leaderboard ============

    /**
     * @notice 获取排行榜
     * @param limit 返回数量限制
     * @return 排名靠前的 Agent 统计数据
     */
    function getLeaderboard(uint256 limit) external view returns (AgentStats[] memory);

    // ============ Fund Management ============

    /**
     * @notice 存入资金
     */
    function deposit() external payable;

    /**
     * @notice 提取资金
     * @param amount 提取金额
     */
    function withdraw(uint256 amount) external;

    /**
     * @notice 获取用户余额
     * @param user 用户地址
     * @return 用户余额
     */
    function balanceOf(address user) external view returns (uint256);
}
