// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";

/**
 * @title AgentRegistryTest
 * @notice AgentRegistry 合约完整测试套件
 */
contract AgentRegistryTest is Test {
    AgentRegistry public registry;
    
    address public owner;
    address public user1;
    address public user2;
    
    // 测试数据
    string constant AGENT_NAME = "Alpha Trader";
    string constant AGENT_DESC = "AI trading bot";
    string constant MODEL_PROVIDER = "DeepSeek";
    bytes constant METADATA = "{}";
    
    // 事件声明
    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name, string modelProvider, uint256 timestamp);
    event AgentUpdated(uint256 indexed agentId, string name, string description, uint256 timestamp);
    event AgentStatusChanged(uint256 indexed agentId, bool isActive, uint256 timestamp);
    event AgentOwnershipTransferred(uint256 indexed agentId, address indexed previousOwner, address indexed newOwner);
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        registry = new AgentRegistry();
    }
    
    // ============ 注册 Agent 测试 ============
    
    function test_RegisterAgent_Success() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        assertEq(agentId, 1, "First agent ID should be 1");
        
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(agent.id, agentId, "Agent ID mismatch");
        assertEq(agent.owner, user1, "Agent owner mismatch");
        assertEq(agent.name, AGENT_NAME, "Agent name mismatch");
        assertEq(agent.description, AGENT_DESC, "Agent description mismatch");
        assertEq(agent.modelProvider, MODEL_PROVIDER, "Model provider mismatch");
        assertTrue(agent.isActive, "Agent should be active");
        assertEq(agent.createdAt, block.timestamp, "Created timestamp mismatch");
    }
    
    function test_RegisterAgent_EmitsEvent() public {
        vm.expectEmit(true, true, false, true);
        emit AgentRegistered(1, user1, AGENT_NAME, MODEL_PROVIDER, block.timestamp);
        
        vm.prank(user1);
        registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
    }
    
    function test_RegisterAgent_MultipleAgents() public {
        vm.prank(user1);
        uint256 agentId1 = registry.registerAgent("Agent1", "Desc1", "Provider1", METADATA);
        
        vm.prank(user2);
        uint256 agentId2 = registry.registerAgent("Agent2", "Desc2", "Provider2", METADATA);
        
        assertEq(agentId1, 1, "First agent ID should be 1");
        assertEq(agentId2, 2, "Second agent ID should be 2");
        
        assertEq(registry.getTotalAgentCount(), 2, "Total agent count should be 2");
        assertEq(registry.getActiveAgentCount(), 2, "Active agent count should be 2");
    }
    
    function test_RegisterAgent_RevertEmptyName() public {
        vm.expectRevert(AgentRegistry.InvalidAgentName.selector);
        vm.prank(user1);
        registry.registerAgent("", AGENT_DESC, MODEL_PROVIDER, METADATA);
    }
    
    function test_RegisterAgent_RevertLongName() public {
        string memory longName = "ThisIsAVeryLongNameThatExceedsSixtyFourCharactersLimitForAgentNames";
        
        vm.expectRevert(AgentRegistry.InvalidAgentName.selector);
        vm.prank(user1);
        registry.registerAgent(longName, AGENT_DESC, MODEL_PROVIDER, METADATA);
    }
    
    function test_RegisterAgent_RevertEmptyProvider() public {
        vm.expectRevert(AgentRegistry.InvalidModelProvider.selector);
        vm.prank(user1);
        registry.registerAgent(AGENT_NAME, AGENT_DESC, "", METADATA);
    }
    
    function test_RegisterAgent_WhenPaused() public {
        registry.pause();
        
        vm.expectRevert();
        vm.prank(user1);
        registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
    }
    
    // ============ 更新 Agent 测试 ============
    
    function test_UpdateAgent_Success() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        string memory newName = "Updated Name";
        string memory newDesc = "Updated Description";
        bytes memory newMetadata = "{'version': 2}";
        
        // 增加时间以确保 updatedAt > createdAt
        vm.warp(block.timestamp + 1);
        
        vm.prank(user1);
        registry.updateAgent(agentId, newName, newDesc, newMetadata);
        
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(agent.name, newName, "Agent name should be updated");
        assertEq(agent.description, newDesc, "Agent description should be updated");
        assertEq(agent.metadata, newMetadata, "Agent metadata should be updated");
        assertGt(agent.updatedAt, agent.createdAt, "UpdatedAt should be greater than createdAt");
    }
    
    function test_UpdateAgent_EmitsEvent() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        string memory newName = "Updated Name";
        string memory newDesc = "Updated Description";
        
        vm.expectEmit(true, false, false, true);
        emit AgentUpdated(agentId, newName, newDesc, block.timestamp);
        
        vm.prank(user1);
        registry.updateAgent(agentId, newName, newDesc, METADATA);
    }
    
    function test_UpdateAgent_RevertNotOwner() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, agentId, user2));
        vm.prank(user2);
        registry.updateAgent(agentId, "New Name", "New Desc", METADATA);
    }
    
    function test_UpdateAgent_RevertNotFound() public {
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentNotFound.selector, 999));
        vm.prank(user1);
        registry.updateAgent(999, "New Name", "New Desc", METADATA);
    }
    
    // ============ 设置 Agent 状态测试 ============
    
    function test_SetAgentStatus_DeactivateSuccess() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.prank(user1);
        registry.setAgentStatus(agentId, false);
        
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertFalse(agent.isActive, "Agent should be inactive");
        assertEq(registry.getActiveAgentCount(), 0, "Active count should be 0");
    }
    
    function test_SetAgentStatus_ReactivateSuccess() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.prank(user1);
        registry.setAgentStatus(agentId, false);
        
        vm.prank(user1);
        registry.setAgentStatus(agentId, true);
        
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertTrue(agent.isActive, "Agent should be active again");
        assertEq(registry.getActiveAgentCount(), 1, "Active count should be 1");
    }
    
    function test_SetAgentStatus_EmitsEvent() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.expectEmit(true, false, false, true);
        emit AgentStatusChanged(agentId, false, block.timestamp);
        
        vm.prank(user1);
        registry.setAgentStatus(agentId, false);
    }
    
    function test_SetAgentStatus_RevertAlreadyActive() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentAlreadyActive.selector, agentId));
        vm.prank(user1);
        registry.setAgentStatus(agentId, true);
    }
    
    function test_SetAgentStatus_RevertAlreadyInactive() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.prank(user1);
        registry.setAgentStatus(agentId, false);
        
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.AgentAlreadyInactive.selector, agentId));
        vm.prank(user1);
        registry.setAgentStatus(agentId, false);
    }
    
    // ============ 转移所有权测试 ============
    
    function test_TransferOwnership_Success() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.prank(user1);
        registry.transferAgentOwnership(agentId, user2);
        
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(agent.owner, user2, "Agent owner should be user2");
        
        AgentRegistry.Agent[] memory user1Agents = registry.getAgentsByOwner(user1);
        AgentRegistry.Agent[] memory user2Agents = registry.getAgentsByOwner(user2);
        
        assertEq(user1Agents.length, 0, "User1 should have 0 agents");
        assertEq(user2Agents.length, 1, "User2 should have 1 agent");
    }
    
    function test_TransferOwnership_EmitsEvent() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.expectEmit(true, true, true, false);
        emit AgentOwnershipTransferred(agentId, user1, user2);
        
        vm.prank(user1);
        registry.transferAgentOwnership(agentId, user2);
    }
    
    function test_TransferOwnership_RevertZeroAddress() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.expectRevert("Invalid new owner");
        vm.prank(user1);
        registry.transferAgentOwnership(agentId, address(0));
    }
    
    function test_TransferOwnership_RevertNotOwner() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        vm.expectRevert(abi.encodeWithSelector(AgentRegistry.NotAgentOwner.selector, agentId, user2));
        vm.prank(user2);
        registry.transferAgentOwnership(agentId, user2);
    }
    
    // ============ 查询功能测试 ============
    
    function test_GetAgentsByOwner() public {
        vm.startPrank(user1);
        registry.registerAgent("Agent1", "Desc1", "Provider1", METADATA);
        registry.registerAgent("Agent2", "Desc2", "Provider2", METADATA);
        vm.stopPrank();
        
        AgentRegistry.Agent[] memory agents = registry.getAgentsByOwner(user1);
        assertEq(agents.length, 2, "User1 should have 2 agents");
        assertEq(agents[0].name, "Agent1", "First agent name mismatch");
        assertEq(agents[1].name, "Agent2", "Second agent name mismatch");
    }
    
    function test_GetActiveAgents() public {
        vm.prank(user1);
        uint256 agentId1 = registry.registerAgent("Agent1", "Desc1", "Provider1", METADATA);
        
        vm.prank(user2);
        uint256 agentId2 = registry.registerAgent("Agent2", "Desc2", "Provider2", METADATA);
        
        vm.prank(user1);
        registry.setAgentStatus(agentId1, false);
        
        AgentRegistry.Agent[] memory activeAgents = registry.getActiveAgents();
        assertEq(activeAgents.length, 1, "Should have 1 active agent");
        assertEq(activeAgents[0].id, agentId2, "Active agent should be agent2");
    }
    
    function test_AgentExists() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        assertTrue(registry.agentExists(agentId), "Agent should exist");
        assertFalse(registry.agentExists(999), "Non-existent agent should return false");
    }
    
    function test_IsAgentOwner() public {
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(AGENT_NAME, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        assertTrue(registry.isAgentOwner(agentId, user1), "User1 should be owner");
        assertFalse(registry.isAgentOwner(agentId, user2), "User2 should not be owner");
    }
    
    // ============ Admin 功能测试 ============
    
    function test_Pause_Success() public {
        registry.pause();
        assertTrue(registry.paused(), "Contract should be paused");
    }
    
    function test_Unpause_Success() public {
        registry.pause();
        registry.unpause();
        assertFalse(registry.paused(), "Contract should be unpaused");
    }
    
    function test_Pause_RevertNotOwner() public {
        vm.expectRevert();
        vm.prank(user1);
        registry.pause();
    }
    
    // ============ 边界条件测试 ============
    
    function testFuzz_RegisterAgent_ValidName(string memory name) public {
        vm.assume(bytes(name).length > 0 && bytes(name).length <= 64);
        
        vm.prank(user1);
        uint256 agentId = registry.registerAgent(name, AGENT_DESC, MODEL_PROVIDER, METADATA);
        
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        assertEq(agent.name, name, "Agent name should match input");
    }
    
    function test_ActiveAgentsList_RemovalCorrect() public {
        // 创建 5 个 Agent
        uint256[] memory agentIds = new uint256[](5);
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(user1);
            agentIds[i] = registry.registerAgent(
                string(abi.encodePacked("Agent", vm.toString(i))),
                AGENT_DESC,
                MODEL_PROVIDER,
                METADATA
            );
        }
        
        assertEq(registry.getActiveAgentCount(), 5, "Should have 5 active agents");
        
        // 停用中间的 Agent (index 2)
        vm.prank(user1);
        registry.setAgentStatus(agentIds[2], false);
        
        assertEq(registry.getActiveAgentCount(), 4, "Should have 4 active agents");
        
        AgentRegistry.Agent[] memory activeAgents = registry.getActiveAgents();
        assertEq(activeAgents.length, 4, "Active agents array length should be 4");
        
        // 确保被停用的 Agent 不在列表中
        for (uint256 i = 0; i < activeAgents.length; i++) {
            assertTrue(activeAgents[i].id != agentIds[2], "Deactivated agent should not be in active list");
        }
    }
}
