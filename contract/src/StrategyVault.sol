// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StrategyVault
 * @notice 策略金库合约 - 管理用户资金托管和策略执行资金
 * @dev 支持存款、提款、策略执行资金管理
 */
contract StrategyVault is Ownable, ReentrancyGuard, Pausable {
    // ============ Structs ============

    struct UserPosition {
        uint256 deposited;
        uint256 locked;      // 策略执行中锁定的资金
        int256 totalPnL;
        uint256 lastUpdated;
    }

    struct StrategyPosition {
        uint256 executionId;
        address user;
        uint256 agentId;
        uint256 amount;
        uint256 startTime;
        bool isActive;
    }

    // ============ State Variables ============

    /// @notice 用户余额映射
    mapping(address => UserPosition) private _userPositions;

    /// @notice 执行 ID => 策略头寸
    mapping(uint256 => StrategyPosition) private _strategyPositions;

    /// @notice 用户 => 活跃策略执行 ID 列表
    mapping(address => uint256[]) private _userActiveStrategies;

    /// @notice Trading Arena 合约地址
    address public tradingArena;

    /// @notice 最小存款金额
    uint256 public minDeposit = 0.001 ether;

    /// @notice 最大单次策略金额 (相对于存款的百分比, 基数 10000)
    uint256 public maxStrategyPercentage = 5000; // 50%

    /// @notice 平台费率 (基数 10000)
    uint256 public platformFeeRate = 100; // 1%

    /// @notice 累计平台费用
    uint256 public accumulatedFees;

    /// @notice 总锁定价值
    uint256 public totalValueLocked;

    // ============ Events ============

    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event StrategyFundsLocked(uint256 indexed executionId, address indexed user, uint256 amount);
    event StrategyFundsReleased(uint256 indexed executionId, address indexed user, uint256 amount, int256 pnl);
    event PlatformFeeCollected(uint256 amount);
    event TradingArenaUpdated(address indexed newAddress);

    // ============ Errors ============

    error InsufficientBalance(uint256 requested, uint256 available);
    error InsufficientAvailableBalance(uint256 requested, uint256 available);
    error BelowMinDeposit(uint256 amount, uint256 minRequired);
    error ExceedsMaxStrategyAmount(uint256 requested, uint256 maxAllowed);
    error StrategyNotFound(uint256 executionId);
    error StrategyNotActive(uint256 executionId);
    error UnauthorizedCaller();
    error InvalidAddress();

    // ============ Modifiers ============

    modifier onlyTradingArena() {
        if (msg.sender != tradingArena) revert UnauthorizedCaller();
        _;
    }

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {}

    // ============ User Functions ============

    /**
     * @notice 存入资金
     */
    function deposit() external payable nonReentrant whenNotPaused {
        if (msg.value < minDeposit) revert BelowMinDeposit(msg.value, minDeposit);

        UserPosition storage position = _userPositions[msg.sender];
        position.deposited += msg.value;
        position.lastUpdated = block.timestamp;

        totalValueLocked += msg.value;

        emit Deposited(msg.sender, msg.value, position.deposited);
    }

    /**
     * @notice 为指定用户存入资金 (仅 TradingArena 调用)
     * @param user 用户地址
     */
    function depositFor(address user) external payable onlyTradingArena nonReentrant {
        if (msg.value < minDeposit) revert BelowMinDeposit(msg.value, minDeposit);
        if (user == address(0)) revert InvalidAddress();

        UserPosition storage position = _userPositions[user];
        position.deposited += msg.value;
        position.lastUpdated = block.timestamp;

        totalValueLocked += msg.value;

        emit Deposited(user, msg.value, position.deposited);
    }

    /**
     * @notice 提取资金
     * @param amount 提取金额
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        _withdrawInternal(msg.sender, amount);
    }

    /**
     * @notice 为指定用户提取资金 (仅 TradingArena 调用)
     * @param user 用户地址
     * @param amount 提取金额
     */
    function withdrawFor(address user, uint256 amount) external onlyTradingArena nonReentrant {
        _withdrawInternal(user, amount);
    }

    /**
     * @dev 内部提取逻辑
     */
    function _withdrawInternal(address user, uint256 amount) private {
        UserPosition storage position = _userPositions[user];
        uint256 available = position.deposited - position.locked;

        if (amount > position.deposited) {
            revert InsufficientBalance(amount, position.deposited);
        }
        if (amount > available) {
            revert InsufficientAvailableBalance(amount, available);
        }

        position.deposited -= amount;
        position.lastUpdated = block.timestamp;

        totalValueLocked -= amount;

        (bool success, ) = user.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(user, amount, position.deposited);
    }

    // ============ Trading Arena Functions ============

    /**
     * @notice 锁定策略执行资金 (仅 TradingArena 调用)
     * @param executionId 执行 ID
     * @param user 用户地址
     * @param agentId Agent ID
     * @param amount 锁定金额
     */
    function lockFunds(
        uint256 executionId,
        address user,
        uint256 agentId,
        uint256 amount
    ) external onlyTradingArena nonReentrant {
        UserPosition storage position = _userPositions[user];
        uint256 available = position.deposited - position.locked;

        if (amount > available) {
            revert InsufficientAvailableBalance(amount, available);
        }

        // 检查最大策略金额
        uint256 maxAmount = (position.deposited * maxStrategyPercentage) / 10000;
        if (amount > maxAmount) {
            revert ExceedsMaxStrategyAmount(amount, maxAmount);
        }

        position.locked += amount;
        position.lastUpdated = block.timestamp;

        _strategyPositions[executionId] = StrategyPosition({
            executionId: executionId,
            user: user,
            agentId: agentId,
            amount: amount,
            startTime: block.timestamp,
            isActive: true
        });

        _userActiveStrategies[user].push(executionId);

        emit StrategyFundsLocked(executionId, user, amount);
    }

    /**
     * @notice 释放策略执行资金并结算盈亏 (仅 TradingArena 调用)
     * @param executionId 执行 ID
     * @param pnl 盈亏
     */
    function releaseFunds(uint256 executionId, int256 pnl) external onlyTradingArena nonReentrant {
        StrategyPosition storage strategyPos = _strategyPositions[executionId];
        if (strategyPos.executionId == 0) revert StrategyNotFound(executionId);
        if (!strategyPos.isActive) revert StrategyNotActive(executionId);

        address user = strategyPos.user;
        uint256 amount = strategyPos.amount;

        UserPosition storage position = _userPositions[user];
        position.locked -= amount;
        position.totalPnL += pnl;
        position.lastUpdated = block.timestamp;

        // 计算并收取平台费 (仅在盈利时)
        uint256 platformFee = 0;
        if (pnl > 0) {
            platformFee = (uint256(pnl) * platformFeeRate) / 10000;
            accumulatedFees += platformFee;
            pnl -= int256(platformFee);
        }

        // 更新用户存款 (根据盈亏)
        if (pnl > 0) {
            position.deposited += uint256(pnl);
            totalValueLocked += uint256(pnl);
        } else if (pnl < 0) {
            uint256 loss = uint256(-pnl);
            if (loss > position.deposited) {
                loss = position.deposited;
            }
            position.deposited -= loss;
            totalValueLocked -= loss;
        }

        strategyPos.isActive = false;

        // 从活跃列表移除
        _removeFromActiveStrategies(user, executionId);

        emit StrategyFundsReleased(executionId, user, amount, pnl);
        if (platformFee > 0) {
            emit PlatformFeeCollected(platformFee);
        }
    }

    // ============ View Functions ============

    /**
     * @notice 获取用户头寸信息
     * @param user 用户地址
     * @return 用户头寸
     */
    function getUserPosition(address user) external view returns (UserPosition memory) {
        return _userPositions[user];
    }

    /**
     * @notice 获取用户可用余额
     * @param user 用户地址
     * @return 可用余额
     */
    function getAvailableBalance(address user) external view returns (uint256) {
        UserPosition storage position = _userPositions[user];
        return position.deposited - position.locked;
    }

    /**
     * @notice 获取用户总余额
     * @param user 用户地址
     * @return 总余额
     */
    function balanceOf(address user) external view returns (uint256) {
        return _userPositions[user].deposited;
    }

    /**
     * @notice 获取策略头寸信息
     * @param executionId 执行 ID
     * @return 策略头寸
     */
    function getStrategyPosition(uint256 executionId) external view returns (StrategyPosition memory) {
        return _strategyPositions[executionId];
    }

    /**
     * @notice 获取用户活跃策略列表
     * @param user 用户地址
     * @return 活跃策略 ID 列表
     */
    function getUserActiveStrategies(address user) external view returns (uint256[] memory) {
        return _userActiveStrategies[user];
    }

    /**
     * @notice 获取用户活跃策略数量
     * @param user 用户地址
     * @return 数量
     */
    function getUserActiveStrategyCount(address user) external view returns (uint256) {
        return _userActiveStrategies[user].length;
    }

    // ============ Admin Functions ============

    /**
     * @notice 设置 TradingArena 合约地址
     * @param _tradingArena 新地址
     */
    function setTradingArena(address _tradingArena) external onlyOwner {
        if (_tradingArena == address(0)) revert InvalidAddress();
        tradingArena = _tradingArena;
        emit TradingArenaUpdated(_tradingArena);
    }

    /**
     * @notice 设置最小存款金额
     * @param _minDeposit 新最小存款金额
     */
    function setMinDeposit(uint256 _minDeposit) external onlyOwner {
        minDeposit = _minDeposit;
    }

    /**
     * @notice 设置最大策略百分比
     * @param _maxStrategyPercentage 新百分比 (基数 10000)
     */
    function setMaxStrategyPercentage(uint256 _maxStrategyPercentage) external onlyOwner {
        require(_maxStrategyPercentage <= 10000, "Invalid percentage");
        maxStrategyPercentage = _maxStrategyPercentage;
    }

    /**
     * @notice 设置平台费率
     * @param _platformFeeRate 新费率 (基数 10000)
     */
    function setPlatformFeeRate(uint256 _platformFeeRate) external onlyOwner {
        require(_platformFeeRate <= 1000, "Fee too high"); // 最高 10%
        platformFeeRate = _platformFeeRate;
    }

    /**
     * @notice 提取平台费用
     * @param to 接收地址
     */
    function withdrawFees(address to) external onlyOwner nonReentrant {
        if (to == address(0)) revert InvalidAddress();
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;

        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
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
     * @dev 从用户活跃策略列表中移除
     */
    function _removeFromActiveStrategies(address user, uint256 executionId) internal {
        uint256[] storage strategies = _userActiveStrategies[user];
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i] == executionId) {
                strategies[i] = strategies[strategies.length - 1];
                strategies.pop();
                break;
            }
        }
    }

    // ============ Receive ============

    receive() external payable {
        // 接收 ETH 时自动存款
        if (msg.value >= minDeposit) {
            UserPosition storage position = _userPositions[msg.sender];
            position.deposited += msg.value;
            position.lastUpdated = block.timestamp;
            totalValueLocked += msg.value;
            emit Deposited(msg.sender, msg.value, position.deposited);
        }
    }
}
