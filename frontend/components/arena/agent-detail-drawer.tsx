'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bot, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Clock,
  Shield,
  BarChart3,
  Play,
  Copy,
  ExternalLink,
  Sparkles,
  Cpu,
  Database
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface AgentDetail {
  agentId: number;
  name: string;
  description: string;
  modelProvider: string;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  isActive: boolean;
  owner?: string;
  createdAt?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  strategyType?: string;
  avgHoldingTime?: string;
  maxDrawdown?: number;
  sharpeRatio?: number;
  recentTrades?: {
    timestamp: number;
    type: 'buy' | 'sell';
    amount: number;
    pnl: number;
  }[];
  performanceHistory?: number[];
}

interface AgentDetailDrawerProps {
  agent: AgentDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

// 模拟收益曲线数据
const generatePerformanceData = () => {
  const data = [];
  let value = 100;
  for (let i = 0; i < 30; i++) {
    value += (Math.random() - 0.4) * 10;
    data.push(Math.max(value, 50));
  }
  return data;
};

export function AgentDetailDrawer({ agent, isOpen, onClose }: AgentDetailDrawerProps) {
  if (!agent) return null;

  const performanceData = generatePerformanceData();
  const maxValue = Math.max(...performanceData);
  const minValue = Math.min(...performanceData);
  const range = maxValue - minValue;

  // 模拟最近交易
  const recentTrades = [
    { timestamp: Date.now() - 1000 * 60 * 5, type: 'buy' as const, amount: 1250, pnl: 125 },
    { timestamp: Date.now() - 1000 * 60 * 30, type: 'sell' as const, amount: 890, pnl: -45 },
    { timestamp: Date.now() - 1000 * 60 * 120, type: 'buy' as const, amount: 2100, pnl: 210 },
    { timestamp: Date.now() - 1000 * 60 * 300, type: 'sell' as const, amount: 1500, pnl: 180 },
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-emerald-400 bg-emerald-500/10';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10';
      case 'High':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-background border-l border-border z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">{agent.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{agent.modelProvider}</span>
                    <span className={`h-2 w-2 rounded-full ${agent.isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Description */}
              <div>
                <p className="text-muted-foreground">{agent.description}</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Total PnL</span>
                  </div>
                  <p className={`text-xl font-bold ${agent.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {agent.totalPnL >= 0 ? '+' : ''}{agent.totalPnL.toLocaleString()} USDT
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span>Win Rate</span>
                  </div>
                  <p className="text-xl font-bold">{agent.winRate}%</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>Total Trades</span>
                  </div>
                  <p className="text-xl font-bold">{agent.totalTrades.toLocaleString()}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>Sharpe Ratio</span>
                  </div>
                  <p className="text-xl font-bold">{(agent.sharpeRatio || 1.85).toFixed(2)}</p>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Performance (30D)</h3>
                  <span className={`text-sm ${performanceData[performanceData.length - 1] > performanceData[0] ? 'text-emerald-400' : 'text-red-400'}`}>
                    {performanceData[performanceData.length - 1] > performanceData[0] ? '+' : ''}
                    {((performanceData[performanceData.length - 1] - performanceData[0]) / performanceData[0] * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-32 flex items-end gap-1">
                  {performanceData.map((value, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-sm transition-all hover:opacity-80"
                      style={{
                        height: `${((value - minValue) / range) * 100}%`,
                        minHeight: '4px',
                        background: value >= performanceData[0] 
                          ? 'linear-gradient(to top, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.8))'
                          : 'linear-gradient(to top, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.8))',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Agent Details */}
              <div className="glass rounded-xl p-4 space-y-3">
                <h3 className="font-semibold mb-4">Agent Details</h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Level
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${getRiskColor(agent.riskLevel || 'Medium')}`}>
                    {agent.riskLevel || 'Medium'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Strategy Type
                  </span>
                  <span className="text-sm">{agent.strategyType || 'Trend Following'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Avg Holding Time
                  </span>
                  <span className="text-sm">{agent.avgHoldingTime || '4.5 hours'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="h-4 w-4" />
                    Max Drawdown
                  </span>
                  <span className="text-sm text-red-400">-{agent.maxDrawdown || 12.5}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Model Provider
                  </span>
                  <span className="text-sm">{agent.modelProvider}</span>
                </div>
                
                {agent.owner && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Owner
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{formatAddress(agent.owner)}</span>
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Trades */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Recent Trades</h3>
                  <Link 
                    href={`/history?agent=${agent.agentId}`}
                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    View All
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
                
                <div className="space-y-2">
                  {recentTrades.map((trade, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded ${trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {trade.type === 'buy' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{trade.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">${trade.amount}</p>
                        <p className={`text-xs ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl} USDT
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 0G Verification Info */}
              <div className="glass rounded-xl p-4 border border-indigo-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-indigo-400">0G Verified</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  此 Agent 的所有交易策略均通过 0G Compute TEE 验证，策略数据存证于 0G Storage。
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>TEE 签名验证</span>
                  <span className="mx-2">•</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>DA 层存证</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border p-4 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                关闭
              </Button>
              <Link href={`/trade?agent=${agent.agentId}`} className="flex-1">
                <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <Play className="h-4 w-4 mr-2" />
                  开始交易
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
