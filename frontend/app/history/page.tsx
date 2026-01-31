'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  Database,
  ExternalLink,
  Download,
  Calendar,
  ChevronDown,
  Bot,
  Shield,
  CheckCircle2
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';

interface HistoryRecord {
  id: string;
  timestamp: number;
  agentId: number;
  agentName: string;
  type: 'buy' | 'sell';
  strategyType: string;
  amount: number;
  pnl: number;
  storageHash: string;
  txHash: string;
  teeVerified: boolean;
}

// 模拟历史数据
const mockHistory: HistoryRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  timestamp: Date.now() - i * 1000 * 60 * 60 * (Math.random() * 12 + 1),
  agentId: [1, 2, 3, 4][Math.floor(Math.random() * 4)],
  agentName: ['Neural Alpha', 'Quant Prime', 'Deep Trader', 'Momentum AI'][Math.floor(Math.random() * 4)],
  type: Math.random() > 0.5 ? 'buy' : 'sell',
  strategyType: ['Trend Following', 'Mean Reversion', 'Arbitrage', 'Scalping'][Math.floor(Math.random() * 4)],
  amount: Math.floor(Math.random() * 5000) + 100,
  pnl: Math.floor(Math.random() * 1000) - 300,
  storageHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  teeVerified: Math.random() > 0.1,
})).sort((a, b) => b.timestamp - a.timestamp);

// 按日期分组
const groupByDate = (records: HistoryRecord[]) => {
  const groups: { [key: string]: HistoryRecord[] } = {};
  
  records.forEach((record) => {
    const date = new Date(record.timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
  });
  
  return groups;
};

function HistoryPageContent() {
  const searchParams = useSearchParams();
  const agentIdParam = searchParams.get('agent');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [dateRange, setDateRange] = useState('all');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // 过滤逻辑
  const filteredHistory = mockHistory.filter((record) => {
    if (agentIdParam && record.agentId !== parseInt(agentIdParam)) return false;
    if (searchQuery && !record.agentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterType !== 'all' && record.type !== filterType) return false;
    return true;
  });

  const groupedHistory = groupByDate(filteredHistory);

  // 导出数据
  const handleExport = (format: 'csv' | 'json') => {
    const data = filteredHistory.map((r) => ({
      时间: new Date(r.timestamp).toLocaleString(),
      Agent: r.agentName,
      类型: r.type === 'buy' ? '买入' : '卖出',
      策略: r.strategyType,
      金额: r.amount,
      收益: r.pnl,
      存证哈希: r.storageHash,
      交易哈希: r.txHash,
    }));

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row) => Object.values(row).join(','));
      content = [headers, ...rows].join('\n');
      filename = 'trading-history.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(data, null, 2);
      filename = 'trading-history.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 计算统计数据
  const totalPnL = filteredHistory.reduce((sum, r) => sum + r.pnl, 0);
  const winCount = filteredHistory.filter((r) => r.pnl > 0).length;
  const winRate = filteredHistory.length > 0 ? Math.round((winCount / filteredHistory.length) * 100) : 0;

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
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Clock className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold">交易历史</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground"
            >
              查看所有策略执行记录，验证存证数据
            </motion.p>
          </div>

          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8"
          >
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">总交易次数</p>
              <p className="text-2xl font-bold">{filteredHistory.length}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">总收益</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString()} USDT
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">胜率</p>
              <p className="text-2xl font-bold">{winRate}%</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">TEE 验证</p>
              <p className="text-2xl font-bold text-emerald-400">
                {filteredHistory.filter((r) => r.teeVerified).length}/{filteredHistory.length}
              </p>
            </div>
          </motion.div>

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

              {/* Filter Type */}
              <div className="flex gap-2">
                {(['all', 'buy', 'sell'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 h-11 rounded-lg border transition-colors ${
                      filterType === type
                        ? type === 'buy'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : type === 'sell'
                          ? 'bg-red-500/10 border-red-500 text-red-400'
                          : 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                        : 'bg-secondary/50 border-border hover:border-muted-foreground'
                    }`}
                  >
                    {type === 'all' ? '全部' : type === 'buy' ? '买入' : '卖出'}
                  </button>
                ))}
              </div>

              {/* Date Range */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none h-11 px-4 pr-10 rounded-lg bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="all">所有时间</option>
                  <option value="today">今天</option>
                  <option value="week">最近一周</option>
                  <option value="month">最近一月</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* Export Button */}
              <div className="relative group">
                <Button variant="outline" className="h-11 gap-2">
                  <Download className="h-4 w-4" />
                  导出
                </Button>
                <div className="absolute top-full right-0 mt-2 py-2 w-32 bg-secondary rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-secondary/80 transition-colors"
                  >
                    导出 CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-secondary/80 transition-colors"
                  >
                    导出 JSON
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Timeline View */}
          <div className="space-y-8">
            {Object.entries(groupedHistory).map(([date, records], dateIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + dateIndex * 0.1 }}
              >
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold">{date}</h2>
                  <span className="text-sm text-muted-foreground">
                    {records.length} 笔交易
                  </span>
                </div>

                {/* Records */}
                <div className="space-y-3 ml-4 border-l-2 border-border pl-6">
                  {records.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-8 top-4 h-3 w-3 rounded-full border-2 ${
                          record.pnl >= 0
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-red-500 border-red-500'
                        }`}
                      />

                      {/* Record Card */}
                      <div
                        className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                          expandedRecord === record.id ? 'ring-2 ring-indigo-500/50' : ''
                        }`}
                        onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-2 rounded-lg ${
                                record.type === 'buy'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {record.type === 'buy' ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{record.agentName}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                                  {record.strategyType}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(record.timestamp).toLocaleTimeString('zh-CN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-medium">${record.amount.toLocaleString()}</p>
                              <p
                                className={`text-sm ${
                                  record.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {record.pnl >= 0 ? '+' : ''}{record.pnl} USDT
                              </p>
                            </div>
                            {record.teeVerified && (
                              <div className="flex items-center gap-1 text-emerald-400">
                                <Shield className="h-4 w-4" />
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedRecord === record.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-border space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                存证哈希
                              </span>
                              <a
                                href={`https://chainscan-galileo.0g.ai/tx/${record.storageHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {record.storageHash.slice(0, 10)}...{record.storageHash.slice(-8)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">交易哈希</span>
                              <a
                                href={`https://chainscan-galileo.0g.ai/tx/${record.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {record.txHash.slice(0, 10)}...{record.txHash.slice(-8)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">TEE 验证</span>
                              <span className={`text-sm ${record.teeVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {record.teeVerified ? '已验证' : '待验证'}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredHistory.length === 0 && (
            <div className="text-center py-20">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无交易记录</h3>
              <p className="text-muted-foreground mb-4">开始使用 AI Agent 进行交易</p>
              <Button asChild>
                <a href="/arena">浏览 Agent 市场</a>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    }>
      <HistoryPageContent />
    </Suspense>
  );
}
