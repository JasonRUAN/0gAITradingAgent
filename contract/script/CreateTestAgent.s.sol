// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {TradingArena} from "../src/TradingArena.sol";

/**
 * @title CreateTestAgent
 * @notice 创建测试 Agent 用于前端演示
 */
contract CreateTestAgent is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // 从环境变量或 deployments.json 读取
        address tradingArenaAddress = vm.envOr(
            "TRADING_ARENA_ADDRESS",
            address(0)
        );

        if (tradingArenaAddress == address(0)) {
            console.log("Error: TRADING_ARENA_ADDRESS not set");
            console.log("Please set it in .env or pass as environment variable");
            return;
        }

        vm.startBroadcast(deployerPrivateKey);

        TradingArena arena = TradingArena(payable(tradingArenaAddress));

        // 创建 4 个测试 Agent
        console.log("Creating test agents...");
        console.log("");

        // Agent 1: Alpha Trader Pro
        uint256 agent1 = arena.registerAgent(
            "Alpha Trader Pro",
            unicode"高频趋势跟踪策略，专注于捕捉短期价格动量，采用深度学习模型实时分析市场数据。",
            "DeepSeek",
            ""
        );
        console.log("Agent 1 created - ID:", agent1);
        console.log("  Name: Alpha Trader Pro");
        console.log("  Provider: DeepSeek");

        // Agent 2: Neural Arbitrage
        uint256 agent2 = arena.registerAgent(
            "Neural Arbitrage",
            unicode"跨交易所套利专家，利用神经网络预测价差机会，实现低风险稳定收益。",
            "Llama",
            ""
        );
        console.log("Agent 2 created - ID:", agent2);
        console.log("  Name: Neural Arbitrage");
        console.log("  Provider: Llama");

        // Agent 3: Momentum Master
        uint256 agent3 = arena.registerAgent(
            "Momentum Master",
            unicode"动量交易策略，基于技术指标和市场情绪分析，把握趋势转折点。",
            "Qwen",
            ""
        );
        console.log("Agent 3 created - ID:", agent3);
        console.log("  Name: Momentum Master");
        console.log("  Provider: Qwen");

        // Agent 4: DeepSeek Trader
        uint256 agent4 = arena.registerAgent(
            "DeepSeek Trader",
            unicode"全能型 AI 交易助手，结合基本面和技术面分析，提供全方位交易建议。",
            "DeepSeek",
            ""
        );
        console.log("Agent 4 created - ID:", agent4);
        console.log("  Name: DeepSeek Trader");
        console.log("  Provider: DeepSeek");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Test Agents Created ===");
        console.log("Total agents created: 4");
        console.log("Agent IDs: 1, 2, 3, 4");
        console.log("");
        console.log("You can now view them in the frontend!");
    }
}
