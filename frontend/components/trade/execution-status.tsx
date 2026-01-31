'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  XCircle,
  Bot,
  Database,
  Shield,
  FileText,
  Sparkles
} from 'lucide-react';

export type ExecutionStep = 
  | 'idle'
  | 'connecting'
  | 'requesting_inference'
  | 'processing_ai'
  | 'uploading_storage'
  | 'executing_contract'
  | 'verifying_tee'
  | 'completed'
  | 'failed';

interface ExecutionStatusProps {
  currentStep: ExecutionStep;
  error?: string;
  inferenceResult?: string;
  storageHash?: string;
  txHash?: string;
}

const STEPS = [
  { id: 'connecting', label: '连接 0G Compute', icon: Bot, description: '建立与去中心化推理网络的连接' },
  { id: 'requesting_inference', label: '请求 AI 推理', icon: Sparkles, description: '向 AI 模型发送策略请求' },
  { id: 'processing_ai', label: '处理 AI 响应', icon: Bot, description: '分析市场数据并生成交易策略' },
  { id: 'uploading_storage', label: '上传至 0G Storage', icon: Database, description: '策略数据存证于去中心化存储' },
  { id: 'executing_contract', label: '执行智能合约', icon: FileText, description: '调用 TradingArena 合约执行交易' },
  { id: 'verifying_tee', label: 'TEE 签名验证', icon: Shield, description: '验证 AI 推理结果的可信性' },
];

const stepOrder = ['idle', 'connecting', 'requesting_inference', 'processing_ai', 'uploading_storage', 'executing_contract', 'verifying_tee', 'completed'];

export function ExecutionStatus({ currentStep, error, inferenceResult, storageHash, txHash }: ExecutionStatusProps) {
  const currentIndex = stepOrder.indexOf(currentStep);

  const getStepStatus = (stepId: string) => {
    const stepIndex = stepOrder.indexOf(stepId);
    if (currentStep === 'failed') {
      if (stepIndex < currentIndex) return 'completed';
      if (stepIndex === currentIndex) return 'failed';
      return 'pending';
    }
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex && currentStep !== 'idle' && currentStep !== 'completed') return 'active';
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-semibold">执行状态</h2>
          <p className="text-sm text-muted-foreground">
            {currentStep === 'idle' ? '等待执行策略' : 
             currentStep === 'completed' ? '策略执行完成' : 
             currentStep === 'failed' ? '执行失败' : '正在执行...'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative">
              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-8 transition-colors ${
                    status === 'completed' ? 'bg-emerald-500' : 'bg-border'
                  }`}
                />
              )}

              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all ${
                    status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : status === 'active'
                      ? 'bg-indigo-500/10 border-indigo-500 animate-pulse'
                      : status === 'failed'
                      ? 'bg-red-500/10 border-red-500'
                      : 'bg-secondary border-border'
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : status === 'active' ? (
                    <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                  ) : status === 'failed' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1">
                  <p
                    className={`font-medium transition-colors ${
                      status === 'completed'
                        ? 'text-emerald-400'
                        : status === 'active'
                        ? 'text-indigo-400'
                        : status === 'failed'
                        ? 'text-red-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>

                  {/* Step Details */}
                  {step.id === 'processing_ai' && status === 'completed' && inferenceResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 rounded-lg bg-secondary/50 text-sm"
                    >
                      <p className="text-xs text-muted-foreground mb-1">AI 策略建议:</p>
                      <p className="text-foreground">{inferenceResult}</p>
                    </motion.div>
                  )}

                  {step.id === 'uploading_storage' && status === 'completed' && storageHash && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 rounded-lg bg-secondary/50"
                    >
                      <p className="text-xs text-muted-foreground mb-1">存证 Root Hash:</p>
                      <p className="text-xs font-mono text-emerald-400 break-all">{storageHash}</p>
                    </motion.div>
                  )}

                  {step.id === 'verifying_tee' && status === 'completed' && txHash && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 p-3 rounded-lg bg-secondary/50"
                    >
                      <p className="text-xs text-muted-foreground mb-1">交易哈希:</p>
                      <p className="text-xs font-mono text-emerald-400 break-all">{txHash}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Display */}
      {currentStep === 'failed' && error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="font-medium text-red-400">执行失败</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Display */}
      {currentStep === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-medium text-emerald-400">策略执行成功</p>
              <p className="text-sm text-muted-foreground mt-1">
                交易已完成，所有数据已存证至 0G 网络
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
