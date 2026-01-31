'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  BarChart3,
  Settings,
  Plus,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PositionCard } from '@/components/trade/position-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 模拟持仓数据
const mockPositions = [
  {
    agentId: 1,
    agentName: 'Neural Alpha',
    modelProvider: 'DeepSeek',
    depositedAmount: 5000,
    currentValue: 5850,
    pnl: 850,
    pnlPercent: 17.0,
    winRate: 72.5,
    totalTrades: 156,
    isActive: true,
  },
  {
    agentId: 2,
    agentName: 'Quant Prime',
    modelProvider: 'Llama',
    depositedAmount: 3000,
    currentValue: 3240,
    pnl: 240,
    pnlPercent: 8.0,
    winRate: 68.3,
    totalTrades: 89,
    isActive: true,
  },
  {
    agentId: 3,
    agentName: 'Deep Trader',
    modelProvider: 'Qwen',
    depositedAmount: 2000,
    currentValue: 1850,
    pnl: -150,
    pnlPercent: -7.5,
    winRate: 55.2,
    totalTrades: 67,
    isActive: false,
  },
];

// 模拟收益曲线数据
const generateProfitHistory = (days: number) => {
  const data = [];
  let value = 10000;
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const change = (Math.random() - 0.45) * 300;
    value += change;
    data.push({
      date: new Date(now - i * 24 * 60 * 60 * 1000),
      value: Math.max(value, 5000),
    });
  }
  return data;
};

export default function MyAgentsPage() {
  const [positions] = useState(mockPositions);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const profitHistory = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return generateProfitHistory(days);
  }, [timeRange]);

  // 计算汇总数据
  const totalDeposited = positions.reduce((sum, p) => sum + p.depositedAmount, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
  const totalPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
  const totalPnLPercent = ((totalValue - totalDeposited) / totalDeposited) * 100;
  const activePositions = positions.filter((p) => p.isActive).length;

  // 图表数据处理
  const chartMax = Math.max(...profitHistory.map((d) => d.value));
  const chartMin = Math.min(...profitHistory.map((d) => d.value));
  const chartRange = chartMax - chartMin;

  const handleDeposit = (agentId: number) => {
    console.log('Deposit to agent:', agentId);
  };

  const handleWithdraw = (agentId: number) => {
    console.log('Withdraw from agent:', agentId);
  };

  const handleClose = (agentId: number) => {
    console.log('Close position for agent:', agentId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Wallet className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">我的 Agent</h1>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground"
              >
                管理你的 AI 交易代理持仓
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-3"
            >
              <Button variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                刷新
              </Button>
              <Link href="/arena">
                <Button className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                  <Plus className="h-4 w-4" />
                  添加 Agent
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Portfolio Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass rounded-2xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">总资产价值</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  实时更新
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">${totalValue.toLocaleString()}</span>
                <span
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm ${
                    totalPnL >= 0
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {totalPnL >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {totalPnL >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                投入本金: ${totalDeposited.toLocaleString()}
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <p className="text-sm text-muted-foreground">总收益</p>
              </div>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()} USDT
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                本周 +${Math.floor(totalPnL * 0.3).toLocaleString()}
              </p>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-indigo-400" />
                <p className="text-sm text-muted-foreground">活跃策略</p>
              </div>
              <p className="text-2xl font-bold">{activePositions}/{positions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {positions.reduce((sum, p) => sum + p.totalTrades, 0)} 笔历史交易
              </p>
            </div>
          </motion.div>

          {/* Profit Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold">收益曲线</h2>
                  <p className="text-sm text-muted-foreground">Portfolio Value Over Time</p>
                </div>
              </div>

              {/* Time Range Selector */}
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      timeRange === range
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/50'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 w-16 flex flex-col justify-between text-xs text-muted-foreground">
                <span>${(chartMax / 1000).toFixed(1)}k</span>
                <span>${((chartMax + chartMin) / 2000).toFixed(1)}k</span>
                <span>${(chartMin / 1000).toFixed(1)}k</span>
              </div>

              {/* Chart Area */}
              <div className="absolute left-16 right-0 top-0 bottom-8">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(99, 102, 241)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area fill */}
                  <path
                    d={`
                      M 0 ${100 - ((profitHistory[0].value - chartMin) / chartRange) * 100}
                      ${profitHistory
                        .map(
                          (d, i) =>
                            `L ${(i / (profitHistory.length - 1)) * 100} ${
                              100 - ((d.value - chartMin) / chartRange) * 100
                            }`
                        )
                        .join(' ')}
                      L 100 100
                      L 0 100
                      Z
                    `}
                    fill="url(#chartGradient)"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      transform: 'scale(1, 1)',
                      transformOrigin: '0 0',
                    }}
                  />

                  {/* Line */}
                  <path
                    d={`
                      M 0 ${100 - ((profitHistory[0].value - chartMin) / chartRange) * 100}
                      ${profitHistory
                        .map(
                          (d, i) =>
                            `L ${(i / (profitHistory.length - 1)) * 100} ${
                              100 - ((d.value - chartMin) / chartRange) * 100
                            }`
                        )
                        .join(' ')}
                    `}
                    fill="none"
                    stroke="rgb(99, 102, 241)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      transform: 'scale(1, 1)',
                      transformOrigin: '0 0',
                    }}
                  />
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="absolute left-16 right-0 bottom-0 flex justify-between text-xs text-muted-foreground">
                <span>{profitHistory[0].date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                <span>
                  {profitHistory[Math.floor(profitHistory.length / 2)].date.toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span>
                  {profitHistory[profitHistory.length - 1].date.toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Positions Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">持仓列表</h2>
              <span className="px-2 py-1 text-xs rounded-full bg-secondary text-muted-foreground">
                {positions.length} 个 Agent
              </span>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              管理
            </Button>
          </div>

          {/* Positions Grid */}
          {positions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((position, index) => (
                <motion.div
                  key={position.agentId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <PositionCard
                    position={position}
                    onDeposit={handleDeposit}
                    onWithdraw={handleWithdraw}
                    onClose={handleClose}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无持仓</h3>
              <p className="text-muted-foreground mb-4">开始选择 AI Agent 进行投资</p>
              <Link href="/arena">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  浏览 Agent 市场
                </Button>
              </Link>
            </div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <Link href="/arena" className="block">
              <div className="glass rounded-xl p-6 hover:bg-secondary/30 transition-colors cursor-pointer group">
                <Plus className="h-8 w-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">添加新 Agent</h3>
                <p className="text-sm text-muted-foreground">浏览市场，选择新的 AI 交易代理</p>
              </div>
            </Link>
            <Link href="/history" className="block">
              <div className="glass rounded-xl p-6 hover:bg-secondary/30 transition-colors cursor-pointer group">
                <Calendar className="h-8 w-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">查看历史</h3>
                <p className="text-sm text-muted-foreground">浏览所有交易记录和存证数据</p>
              </div>
            </Link>
            <div className="glass rounded-xl p-6 hover:bg-secondary/30 transition-colors cursor-pointer group">
              <Settings className="h-8 w-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">账户设置</h3>
              <p className="text-sm text-muted-foreground">管理钱包连接和通知偏好</p>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
