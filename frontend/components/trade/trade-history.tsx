'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, ExternalLink, Database } from 'lucide-react';
import Link from 'next/link';

interface Trade {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  pnl: number;
  storageHash?: string;
  txHash?: string;
}

interface TradeHistoryProps {
  trades: Trade[];
  agentId?: number;
}

const mockTrades: Trade[] = [
  {
    id: '1',
    timestamp: Date.now() - 1000 * 60 * 5,
    type: 'buy',
    amount: 1250,
    price: 42350.5,
    pnl: 125,
    storageHash: '0x7a8f...3d2e',
    txHash: '0xabc123...def456',
  },
  {
    id: '2',
    timestamp: Date.now() - 1000 * 60 * 30,
    type: 'sell',
    amount: 890,
    price: 42280.0,
    pnl: -45,
    storageHash: '0x9b2c...8f1a',
    txHash: '0x123abc...456def',
  },
  {
    id: '3',
    timestamp: Date.now() - 1000 * 60 * 120,
    type: 'buy',
    amount: 2100,
    price: 42500.25,
    pnl: 210,
    storageHash: '0x4e6d...7c3b',
    txHash: '0xdef456...abc123',
  },
  {
    id: '4',
    timestamp: Date.now() - 1000 * 60 * 300,
    type: 'sell',
    amount: 1500,
    price: 42420.0,
    pnl: 180,
    storageHash: '0x1f3a...9d4e',
    txHash: '0x456def...123abc',
  },
  {
    id: '5',
    timestamp: Date.now() - 1000 * 60 * 600,
    type: 'buy',
    amount: 3200,
    price: 42150.75,
    pnl: 320,
    storageHash: '0x8c2e...5a1f',
    txHash: '0x789ghi...012jkl',
  },
];

export function TradeHistory({ trades = mockTrades, agentId }: TradeHistoryProps) {
  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold">交易历史</h2>
            <p className="text-sm text-muted-foreground">最近执行的交易记录</p>
          </div>
        </div>
        <Link 
          href={agentId ? `/history?agent=${agentId}` : '/history'}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          查看全部
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {trades.map((trade, index) => (
          <motion.div
            key={trade.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    trade.type === 'buy'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {trade.type === 'buy' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">{trade.type}</span>
                    <span className="text-sm text-muted-foreground">
                      @ ${trade.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(trade.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium">${trade.amount.toLocaleString()}</p>
                <p
                  className={`text-sm ${
                    trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl} USDT
                </p>
              </div>
            </div>

            {/* Verification Info - Shows on hover */}
            {trade.storageHash && (
              <div className="mt-3 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Database className="h-3.5 w-3.5 text-indigo-400" />
                  <span>存证哈希:</span>
                  <span className="font-mono text-indigo-400">{trade.storageHash}</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">总交易</p>
          <p className="text-lg font-semibold">{trades.length}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">胜率</p>
          <p className="text-lg font-semibold">
            {Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">总收益</p>
          <p className={`text-lg font-semibold ${
            trades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trades.reduce((sum, t) => sum + t.pnl, 0) >= 0 ? '+' : ''}
            {trades.reduce((sum, t) => sum + t.pnl, 0)} USDT
          </p>
        </div>
      </div>
    </motion.div>
  );
}
