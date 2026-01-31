// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AgentRegistry
 * @notice AI Agent 注册表合约
 * @dev 管理 Agent 的注册、元数据存储和所有权
 */
contract AgentRegistry is Ownable, ReentrancyGuard, Pausable {
    // ============ Structs ============

    struct Agent {
        uint256 id;
        address owner;
        string name;
        string description;
        string modelProvider;
        bytes metadata;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }

    // ============ State Variables ============

    /// @notice Agent ID 计数器
    uint256 private _agentIdCounter;

    /// @notice Agent ID => Agent 信息
    mapping(uint256 => Agent) private _agents;

    /// @notice 地址 => 拥有的 Agent IDs
    mapping(address => uint256[]) private _ownerAgents;

    /// @notice 活跃 Agent ID 列表
    uint256[] private _activeAgentIds;

    /// @notice Agent ID => 活跃列表索引
    mapping(uint256 => uint256) private _activeAgentIndex;

    // ============ Events ============

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        string modelProvider,
        uint256 timestamp
    );

    event AgentUpdated(
        uint256 indexed agentId,
        string name,
        string description,
        uint256 timestamp
    );

    event AgentStatusChanged(
        uint256 indexed agentId,
        bool isActive,
        uint256 timestamp
    );

    event AgentOwnershipTransferred(
        uint256 indexed agentId,
        address indexed previousOwner,
        address indexed newOwner
    );

    // ============ Errors ============

    error AgentNotFound(uint256 agentId);
    error NotAgentOwner(uint256 agentId, address caller);
    error InvalidAgentName();
    error InvalidModelProvider();
    error AgentAlreadyActive(uint256 agentId);
    error AgentAlreadyInactive(uint256 agentId);

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {
        _agentIdCounter = 1; // 从 1 开始，0 表示无效
    }

    // ============ External Functions ============

    /**
     * @notice 注册新的 AI Agent
     * @param name Agent 名称
     * @param description Agent 描述
     * @param modelProvider AI 模型提供商
     * @param metadata 额外元数据 (JSON 编码)
     * @return agentId 新注册的 Agent ID
     */
    function registerAgent(
        string calldata name,
        string calldata description,
        string calldata modelProvider,
        bytes calldata metadata
    ) external nonReentrant whenNotPaused returns (uint256 agentId) {
        if (bytes(name).length == 0 || bytes(name).length > 64) {
            revert InvalidAgentName();
        }
        if (bytes(modelProvider).length == 0) {
            revert InvalidModelProvider();
        }

        agentId = _agentIdCounter++;

        Agent storage agent = _agents[agentId];
        agent.id = agentId;
        agent.owner = msg.sender;
        agent.name = name;
        agent.description = description;
        agent.modelProvider = modelProvider;
        agent.metadata = metadata;
        agent.isActive = true;
        agent.createdAt = block.timestamp;
        agent.updatedAt = block.timestamp;

        _ownerAgents[msg.sender].push(agentId);
        
        // 添加到活跃列表
        _activeAgentIndex[agentId] = _activeAgentIds.length;
        _activeAgentIds.push(agentId);

        emit AgentRegistered(agentId, msg.sender, name, modelProvider, block.timestamp);
    }

    /**
     * @notice 更新 Agent 信息
     * @param agentId Agent ID
     * @param name 新名称
     * @param description 新描述
     * @param metadata 新元数据
     */
    function updateAgent(
        uint256 agentId,
        string calldata name,
        string calldata description,
        bytes calldata metadata
    ) external nonReentrant whenNotPaused {
        Agent storage agent = _agents[agentId];
        if (agent.id == 0) revert AgentNotFound(agentId);
        if (agent.owner != msg.sender) revert NotAgentOwner(agentId, msg.sender);
        if (bytes(name).length == 0 || bytes(name).length > 64) revert InvalidAgentName();

        agent.name = name;
        agent.description = description;
        agent.metadata = metadata;
        agent.updatedAt = block.timestamp;

        emit AgentUpdated(agentId, name, description, block.timestamp);
    }

    /**
     * @notice 设置 Agent 激活状态
     * @param agentId Agent ID
     * @param isActive 是否激活
     */
    function setAgentStatus(uint256 agentId, bool isActive) external nonReentrant whenNotPaused {
        Agent storage agent = _agents[agentId];
        if (agent.id == 0) revert AgentNotFound(agentId);
        if (agent.owner != msg.sender) revert NotAgentOwner(agentId, msg.sender);
        
        if (isActive && agent.isActive) revert AgentAlreadyActive(agentId);
        if (!isActive && !agent.isActive) revert AgentAlreadyInactive(agentId);

        agent.isActive = isActive;
        agent.updatedAt = block.timestamp;

        if (isActive) {
            // 添加到活跃列表
            _activeAgentIndex[agentId] = _activeAgentIds.length;
            _activeAgentIds.push(agentId);
        } else {
            // 从活跃列表移除
            _removeFromActiveList(agentId);
        }

        emit AgentStatusChanged(agentId, isActive, block.timestamp);
    }

    /**
     * @notice 转移 Agent 所有权
     * @param agentId Agent ID
     * @param newOwner 新所有者地址
     */
    function transferAgentOwnership(uint256 agentId, address newOwner) external nonReentrant whenNotPaused {
        Agent storage agent = _agents[agentId];
        if (agent.id == 0) revert AgentNotFound(agentId);
        if (agent.owner != msg.sender) revert NotAgentOwner(agentId, msg.sender);
        require(newOwner != address(0), "Invalid new owner");

        address previousOwner = agent.owner;
        agent.owner = newOwner;
        agent.updatedAt = block.timestamp;

        // 更新所有权映射
        _removeFromOwnerList(previousOwner, agentId);
        _ownerAgents[newOwner].push(agentId);

        emit AgentOwnershipTransferred(agentId, previousOwner, newOwner);
    }

    // ============ View Functions ============

    /**
     * @notice 获取 Agent 信息
     * @param agentId Agent ID
     * @return Agent 详细信息
     */
    function getAgent(uint256 agentId) external view returns (Agent memory) {
        if (_agents[agentId].id == 0) revert AgentNotFound(agentId);
        return _agents[agentId];
    }

    /**
     * @notice 获取地址拥有的所有 Agent
     * @param owner 所有者地址
     * @return Agent 列表
     */
    function getAgentsByOwner(address owner) external view returns (Agent[] memory) {
        uint256[] memory agentIds = _ownerAgents[owner];
        Agent[] memory agents = new Agent[](agentIds.length);
        
        for (uint256 i = 0; i < agentIds.length; i++) {
            agents[i] = _agents[agentIds[i]];
        }
        
        return agents;
    }

    /**
     * @notice 获取所有活跃的 Agent
     * @return Agent 列表
     */
    function getActiveAgents() external view returns (Agent[] memory) {
        Agent[] memory agents = new Agent[](_activeAgentIds.length);
        
        for (uint256 i = 0; i < _activeAgentIds.length; i++) {
            agents[i] = _agents[_activeAgentIds[i]];
        }
        
        return agents;
    }

    /**
     * @notice 获取活跃 Agent 数量
     * @return 数量
     */
    function getActiveAgentCount() external view returns (uint256) {
        return _activeAgentIds.length;
    }

    /**
     * @notice 获取总 Agent 数量
     * @return 数量
     */
    function getTotalAgentCount() external view returns (uint256) {
        return _agentIdCounter - 1;
    }

    /**
     * @notice 检查 Agent 是否存在
     * @param agentId Agent ID
     * @return 是否存在
     */
    function agentExists(uint256 agentId) external view returns (bool) {
        return _agents[agentId].id != 0;
    }

    /**
     * @notice 检查地址是否是 Agent 所有者
     * @param agentId Agent ID
     * @param account 地址
     * @return 是否是所有者
     */
    function isAgentOwner(uint256 agentId, address account) external view returns (bool) {
        return _agents[agentId].owner == account;
    }

    // ============ Admin Functions ============

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
     * @dev 从活跃列表中移除 Agent
     */
    function _removeFromActiveList(uint256 agentId) internal {
        uint256 index = _activeAgentIndex[agentId];
        uint256 lastIndex = _activeAgentIds.length - 1;

        if (index != lastIndex) {
            uint256 lastAgentId = _activeAgentIds[lastIndex];
            _activeAgentIds[index] = lastAgentId;
            _activeAgentIndex[lastAgentId] = index;
        }

        _activeAgentIds.pop();
        delete _activeAgentIndex[agentId];
    }

    /**
     * @dev 从所有者列表中移除 Agent
     */
    function _removeFromOwnerList(address owner, uint256 agentId) internal {
        uint256[] storage ownerAgentIds = _ownerAgents[owner];
        for (uint256 i = 0; i < ownerAgentIds.length; i++) {
            if (ownerAgentIds[i] == agentId) {
                ownerAgentIds[i] = ownerAgentIds[ownerAgentIds.length - 1];
                ownerAgentIds.pop();
                break;
            }
        }
    }
}
