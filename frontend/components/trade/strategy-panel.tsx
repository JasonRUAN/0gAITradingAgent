'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Shield, 
  Target,
  AlertTriangle,
  Info,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RISK_LEVELS, STRATEGY_TYPES } from '@/lib/constants';

interface StrategyPanelProps {
  onExecute: (config: StrategyConfig) => void;
  isExecuting: boolean;
  agentName?: string;
}

export interface StrategyConfig {
  amount: number;
  riskLevel: string;
  strategyType: string;
  stopLoss: number;
  takeProfit: number;
  maxSlippage: number;
}

export function StrategyPanel({ onExecute, isExecuting, agentName }: StrategyPanelProps) {
  const [config, setConfig] = useState<StrategyConfig>({
    amount: 100,
    riskLevel: 'medium',
    strategyType: 'trend_following',
    stopLoss: 5,
    takeProfit: 15,
    maxSlippage: 0.5,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecute(config);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">策略配置</h2>
          {agentName && (
            <p className="text-sm text-muted-foreground">
              配置 {agentName} 的交易参数
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Amount Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            交易金额 (USDT)
          </label>
          <div className="relative">
            <input
              type="number"
              value={config.amount}
              onChange={(e) => setConfig({ ...config, amount: Number(e.target.value) })}
              min={10}
              max={100000}
              step={10}
              className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="输入交易金额"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              {[100, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setConfig({ ...config, amount: preset })}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    config.amount === preset
                      ? 'bg-indigo-500 text-white'
                      : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            风险等级
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(RISK_LEVELS).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => setConfig({ ...config, riskLevel: key })}
                className={`p-3 rounded-xl border transition-all ${
                  config.riskLevel === key
                    ? key === 'low'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : key === 'medium'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-red-500/10 border-red-500 text-red-400'
                    : 'bg-secondary/50 border-border hover:border-muted-foreground'
                }`}
              >
                <span className="block text-sm font-medium">{value}</span>
                <span className="block text-xs text-muted-foreground mt-1">
                  {key === 'low' ? '保守' : key === 'medium' ? '平衡' : '激进'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            策略类型
          </label>
          <select
            value={config.strategyType}
            onChange={(e) => setConfig({ ...config, strategyType: e.target.value })}
            className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none cursor-pointer"
          >
            {Object.entries(STRATEGY_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Stop Loss & Take Profit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              止损 (%)
            </label>
            <input
              type="number"
              value={config.stopLoss}
              onChange={(e) => setConfig({ ...config, stopLoss: Number(e.target.value) })}
              min={1}
              max={50}
              step={0.5}
              className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Target className="h-4 w-4 text-emerald-400" />
              止盈 (%)
            </label>
            <input
              type="number"
              value={config.takeProfit}
              onChange={(e) => setConfig({ ...config, takeProfit: Number(e.target.value) })}
              min={1}
              max={100}
              step={0.5}
              className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Max Slippage */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            最大滑点 (%)
          </label>
          <input
            type="range"
            value={config.maxSlippage}
            onChange={(e) => setConfig({ ...config, maxSlippage: Number(e.target.value) })}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0.1%</span>
            <span className="text-indigo-400 font-medium">{config.maxSlippage}%</span>
            <span>5%</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
          <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p>
              策略执行将通过 <span className="text-indigo-400">0G Compute</span> 进行 AI 推理，
              所有调用记录将存证于 <span className="text-indigo-400">0G Storage</span>。
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isExecuting || config.amount < 10}
          className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>执行中...</span>
            </div>
          ) : (
            <span>执行策略</span>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
