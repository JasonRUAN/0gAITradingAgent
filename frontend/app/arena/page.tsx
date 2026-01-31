'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SlidersHorizontal,
  ChevronDown,
  Bot,
  TrendingUp,
  Zap,
  Star
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AgentCard, mockAgents } from '@/components/arena/agent-card';
import { AgentDetailDrawer, AgentDetail } from '@/components/arena/agent-detail-drawer';

// 扩展模拟数据
const allAgents = [
  ...mockAgents,
  {
    agentId: 5,
    name: 'Quantum Signals',
    description: '基于量子计算理论的信号预测系统，捕捉微小的市场波动。',
    modelProvider: 'Custom',
    totalPnL: 65430,
    winRate: 65.8,
    totalTrades: 654,
    isActive: true,
  },
  {
    agentId: 6,
    name: 'Mean Reversion Pro',
    description: '均值回归策略专家，在市场超买超卖时精准入场。',
    modelProvider: 'Llama',
    totalPnL: 54320,
    winRate: 62.4,
    totalTrades: 432,
    isActive: true,
  },
  {
    agentId: 7,
    name: 'Sentiment Analyzer',
    description: '实时分析社交媒体和新闻情绪，预测市场走向。',
    modelProvider: 'DeepSeek',
    totalPnL: 43210,
    winRate: 58.9,
    totalTrades: 321,
    isActive: false,
  },
  {
    agentId: 8,
    name: 'Grid Trading Bot',
    description: '网格交易策略，在震荡市场中持续盈利。',
    modelProvider: 'Qwen',
    totalPnL: 32100,
    winRate: 75.2,
    totalTrades: 1890,
    isActive: true,
  },
];

const sortOptions = [
  { value: 'pnl', label: 'Total PnL' },
  { value: 'winRate', label: 'Win Rate' },
  { value: 'trades', label: 'Total Trades' },
  { value: 'recent', label: 'Recently Added' },
];

const riskOptions = [
  { value: 'all', label: 'All Risks' },
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' },
];

const providerOptions = [
  { value: 'all', label: 'All Providers' },
  { value: 'DeepSeek', label: 'DeepSeek' },
  { value: 'Llama', label: 'Llama' },
  { value: 'Qwen', label: 'Qwen' },
  { value: 'Custom', label: 'Custom' },
];

export default function ArenaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('pnl');
  const [riskLevel, setRiskLevel] = useState('all');
  const [provider, setProvider] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentDetail | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAgentClick = (agent: AgentDetail) => {
    setSelectedAgent(agent);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedAgent(null), 300);
  };

  // 过滤和排序逻辑
  const filteredAgents = allAgents
    .filter((agent) => {
      // 搜索过滤
      if (searchQuery && !agent.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // 提供商过滤
      if (provider !== 'all' && agent.modelProvider !== provider) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'pnl':
          return b.totalPnL - a.totalPnL;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'trades':
          return b.totalTrades - a.totalTrades;
        default:
          return b.agentId - a.agentId;
      }
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Bot className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold">AI Agent 市场</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              探索和选择 AI 交易代理，开始你的智能交易之旅
            </motion.p>
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4 mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索 Agent 名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none h-11 px-4 pr-10 rounded-lg bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort by: {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-11 px-4 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                    : 'bg-secondary/50 border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>筛选</span>
              </button>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4"
              >
                {/* Provider Filter */}
                <div className="relative">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="appearance-none h-10 px-4 pr-10 rounded-lg bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none cursor-pointer text-sm"
                  >
                    {providerOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Risk Filter */}
                <div className="relative">
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="appearance-none h-10 px-4 pr-10 rounded-lg bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none cursor-pointer text-sm"
                  >
                    {riskOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Active Only Toggle */}
                <label className="flex items-center gap-2 h-10 px-4 rounded-lg bg-secondary/50 border border-border cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm">仅显示活跃</span>
                </label>
              </motion.div>
            )}
          </motion.div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              找到 <span className="text-foreground font-medium">{filteredAgents.length}</span> 个 Agents
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{allAgents.filter((a) => a.isActive).length} 个活跃</span>
            </div>
          </div>

          {/* Agents Grid */}
          {filteredAgents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAgents.map((agent, index) => (
                <div key={agent.agentId} onClick={() => handleAgentClick(agent as AgentDetail)} className="cursor-pointer">
                  <AgentCard {...agent} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">未找到匹配的 Agent</h3>
              <p className="text-muted-foreground mb-4">
                尝试调整搜索条件或筛选器
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setProvider('all');
                  setRiskLevel('all');
                }}
                className="text-indigo-400 hover:text-indigo-300"
              >
                清除所有筛选
              </button>
            </div>
          )}

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="glass rounded-xl p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均收益率</p>
                <p className="text-2xl font-bold text-emerald-400">+12.4%</p>
              </div>
            </div>
            <div className="glass rounded-xl p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均胜率</p>
                <p className="text-2xl font-bold">68.7%</p>
              </div>
            </div>
            <div className="glass rounded-xl p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">总交易次数</p>
                <p className="text-2xl font-bold">8,961</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Agent Detail Drawer */}
      <AgentDetailDrawer
        agent={selectedAgent}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
