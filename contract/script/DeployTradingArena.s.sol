// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {AgentRegistry} from "../src/AgentRegistry.sol";
import {StrategyVault} from "../src/StrategyVault.sol";
import {TradingArena} from "../src/TradingArena.sol";

/**
 * @title DeployTradingArena
 * @notice 部署 AI Trading Arena 合约到 0G Chain
 */
contract DeployTradingArena is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署 AgentRegistry
        AgentRegistry agentRegistry = new AgentRegistry();
        console.log("AgentRegistry deployed at:", address(agentRegistry));

        // 2. 部署 StrategyVault
        StrategyVault strategyVault = new StrategyVault();
        console.log("StrategyVault deployed at:", address(strategyVault));

        // 3. 部署 TradingArena
        TradingArena tradingArena = new TradingArena(
            address(agentRegistry),
            payable(address(strategyVault))
        );
        console.log("TradingArena deployed at:", address(tradingArena));

        // 4. 设置 TradingArena 地址到 StrategyVault
        strategyVault.setTradingArena(address(tradingArena));
        console.log("StrategyVault.tradingArena set to:", address(tradingArena));

        vm.stopBroadcast();

        console.log("=== Deployment Complete ===");
        console.log("AgentRegistry:", address(agentRegistry));
        console.log("StrategyVault:", address(strategyVault));
        console.log("TradingArena:", address(tradingArena));
    }
}
