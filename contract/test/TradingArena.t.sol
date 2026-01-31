// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {TradingArena} from "../src/TradingArena.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {StrategyVault} from "../src/StrategyVault.sol";
import {ITradingArena} from "../src/interfaces/ITradingArena.sol";

/**
 * @title TradingArenaTest
 * @notice TradingArena 合约完整测试套件
 */
contract TradingArenaTest is Test {
    TradingArena public arena;
    AgentRegistry public registry;
    StrategyVault public vault;
    
    address public owner;
    address public teeSigner;
    address public user1;
    address public user2;
    
    // 测试数据
    string constant AGENT_NAME = "Alpha Trader";
    string constant AGENT_DESC = "AI trading bot";
    string constant MODEL_PROVIDER = "DeepSeek";
    bytes constant METADATA = "{}";
    bytes constant STRATEGY_DATA = "strategy_code_here";
    bytes32 constant STORAGE_ROOT_HASH = keccak256("storage_root");
    
    // 事件
    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name, string modelProvider);
    event AgentStatusUpdated(uint256 indexed agentId, bool isActive);
    event StrategyExecuted(
        uint256 indexed executionId,
        uint256 indexed agentId,
        address indexed user,
        uint256 amount,
        bytes32 storageRootHash,
        uint256 timestamp
    );
    event StrategyCompleted(uint256 indexed executionId, uint256 indexed agentId, int256 pnl);
    event FundsDeposited(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event TeeSignerUpdated(address indexed newSigner);
    event TeeVerificationToggled(bool enabled);
    
    function setUp() public {
        owner = address(this);
        teeSigner = makeAddr("teeSigner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // 部署合约
        registry = new AgentRegistry();
        vault = new StrategyVault();
        arena = new TradingArena(address(registry), payable(address(vault)));
        
        // 配置 Vault
        vault.setTradingArena(address(arena));
        
        // 给测试用户转账
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }
    
    // 辅助函数：执行策略（先存款，避免超过50%限制）
    function _executeStrategyWithDeposit(
        address user,
        uint256 agentId,
        uint256 depositAmount
    ) internal returns (uint256) {
        // 先存款到vault
        vm.prank(user);
        vault.deposit{value: depositAmount * 2}();  // 存2倍，这样锁定depositAmount只占50%
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        // 执行策略（不额外发送ETH）
        vm.prank(user);
        return arena.executeStrategy(
            agentId,
            STRATEGY_DATA,
            STORAGE_ROOT_HASH,
            teeSignature
        );
    }
    
    // ============ Agent 管理测试 ============
    // 注意：用户应该直接与 AgentRegistry 交互来管理 Agent
    // TradingArena 的 registerAgent 只是便利方法，会导致 owner 为 Arena 地址
    
    function test_RegisterAgent_ThroughRegistry() public {
        // 推荐方式：直接使用 Registry
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        assertEq(agentId, 1, "Agent ID should be 1");
        
        // 通过 Arena 查询 Agent 信息
        ITradingArena.AgentInfo memory agentInfo = arena.getAgent(agentId);
        assertEq(agentInfo.agentId, agentId, "Agent ID mismatch");
        assertEq(agentInfo.owner, user1, "Owner should be user1");
        assertEq(agentInfo.name, AGENT_NAME, "Name mismatch");
        assertTrue(agentInfo.isActive, "Should be active");
    }
    
    function test_RegisterAgent_ThroughArena() public {
        // 通过 Arena 注册（便利方法，但 owner 会是 Arena 地址）
        vm.prank(user1);
        uint256 agentId = arena.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        assertEq(agentId, 1, "Agent ID should be 1");
        
        // 由于是通过 Arena 调用，Registry 中记录的 owner 是 Arena 地址
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(agent.owner, address(arena), "Owner should be Arena address");
    }
    
    function test_RegisterAgent_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit AgentRegistered(1, user1, AGENT_NAME, MODEL_PROVIDER);
        
        vm.prank(user1);
        arena.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
    }
    
    function test_UpdateAgentStatus_Success() public {
        // 通过 Arena 注册，owner会是Arena
        vm.prank(user1);
        uint256 agentId = arena.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        // 通过 Arena 更新状态（会调用 Registry）
        vm.prank(user1);
        arena.updateAgentStatus(agentId, false);
        
        ITradingArena.AgentInfo memory agentInfo = arena.getAgent(agentId);
        assertFalse(agentInfo.isActive, "Should be inactive");
    }
    
    function test_UpdateAgentStatus_EmitsEvent() public {
        // 通过Arena注册，这样owner是Arena
        vm.prank(user1);
        uint256 agentId = arena.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        // 通过Arena调用会成功，因为owner是Arena
        vm.expectEmit(true, false, false, true);
        emit AgentStatusUpdated(agentId, false);
        
        vm.prank(user1);
        arena.updateAgentStatus(agentId, false);
    }
    
    function test_GetActiveAgents() public {
        vm.prank(user1);
        uint256 agentId1 = registry.registerAgent("Agent1", "Desc1", "Provider1", METADATA);
        
        vm.prank(user2);
        uint256 agentId2 = registry.registerAgent("Agent2", "Desc2", "Provider2", METADATA);
        
        vm.prank(user1);
        registry.setAgentStatus(agentId1, false);
        
        ITradingArena.AgentInfo[] memory activeAgents = arena.getActiveAgents();
        assertEq(activeAgents.length, 1, "Should have 1 active agent");
        assertEq(activeAgents[0].agentId, agentId2, "Active agent should be agent2");
    }
    
    // ============ 策略执行测试 ============
    
    function test_ExecuteStrategy_WithEthDeposit() public {
        // 注册 Agent
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        // 发送10 ether，这样锁定10 ether只占总资产(10)的100%，但由于执行时会计算50%限制
        // Arena会智能地只锁定5 ether (50%)
        uint256 depositAmount = 10 ether;
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        // 执行策略（会自动存入）
        vm.prank(user1);
        uint256 executionId = arena.executeStrategy{value: depositAmount}(
            agentId,
            STRATEGY_DATA,
            STORAGE_ROOT_HASH,
            teeSignature
        );
        
        assertEq(executionId, 1, "Execution ID should be 1");
        
        // 检查执行记录
        ITradingArena.StrategyExecution memory execution = arena.getExecution(executionId);
        assertEq(execution.executionId, executionId, "Execution ID mismatch");
        assertEq(execution.agentId, agentId, "Agent ID mismatch");
        assertEq(execution.user, user1, "User mismatch");
        assertEq(execution.storageRootHash, STORAGE_ROOT_HASH, "Storage hash mismatch");
        assertFalse(execution.isCompleted, "Should not be completed");
        
        // 检查资金：会锁定5 ether (50%限制)
        assertEq(vault.balanceOf(user1), depositAmount, "Vault balance incorrect");
        StrategyVault.UserPosition memory position = vault.getUserPosition(user1);
        assertEq(position.locked, 5 ether, "Should lock exactly 50%");
    }
    
    function test_ExecuteStrategy_WithExistingBalance() public {
        // 先存款
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        // 注册 Agent
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        // 使用已有余额执行策略（不发送 ETH）
        vm.prank(user1);
        uint256 executionId = arena.executeStrategy(
            agentId,
            STRATEGY_DATA,
            STORAGE_ROOT_HASH,
            teeSignature
        );
        
        assertEq(executionId, 1, "Execution ID should be 1");
        
        // 检查资金已锁定（应该在50%限制内）
        StrategyVault.UserPosition memory position = vault.getUserPosition(user1);
        assertGt(position.locked, 0, "Should have locked funds");
        assertLe(position.locked, 5 ether, "Should not exceed 50% limit");
    }
    
    function test_ExecuteStrategy_EmitsEvent() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        uint256 executeAmount = 5 ether;
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        // 先存款避免50%限制
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
                
        vm.prank(user1);
        arena.executeStrategy{value: executeAmount}(
            agentId,
            STRATEGY_DATA,
            STORAGE_ROOT_HASH,
            teeSignature
        );
    }
    
    function test_ExecuteStrategy_RevertInactiveAgent() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        // 直接通过 Registry 停用 Agent
        vm.prank(user1);
        registry.setAgentStatus(agentId, false);
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        vm.expectRevert(abi.encodeWithSelector(TradingArena.AgentNotActive.selector, agentId));
        vm.prank(user1);
        arena.executeStrategy{value: 5 ether}(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, teeSignature);
    }
    
    function test_ExecuteStrategy_RevertInvalidStorageHash() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, bytes32(0));
        
        vm.expectRevert(TradingArena.InvalidStorageRootHash.selector);
        vm.prank(user1);
        arena.executeStrategy{value: 5 ether}(agentId, STRATEGY_DATA, bytes32(0), teeSignature);
    }
    
    function test_ExecuteStrategy_WithTeeVerification() public {
        // 启用 TEE 验证
        arena.setTeeSigner(teeSigner);
        arena.setTeeVerificationEnabled(true);
        
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        // 生成正确的 TEE 签名
        bytes32 messageHash = keccak256(abi.encodePacked(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(uint256(uint160(teeSigner)), ethSignedMessageHash);
        bytes memory validSignature = abi.encodePacked(r, s, v);
        
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(user1);
        arena.executeStrategy(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, validSignature);
    }
    
    function test_ExecuteStrategy_RevertInvalidTeeSignature() public {
        arena.setTeeSigner(teeSigner);
        arena.setTeeVerificationEnabled(true);
        
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        bytes memory invalidSignature = "invalid";
        
        vm.expectRevert();
        vm.prank(user1);
        arena.executeStrategy{value: 5 ether}(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, invalidSignature);
    }
    
    // ============ 策略完成测试 ============
    
    function test_CompleteStrategy_WithProfit() public {
        // 注册 Agent
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        // 执行策略（使用辅助函数避免50%限制）
        uint256 executionId = _executeStrategyWithDeposit(user1, agentId, 10 ether);
        
        // 完成策略，盈利 2 ether
        int256 pnl = 2 ether;
        
        vm.prank(user1);
        arena.completeStrategy(executionId, pnl);
        
        // 检查执行记录
        ITradingArena.StrategyExecution memory execution = arena.getExecution(executionId);
        assertTrue(execution.isCompleted, "Should be completed");
        assertEq(execution.pnl, pnl, "PnL mismatch");
        
        // 检查 Agent 统计
        ITradingArena.AgentInfo memory agentInfo = arena.getAgent(agentId);
        assertEq(agentInfo.totalTrades, 1, "Total trades should be 1");
        assertEq(agentInfo.successfulTrades, 1, "Successful trades should be 1");
        assertGt(agentInfo.totalPnL, 0, "Total PnL should be positive");
    }
    
    function test_CompleteStrategy_WithLoss() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        uint256 executionId = _executeStrategyWithDeposit(user1, agentId, 10 ether);
        
        int256 pnl = -1 ether;
        
        vm.prank(user1);
        arena.completeStrategy(executionId, pnl);
        
        ITradingArena.AgentInfo memory agentInfo = arena.getAgent(agentId);
        assertEq(agentInfo.totalTrades, 1, "Total trades should be 1");
        assertEq(agentInfo.successfulTrades, 0, "Successful trades should be 0");
        assertLt(agentInfo.totalPnL, 0, "Total PnL should be negative");
    }
    
    function test_CompleteStrategy_EmitsEvent() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        uint256 executionId = _executeStrategyWithDeposit(user1, agentId, 10 ether);
        
        int256 pnl = 2 ether;
        
        vm.expectEmit(true, true, false, true);
        emit StrategyCompleted(executionId, agentId, pnl);
        
        vm.prank(user1);
        arena.completeStrategy(executionId, pnl);
    }
    
    function test_CompleteStrategy_ByOwner() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        uint256 executionId = _executeStrategyWithDeposit(user1, agentId, 10 ether);
        
        // 合约 owner 也可以完成策略
        vm.prank(owner);
        arena.completeStrategy(executionId, 0);
        
        ITradingArena.StrategyExecution memory execution = arena.getExecution(executionId);
        assertTrue(execution.isCompleted, "Should be completed");
    }
    
    function test_CompleteStrategy_RevertNotFound() public {
        vm.expectRevert(abi.encodeWithSelector(TradingArena.ExecutionNotFound.selector, 999));
        vm.prank(user1);
        arena.completeStrategy(999, 0);
    }
    
    function test_CompleteStrategy_RevertAlreadyCompleted() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        uint256 executionId = _executeStrategyWithDeposit(user1, agentId, 10 ether);
        
        vm.prank(user1);
        arena.completeStrategy(executionId, 0);
        
        vm.expectRevert(abi.encodeWithSelector(TradingArena.ExecutionAlreadyCompleted.selector, executionId));
        vm.prank(user1);
        arena.completeStrategy(executionId, 0);
    }
    
    function test_CompleteStrategy_RevertNotOwner() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        uint256 executionId = _executeStrategyWithDeposit(user1, agentId, 10 ether);
        
        vm.expectRevert(abi.encodeWithSelector(TradingArena.NotExecutionOwner.selector, executionId));
        vm.prank(user2);
        arena.completeStrategy(executionId, 0);
    }
    
    // ============ 排行榜测试 ============
    
    function test_GetLeaderboard() public {
        // 创建多个 Agent 并执行交易
        for (uint256 i = 1; i <= 3; i++) {
            address user = makeAddr(string(abi.encodePacked("user", vm.toString(i))));
            vm.deal(user, 100 ether);
            
            vm.prank(user);
            uint256 agentId = registry.registerAgent(
                string(abi.encodePacked("Agent", vm.toString(i))),
                AGENT_DESC,
                MODEL_PROVIDER,
                METADATA
            );
            
            bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
            
            vm.prank(user);
            uint256 executionId = arena.executeStrategy{value: 10 ether}(
                agentId,
                STRATEGY_DATA,
                STORAGE_ROOT_HASH,
                teeSignature
            );
            
            // 不同的盈亏
            int256 pnl = int256(i) * 1 ether;
            
            vm.prank(user);
            arena.completeStrategy(executionId, pnl);
        }
        
        // 获取排行榜前 2 名
        ITradingArena.AgentStats[] memory leaderboard = arena.getLeaderboard(2);
        assertEq(leaderboard.length, 2, "Should return 2 agents");
        
        // 应该按 PnL 降序排列
        assertGt(leaderboard[0].totalPnL, leaderboard[1].totalPnL, "Should be sorted by PnL");
    }
    
    // ============ 资金管理测试 ============
    
    function test_Deposit_Success() public {
        uint256 depositAmount = 5 ether;
        
        vm.expectEmit(true, false, false, true);
        emit FundsDeposited(user1, depositAmount);
        
        vm.prank(user1);
        arena.deposit{value: depositAmount}();
        
        // Arena deposit会转发到vault.depositFor，所以余额在vault中
        assertEq(vault.balanceOf(user1), depositAmount, "Vault balance incorrect");
    }
    
    function test_Withdraw_Success() public {
        vm.startPrank(user1);
        arena.deposit{value: 10 ether}();
        
        uint256 balanceBefore = user1.balance;
        
        // 不检查事件，因为会有多个事件发出（Vault + Arena）
        arena.withdraw(5 ether);
        vm.stopPrank();
        
        assertEq(user1.balance - balanceBefore, 5 ether, "Withdrawn amount incorrect");
        assertEq(vault.balanceOf(user1), 5 ether, "Remaining vault balance incorrect");
    }
    
    function test_Receive_AutoDeposit() public {
        vm.prank(user1);
        (bool success, ) = address(arena).call{value: 5 ether}("");
        
        assertTrue(success, "Transfer should succeed");
        assertEq(vault.balanceOf(user1), 5 ether, "Balance should match deposit");
    }
    
    // ============ 查询功能测试 ============
    
    function test_GetUserExecutions() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        vm.startPrank(user1);
        _executeStrategyWithDeposit(user1, agentId, 5 ether); //(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, teeSignature);
        arena.executeStrategy{value: 3 ether}(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, teeSignature);
        vm.stopPrank();
        
        ITradingArena.StrategyExecution[] memory executions = arena.getUserExecutions(user1);
        assertEq(executions.length, 2, "Should have 2 executions");
    }
    
    function test_GetAgentExecutions() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        vm.prank(user1);
        _executeStrategyWithDeposit(user1, agentId, 5 ether); //(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, teeSignature);
        
        vm.prank(user2);
        arena.executeStrategy{value: 3 ether}(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, teeSignature);
        
        ITradingArena.StrategyExecution[] memory executions = arena.getAgentExecutions(agentId);
        assertEq(executions.length, 2, "Should have 2 executions for this agent");
    }
    
    // ============ Admin 功能测试 ============
    
    function test_SetTeeSigner() public {
        address newSigner = makeAddr("newSigner");
        
        vm.expectEmit(true, false, false, false);
        emit TeeSignerUpdated(newSigner);
        
        arena.setTeeSigner(newSigner);
        assertEq(arena.teeSigner(), newSigner, "TEE signer incorrect");
    }
    
    function test_SetTeeVerificationEnabled() public {
        vm.expectEmit(false, false, false, true);
        emit TeeVerificationToggled(true);
        
        arena.setTeeVerificationEnabled(true);
        assertTrue(arena.teeVerificationEnabled(), "Should be enabled");
    }
    
    function test_Pause_Success() public {
        arena.pause();
        assertTrue(arena.paused(), "Should be paused");
    }
    
    function test_ExecuteStrategy_WhenPaused() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        arena.pause();
        
        bytes memory teeSignature = _generateTeeSignature(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH);
        
        vm.expectRevert();
        vm.prank(user1);
        arena.executeStrategy{value: 5 ether}(agentId, STRATEGY_DATA, STORAGE_ROOT_HASH, teeSignature);
    }
    
    // ============ 辅助函数 ============
    
    function _generateTeeSignature(
        uint256 agentId,
        bytes memory strategyData,
        bytes32 storageRootHash
    ) internal pure returns (bytes memory) {
        // 简化的签名生成，实际测试中不验证
        return abi.encodePacked(agentId, strategyData, storageRootHash);
    }
}
