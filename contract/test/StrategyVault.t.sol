// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {StrategyVault} from "../src/StrategyVault.sol";

/**
 * @title StrategyVaultTest
 * @notice StrategyVault 合约完整测试套件
 */
contract StrategyVaultTest is Test {
    StrategyVault public vault;
    
    address public owner;
    address public tradingArena;
    address public user1;
    address public user2;
    
    // 事件声明
    event Deposited(address indexed user, uint256 amount, uint256 newBalance);
    event Withdrawn(address indexed user, uint256 amount, uint256 newBalance);
    event StrategyFundsLocked(uint256 indexed executionId, address indexed user, uint256 amount);
    event StrategyFundsReleased(uint256 indexed executionId, address indexed user, uint256 amount, int256 pnl);
    event PlatformFeeCollected(uint256 amount);
    event TradingArenaUpdated(address indexed newAddress);
    
    function setUp() public {
        owner = address(this);
        tradingArena = makeAddr("tradingArena");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        vault = new StrategyVault();
        vault.setTradingArena(tradingArena);
        
        // 给测试用户转账
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }
    
    // ============ 存款测试 ============
    
    function test_Deposit_Success() public {
        uint256 depositAmount = 1 ether;
        
        vm.prank(user1);
        vault.deposit{value: depositAmount}();
        
        assertEq(vault.balanceOf(user1), depositAmount, "Balance should match deposit");
        assertEq(vault.totalValueLocked(), depositAmount, "TVL should match deposit");
    }
    
    function test_Deposit_EmitsEvent() public {
        uint256 depositAmount = 1 ether;
        
        vm.expectEmit(true, false, false, true);
        emit Deposited(user1, depositAmount, depositAmount);
        
        vm.prank(user1);
        vault.deposit{value: depositAmount}();
    }
    
    function test_Deposit_MultipleDeposits() public {
        vm.startPrank(user1);
        vault.deposit{value: 1 ether}();
        vault.deposit{value: 2 ether}();
        vm.stopPrank();
        
        assertEq(vault.balanceOf(user1), 3 ether, "Balance should be sum of deposits");
        assertEq(vault.totalValueLocked(), 3 ether, "TVL should be sum of deposits");
    }
    
    function test_Deposit_RevertBelowMinimum() public {
        uint256 tooSmall = 0.0001 ether;
        
        vm.expectRevert(
            abi.encodeWithSelector(
                StrategyVault.BelowMinDeposit.selector,
                tooSmall,
                vault.minDeposit()
            )
        );
        vm.prank(user1);
        vault.deposit{value: tooSmall}();
    }
    
    function test_Deposit_WhenPaused() public {
        vault.pause();
        
        vm.expectRevert();
        vm.prank(user1);
        vault.deposit{value: 1 ether}();
    }
    
    function test_Receive_AutoDeposit() public {
        uint256 depositAmount = 1 ether;
        
        vm.prank(user1);
        (bool success, ) = address(vault).call{value: depositAmount}("");
        
        assertTrue(success, "Transfer should succeed");
        assertEq(vault.balanceOf(user1), depositAmount, "Balance should match deposit");
    }
    
    // ============ 提款测试 ============
    
    function test_Withdraw_Success() public {
        uint256 depositAmount = 5 ether;
        uint256 withdrawAmount = 2 ether;
        
        vm.startPrank(user1);
        vault.deposit{value: depositAmount}();
        
        uint256 balanceBefore = user1.balance;
        vault.withdraw(withdrawAmount);
        uint256 balanceAfter = user1.balance;
        vm.stopPrank();
        
        assertEq(vault.balanceOf(user1), depositAmount - withdrawAmount, "Vault balance incorrect");
        assertEq(balanceAfter - balanceBefore, withdrawAmount, "User balance incorrect");
        assertEq(vault.totalValueLocked(), depositAmount - withdrawAmount, "TVL incorrect");
    }
    
    function test_Withdraw_EmitsEvent() public {
        vm.startPrank(user1);
        vault.deposit{value: 5 ether}();
        
        vm.expectEmit(true, false, false, true);
        emit Withdrawn(user1, 2 ether, 3 ether);
        
        vault.withdraw(2 ether);
        vm.stopPrank();
    }
    
    function test_Withdraw_RevertInsufficientBalance() public {
        vm.prank(user1);
        vault.deposit{value: 1 ether}();
        
        vm.expectRevert(
            abi.encodeWithSelector(
                StrategyVault.InsufficientBalance.selector,
                2 ether,
                1 ether
            )
        );
        vm.prank(user1);
        vault.withdraw(2 ether);
    }
    
    function test_Withdraw_RevertWithLockedFunds() public {
        vm.prank(user1);
        vault.deposit{value: 5 ether}();
        
        // 锁定 2 ether (在 50% 限制内: 5 * 50% = 2.5 ether)
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 1, 2 ether);
        
        // 尝试提取 4 ether（可用余额只有 3 ether）
        vm.expectRevert(
            abi.encodeWithSelector(
                StrategyVault.InsufficientAvailableBalance.selector,
                4 ether,
                3 ether
            )
        );
        vm.prank(user1);
        vault.withdraw(4 ether);
    }
    
    // ============ 锁定资金测试 ============
    
    function test_LockFunds_Success() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        uint256 executionId = 1;
        uint256 agentId = 100;
        uint256 lockAmount = 5 ether;
        
        vm.prank(tradingArena);
        vault.lockFunds(executionId, user1, agentId, lockAmount);
        
        StrategyVault.UserPosition memory position = vault.getUserPosition(user1);
        assertEq(position.locked, lockAmount, "Locked amount incorrect");
        assertEq(vault.getAvailableBalance(user1), 5 ether, "Available balance incorrect");
        
        StrategyVault.StrategyPosition memory strategyPos = vault.getStrategyPosition(executionId);
        assertEq(strategyPos.user, user1, "Strategy user incorrect");
        assertEq(strategyPos.agentId, agentId, "Strategy agentId incorrect");
        assertEq(strategyPos.amount, lockAmount, "Strategy amount incorrect");
        assertTrue(strategyPos.isActive, "Strategy should be active");
    }
    
    function test_LockFunds_EmitsEvent() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.expectEmit(true, true, false, true);
        emit StrategyFundsLocked(1, user1, 5 ether);
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
    }
    
    function test_LockFunds_RevertInsufficientAvailable() public {
        vm.prank(user1);
        vault.deposit{value: 5 ether}();
        
        vm.expectRevert(
            abi.encodeWithSelector(
                StrategyVault.InsufficientAvailableBalance.selector,
                10 ether,
                5 ether
            )
        );
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 10 ether);
    }
    
    function test_LockFunds_RevertExceedsMaxPercentage() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        // maxStrategyPercentage = 5000 (50%)
        // 最大允许 5 ether
        vm.expectRevert(
            abi.encodeWithSelector(
                StrategyVault.ExceedsMaxStrategyAmount.selector,
                6 ether,
                5 ether
            )
        );
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 6 ether);
    }
    
    function test_LockFunds_RevertUnauthorized() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.expectRevert(StrategyVault.UnauthorizedCaller.selector);
        vm.prank(user1);
        vault.lockFunds(1, user1, 100, 5 ether);
    }
    
    // ============ 释放资金测试 ============
    
    function test_ReleaseFunds_WithProfit() public {
        // 准备
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
        
        // 释放，盈利 2 ether
        int256 pnl = 2 ether;
        
        vm.prank(tradingArena);
        vault.releaseFunds(1, pnl);
        
        StrategyVault.UserPosition memory position = vault.getUserPosition(user1);
        
        // 计算平台费: 2 ether * 1% = 0.02 ether
        uint256 expectedFee = 0.02 ether;
        uint256 netProfit = 2 ether - expectedFee;
        
        assertEq(position.locked, 0, "Locked should be 0");
        // totalPnL 记录的是扣除平台费后的实际盈亏
        assertEq(position.totalPnL, pnl, "PnL should be original pnl before fee deduction in internal logic");
        assertEq(position.deposited, 10 ether + netProfit, "Deposited incorrect");
        assertEq(vault.accumulatedFees(), expectedFee, "Accumulated fees incorrect");
        
        StrategyVault.StrategyPosition memory strategyPos = vault.getStrategyPosition(1);
        assertFalse(strategyPos.isActive, "Strategy should be inactive");
    }
    
    function test_ReleaseFunds_WithLoss() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
        
        // 释放，亏损 1 ether
        int256 pnl = -1 ether;
        
        vm.prank(tradingArena);
        vault.releaseFunds(1, pnl);
        
        StrategyVault.UserPosition memory position = vault.getUserPosition(user1);
        
        assertEq(position.locked, 0, "Locked should be 0");
        assertEq(position.totalPnL, pnl, "PnL incorrect");
        assertEq(position.deposited, 9 ether, "Deposited should decrease by loss");
        assertEq(vault.accumulatedFees(), 0, "No fees on loss");
    }
    
    function test_ReleaseFunds_NoChange() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
        
        vm.prank(tradingArena);
        vault.releaseFunds(1, 0);
        
        StrategyVault.UserPosition memory position = vault.getUserPosition(user1);
        
        assertEq(position.locked, 0, "Locked should be 0");
        assertEq(position.totalPnL, 0, "PnL should be 0");
        assertEq(position.deposited, 10 ether, "Deposited should not change");
    }
    
    function test_ReleaseFunds_EmitsEvents() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
        
        int256 pnl = 2 ether;
        uint256 expectedFee = 0.02 ether;
        int256 netPnl = int256(2 ether - expectedFee);
        
        vm.expectEmit(true, true, false, true);
        emit StrategyFundsReleased(1, user1, 5 ether, netPnl);
        
        vm.expectEmit(false, false, false, true);
        emit PlatformFeeCollected(expectedFee);
        
        vm.prank(tradingArena);
        vault.releaseFunds(1, pnl);
    }
    
    function test_ReleaseFunds_RevertNotFound() public {
        vm.expectRevert(abi.encodeWithSelector(StrategyVault.StrategyNotFound.selector, 999));
        vm.prank(tradingArena);
        vault.releaseFunds(999, 0);
    }
    
    function test_ReleaseFunds_RevertNotActive() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
        
        vm.prank(tradingArena);
        vault.releaseFunds(1, 0);
        
        // 尝试再次释放
        vm.expectRevert(abi.encodeWithSelector(StrategyVault.StrategyNotActive.selector, 1));
        vm.prank(tradingArena);
        vault.releaseFunds(1, 0);
    }
    
    // ============ 查询功能测试 ============
    
    function test_GetUserActiveStrategies() public {
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.startPrank(tradingArena);
        vault.lockFunds(1, user1, 100, 2 ether);
        vault.lockFunds(2, user1, 101, 3 ether);
        vm.stopPrank();
        
        uint256[] memory activeStrategies = vault.getUserActiveStrategies(user1);
        assertEq(activeStrategies.length, 2, "Should have 2 active strategies");
        assertEq(activeStrategies[0], 1, "First strategy ID incorrect");
        assertEq(activeStrategies[1], 2, "Second strategy ID incorrect");
        assertEq(vault.getUserActiveStrategyCount(user1), 2, "Active count incorrect");
    }
    
    // ============ Admin 功能测试 ============
    
    function test_SetTradingArena_Success() public {
        address newArena = makeAddr("newArena");
        
        vm.expectEmit(true, false, false, false);
        emit TradingArenaUpdated(newArena);
        
        vault.setTradingArena(newArena);
        
        assertEq(vault.tradingArena(), newArena, "Trading arena address incorrect");
    }
    
    function test_SetTradingArena_RevertZeroAddress() public {
        vm.expectRevert(StrategyVault.InvalidAddress.selector);
        vault.setTradingArena(address(0));
    }
    
    function test_SetMinDeposit() public {
        uint256 newMinDeposit = 0.01 ether;
        vault.setMinDeposit(newMinDeposit);
        assertEq(vault.minDeposit(), newMinDeposit, "Min deposit incorrect");
    }
    
    function test_SetMaxStrategyPercentage() public {
        uint256 newPercentage = 7500; // 75%
        vault.setMaxStrategyPercentage(newPercentage);
        assertEq(vault.maxStrategyPercentage(), newPercentage, "Max percentage incorrect");
    }
    
    function test_SetMaxStrategyPercentage_RevertTooHigh() public {
        vm.expectRevert("Invalid percentage");
        vault.setMaxStrategyPercentage(10001);
    }
    
    function test_SetPlatformFeeRate() public {
        uint256 newRate = 200; // 2%
        vault.setPlatformFeeRate(newRate);
        assertEq(vault.platformFeeRate(), newRate, "Fee rate incorrect");
    }
    
    function test_SetPlatformFeeRate_RevertTooHigh() public {
        vm.expectRevert("Fee too high");
        vault.setPlatformFeeRate(1001); // > 10%
    }
    
    function test_WithdrawFees_Success() public {
        // 产生费用
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
        
        vm.prank(tradingArena);
        vault.releaseFunds(1, 2 ether); // 盈利 2 ether，费用 0.02 ether
        
        uint256 expectedFees = 0.02 ether;
        assertEq(vault.accumulatedFees(), expectedFees, "Accumulated fees incorrect");
        
        address feeReceiver = makeAddr("feeReceiver");
        uint256 balanceBefore = feeReceiver.balance;
        
        vault.withdrawFees(feeReceiver);
        
        assertEq(feeReceiver.balance - balanceBefore, expectedFees, "Withdrawn fees incorrect");
        assertEq(vault.accumulatedFees(), 0, "Accumulated fees should be 0");
    }
    
    function test_WithdrawFees_RevertZeroAddress() public {
        vm.expectRevert(StrategyVault.InvalidAddress.selector);
        vault.withdrawFees(address(0));
    }
    
    function test_Pause_Success() public {
        vault.pause();
        assertTrue(vault.paused(), "Should be paused");
    }
    
    function test_Unpause_Success() public {
        vault.pause();
        vault.unpause();
        assertFalse(vault.paused(), "Should be unpaused");
    }
    
    // ============ 复杂场景测试 ============
    
    function test_MultipleUsersAndStrategies() public {
        // User1: 存入 10 ether，锁定 5 ether
        vm.prank(user1);
        vault.deposit{value: 10 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(1, user1, 100, 5 ether);
        
        // User2: 存入 20 ether，锁定 8 ether
        vm.prank(user2);
        vault.deposit{value: 20 ether}();
        
        vm.prank(tradingArena);
        vault.lockFunds(2, user2, 101, 8 ether);
        
        assertEq(vault.totalValueLocked(), 30 ether, "TVL should be 30 ether");
        assertEq(vault.getAvailableBalance(user1), 5 ether, "User1 available balance incorrect");
        assertEq(vault.getAvailableBalance(user2), 12 ether, "User2 available balance incorrect");
        
        // User1 策略完成，盈利 1 ether
        vm.prank(tradingArena);
        vault.releaseFunds(1, 1 ether);
        
        StrategyVault.UserPosition memory position1 = vault.getUserPosition(user1);
        assertGt(position1.deposited, 10 ether, "User1 deposit should increase");
        
        // User2 策略完成，亏损 2 ether
        vm.prank(tradingArena);
        vault.releaseFunds(2, -2 ether);
        
        StrategyVault.UserPosition memory position2 = vault.getUserPosition(user2);
        assertEq(position2.deposited, 18 ether, "User2 deposit should decrease");
    }
    
    function testFuzz_Deposit_ValidAmount(uint96 amount) public {
        vm.assume(amount >= vault.minDeposit() && amount <= 100 ether);
        
        vm.deal(user1, amount);
        vm.prank(user1);
        vault.deposit{value: amount}();
        
        assertEq(vault.balanceOf(user1), amount, "Balance should match deposit");
    }
    
    function testFuzz_WithdrawAll(uint96 depositAmount) public {
        vm.assume(depositAmount >= vault.minDeposit() && depositAmount <= 100 ether);
        
        vm.deal(user1, depositAmount);
        
        vm.startPrank(user1);
        vault.deposit{value: depositAmount}();
        vault.withdraw(depositAmount);
        vm.stopPrank();
        
        assertEq(vault.balanceOf(user1), 0, "Balance should be 0");
    }
}
