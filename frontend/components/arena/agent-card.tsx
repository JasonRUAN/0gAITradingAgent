'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Bot, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agentId: number;
  name: string;
  description: string;
  modelProvider: string;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  isActive: boolean;
  index?: number;
}

export function AgentCard({
  agentId,
  name,
  description,
  modelProvider,
  totalPnL,
  winRate,
  totalTrades,
  isActive,
  index = 0,
}: AgentCardProps) {
  const isPositive = totalPnL > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="group"
    >
      <Link href={`/trade?agent=${agentId}`}>
        <div className="glass rounded-xl p-5 card-hover h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card pulse-live" />
                )}
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">{name}</h3>
                <p className="text-xs text-muted-foreground">{modelProvider}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">4.8</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
            {description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <p className={cn(
                'font-bold text-sm',
                isPositive ? 'text-emerald-400' : 'text-red-400'
              )}>
                {isPositive ? '+' : ''}{totalPnL.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">PnL</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <p className="font-bold text-sm">{winRate}%</p>
              <p className="text-xs text-muted-foreground">Win Rate</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <p className="font-bold text-sm">{totalTrades}</p>
              <p className="text-xs text-muted-foreground">Trades</p>
            </div>
          </div>

          {/* Action */}
          <button className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Zap className="h-4 w-4" />
            Start Trading
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

// Agent 卡片网格组件
export function AgentCardGrid({ agents }: { agents: AgentCardProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {agents.map((agent, index) => (
        <AgentCard key={agent.agentId} {...agent} index={index} />
      ))}
    </div>
  );
}

// 模拟 Agent 数据
export const mockAgents: AgentCardProps[] = [
  {
    agentId: 1,
    name: 'Alpha Trader Pro',
    description: '高频趋势跟踪策略，专注于捕捉短期价格动量，采用深度学习模型实时分析市场数据。',
    modelProvider: 'DeepSeek',
    totalPnL: 125680,
    winRate: 78.5,
    totalTrades: 1234,
    isActive: true,
  },
  {
    agentId: 2,
    name: 'Neural Arbitrage',
    description: '跨交易所套利专家，利用神经网络预测价差机会，实现低风险稳定收益。',
    modelProvider: 'Llama',
    totalPnL: 98450,
    winRate: 72.3,
    totalTrades: 987,
    isActive: true,
  },
  {
    agentId: 3,
    name: 'Momentum Master',
    description: '动量交易策略，基于技术指标和市场情绪分析，把握趋势转折点。',
    modelProvider: 'Qwen',
    totalPnL: 87320,
    winRate: 68.9,
    totalTrades: 1567,
    isActive: true,
  },
  {
    agentId: 4,
    name: 'DeepSeek Trader',
    description: '全能型 AI 交易助手，结合基本面和技术面分析，提供全方位交易建议。',
    modelProvider: 'DeepSeek',
    totalPnL: 76890,
    winRate: 71.2,
    totalTrades: 876,
    isActive: false,
  },
];
