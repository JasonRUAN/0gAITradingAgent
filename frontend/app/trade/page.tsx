'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Bot, 
  TrendingUp, 
  Target, 
  Activity,
  Shield,
  ArrowLeft,
  Sparkles,
  Database,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StrategyPanel, StrategyConfig } from '@/components/trade/strategy-panel';
import { ExecutionStatus, ExecutionStep } from '@/components/trade/execution-status';
import { TradeHistory } from '@/components/trade/trade-history';
import { mockAgents } from '@/components/arena/agent-card';

// 扩展模拟 Agent 数据
const allAgents = [
  ...mockAgents,
  {
    agentId: 5,
    name: 'Quantum Signals',
    description: '基于量子计算理论的信号预测系统',
    modelProvider: 'Custom',
    totalPnL: 65430,
    winRate: 65.8,
    totalTrades: 654,
    isActive: true,
  },
];

function TradePageContent() {
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get('agent');
  const agentId = agentIdParam ? parseInt(agentIdParam) : 1;
  
  const [currentStep, setCurrentStep] = useState<ExecutionStep>('idle');
  const [executionData, setExecutionData] = useState<{
    inferenceResult?: string;
    storageHash?: string;
    txHash?: string;
    error?: string;
  }>({});

  const agent = allAgents.find((a) => a.agentId === agentId) || allAgents[0];

  // 模拟策略执行流程
  const handleExecuteStrategy = async (config: StrategyConfig) => {
    setExecutionData({});
    
    // Step 1: Connecting
    setCurrentStep('connecting');
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Step 2: Requesting Inference
    setCurrentStep('requesting_inference');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Step 3: Processing AI
    setCurrentStep('processing_ai');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setExecutionData((prev) => ({
      ...prev,
      inferenceResult: `基于当前市场分析，建议以 ${config.riskLevel === 'high' ? '激进' : config.riskLevel === 'low' ? '保守' : '平衡'} 策略执行 ${config.strategyType === 'trend_following' ? '趋势跟踪' : '套利'} 交易。预计收益率: +${(Math.random() * 10 + 5).toFixed(2)}%`,
    }));

    // Step 4: Uploading to Storage
    setCurrentStep('uploading_storage');
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setExecutionData((prev) => ({
      ...prev,
      storageHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    }));

    // Step 5: Executing Contract
    setCurrentStep('executing_contract');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 6: Verifying TEE
    setCurrentStep('verifying_tee');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setExecutionData((prev) => ({
      ...prev,
      txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
    }));

    // Complete
    setCurrentStep('completed');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Back Button & Title */}
          <div className="mb-8">
            <Link
              href="/arena"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>返回 Agent 市场</span>
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{agent.modelProvider}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-400">Active</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Agent Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total PnL</p>
                <p className={`font-semibold ${agent.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {agent.totalPnL >= 0 ? '+' : ''}{agent.totalPnL.toLocaleString()} USDT
                </p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="font-semibold">{agent.winRate}%</p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Trades</p>
                <p className="font-semibold">{agent.totalTrades.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="glass rounded-xl p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <p className="font-semibold">Medium</p>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Strategy Panel */}
            <div className="lg:col-span-1">
              <StrategyPanel
                onExecute={handleExecuteStrategy}
                isExecuting={currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'failed'}
                agentName={agent.name}
              />

              {/* 0G Technology Stack Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 glass rounded-2xl p-6"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  0G 技术栈
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-cyan-500/10 text-cyan-400">
                      <Cpu className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">0G Compute</p>
                      <p className="text-xs text-muted-foreground">
                        去中心化 GPU 推理，支持 TEE 验证
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-purple-500/10 text-purple-400">
                      <Database className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">0G Storage</p>
                      <p className="text-xs text-muted-foreground">
                        高性能去中心化存储，策略数据永久存证
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">0G Chain</p>
                      <p className="text-xs text-muted-foreground">
                        EVM 兼容智能合约，资金安全托管
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Execution Status & Trade History */}
            <div className="lg:col-span-2 space-y-6">
              <ExecutionStatus
                currentStep={currentStep}
                inferenceResult={executionData.inferenceResult}
                storageHash={executionData.storageHash}
                txHash={executionData.txHash}
                error={executionData.error}
              />

              <TradeHistory agentId={agent.agentId} trades={[]} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <TradePageContent />
    </Suspense>
  );
}
