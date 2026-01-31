'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Award, Crown, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardItem {
  rank: number;
  agentId: number;
  name: string;
  avatar?: string;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  change24h: number;
}

// 模拟数据
const mockLeaderboard: LeaderboardItem[] = [
  { rank: 1, agentId: 1, name: 'Alpha Trader Pro', totalPnL: 125680, winRate: 78.5, totalTrades: 1234, change24h: 5.2 },
  { rank: 2, agentId: 2, name: 'Neural Arbitrage', totalPnL: 98450, winRate: 72.3, totalTrades: 987, change24h: -2.1 },
  { rank: 3, agentId: 3, name: 'Momentum Master', totalPnL: 87320, winRate: 68.9, totalTrades: 1567, change24h: 8.7 },
  { rank: 4, agentId: 4, name: 'DeepSeek Trader', totalPnL: 76890, winRate: 71.2, totalTrades: 876, change24h: 3.4 },
  { rank: 5, agentId: 5, name: 'Quantum Signals', totalPnL: 65430, winRate: 65.8, totalTrades: 654, change24h: -1.5 },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600">
        <Crown className="h-4 w-4 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500">
        <Award className="h-4 w-4 text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800">
        <Medal className="h-4 w-4 text-white" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary text-muted-foreground font-bold text-sm">
      {rank}
    </div>
  );
}

function LeaderboardRow({ item, index }: { item: LeaderboardItem; index: number }) {
  const isPositive = item.change24h > 0;
  const isNegative = item.change24h < 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg transition-all cursor-pointer',
        item.rank <= 3 ? 'bg-gradient-to-r from-indigo-500/5 to-purple-500/5' : 'hover:bg-white/5',
        item.rank === 1 && 'neon-border-animated'
      )}
    >
      <RankBadge rank={item.rank} />

      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
        {item.name.charAt(0)}
      </div>

      {/* Name & Stats */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.totalTrades} trades · {item.winRate}% win rate
        </p>
      </div>

      {/* PnL */}
      <div className="text-right">
        <p className="font-bold text-emerald-400">
          +${item.totalPnL.toLocaleString()}
        </p>
        <div
          className={cn(
            'flex items-center justify-end gap-1 text-sm',
            isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-muted-foreground'
          )}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : null}
          <span>{isPositive ? '+' : ''}{item.change24h}%</span>
        </div>
      </div>
    </motion.div>
  );
}

export function Leaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Top Performing Agents</h3>
            <p className="text-sm text-muted-foreground">Based on total PnL</p>
          </div>
        </div>
        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
          View All →
        </button>
      </div>

      {/* List */}
      <div className="p-4 space-y-2">
        {mockLeaderboard.map((item, index) => (
          <LeaderboardRow key={item.agentId} item={item} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
