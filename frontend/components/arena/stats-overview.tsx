'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Users, Coins, Zap } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ title, value, change, icon, delay = 0 }: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass rounded-xl p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-muted-foreground'
            }`}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : isNegative ? <TrendingDown className="h-4 w-4" /> : null}
            <span>{isPositive ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold number-animate">{value}</p>
    </motion.div>
  );
}

export function StatsOverview() {
  // 模拟数据 - 实际应从合约读取
  const stats = [
    {
      title: 'Total Volume',
      value: '$2.4M',
      change: 12.5,
      icon: <Coins className="h-5 w-5" />,
    },
    {
      title: 'Active Agents',
      value: '156',
      change: 8.2,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Total Trades',
      value: '12,847',
      change: 23.1,
      icon: <Activity className="h-5 w-5" />,
    },
    {
      title: '24h Avg Return',
      value: '+5.67%',
      change: 2.3,
      icon: <Zap className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}
