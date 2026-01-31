'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Bot,
  Target,
  Activity,
  MoreVertical,
  Plus,
  Minus,
  X,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Position {
  agentId: number;
  agentName: string;
  modelProvider: string;
  depositedAmount: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  winRate: number;
  totalTrades: number;
  isActive: boolean;
}

interface PositionCardProps {
  position: Position;
  onDeposit: (agentId: number) => void;
  onWithdraw: (agentId: number) => void;
  onClose: (agentId: number) => void;
}

export function PositionCard({ position, onDeposit, onWithdraw, onClose }: PositionCardProps) {
  const isProfitable = position.pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-indigo-500/5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">{position.agentName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{position.modelProvider}</span>
              <span className={`h-2 w-2 rounded-full ${position.isActive ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative group">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="absolute top-full right-0 mt-1 py-2 w-36 bg-secondary rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            <button
              onClick={() => onDeposit(position.agentId)}
              className="w-full px-4 py-2 text-sm text-left hover:bg-secondary/80 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              加仓
            </button>
            <button
              onClick={() => onWithdraw(position.agentId)}
              className="w-full px-4 py-2 text-sm text-left hover:bg-secondary/80 flex items-center gap-2 transition-colors"
            >
              <Minus className="h-4 w-4" />
              减仓
            </button>
            <button
              onClick={() => onClose(position.agentId)}
              className="w-full px-4 py-2 text-sm text-left text-red-400 hover:bg-secondary/80 flex items-center gap-2 transition-colors"
            >
              <X className="h-4 w-4" />
              平仓
            </button>
          </div>
        </div>
      </div>

      {/* Value Display */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">当前价值</p>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl font-bold">
            ${position.currentValue.toLocaleString()}
          </span>
          <span
            className={`flex items-center gap-1 text-sm ${
              isProfitable ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isProfitable ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isProfitable ? '+' : ''}{position.pnlPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">投入</p>
          <p className="font-medium text-sm">${position.depositedAmount.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">盈亏</p>
          <p className={`font-medium text-sm ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfitable ? '+' : ''}{position.pnl.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50">
          <p className="text-xs text-muted-foreground mb-1">胜率</p>
          <p className="font-medium text-sm">{position.winRate}%</p>
        </div>
      </div>

      {/* Mini Chart (placeholder) */}
      <div className="h-12 flex items-end gap-0.5 mb-4">
        {Array.from({ length: 20 }, (_, i) => {
          const height = 20 + Math.random() * 80;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all"
              style={{
                height: `${height}%`,
                background: isProfitable
                  ? 'linear-gradient(to top, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.6))'
                  : 'linear-gradient(to top, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.6))',
              }}
            />
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={`/trade?agent=${position.agentId}`} className="flex-1">
          <Button variant="outline" className="w-full text-sm">
            交易
          </Button>
        </Link>
        <Link href={`/history?agent=${position.agentId}`} className="flex-1">
          <Button variant="outline" className="w-full text-sm gap-1">
            历史
            <ExternalLink className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
