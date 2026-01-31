// 通用类型定义

// Agent 信息
export interface AgentInfo {
  agentId: bigint;
  owner: `0x${string}`;
  name: string;
  description: string;
  modelProvider: string;
  isActive: boolean;
  createdAt: bigint;
  totalTrades: bigint;
  successfulTrades: bigint;
  totalPnL: bigint;
}

// Agent 统计数据
export interface AgentStats {
  agentId: bigint;
  name: string;
  totalPnL: bigint;
  winRate: bigint;
  totalTrades: bigint;
  sharpeRatio: bigint;
}

// 策略执行记录
export interface StrategyExecution {
  executionId: bigint;
  agentId: bigint;
  user: `0x${string}`;
  amount: bigint;
  storageRootHash: `0x${string}`;
  strategyData: `0x${string}`;
  pnl: bigint;
  timestamp: bigint;
  isCompleted: boolean;
}

// 用户头寸
export interface UserPosition {
  deposited: bigint;
  locked: bigint;
  totalPnL: bigint;
  lastUpdated: bigint;
}

// 策略配置
export interface StrategyConfig {
  agentId: number;
  amount: string;
  riskLevel: 'low' | 'medium' | 'high';
  stopLoss?: number;
  takeProfit?: number;
  maxDuration?: number;
}

// AI 推理请求
export interface InferenceRequest {
  agentId: number;
  prompt: string;
  context?: string;
  parameters?: Record<string, unknown>;
}

// AI 推理响应
export interface InferenceResponse {
  strategyData: string;
  confidence: number;
  reasoning: string;
  teeSignature?: string;
  chatId?: string;
}

// 存储上传结果
export interface StorageUploadResult {
  rootHash: string;
  txHash: string;
  blobId?: string;
}

// 排行榜项
export interface LeaderboardItem {
  rank: number;
  agentId: number;
  name: string;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  sharpeRatio: number;
  change24h?: number;
}

// 交易历史记录
export interface TradeHistory {
  id: string;
  executionId: number;
  agentId: number;
  agentName: string;
  type: 'buy' | 'sell' | 'swap';
  amount: number;
  pnl: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  storageRootHash: string;
  txHash?: string;
}

// 图表数据点
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

// 统计卡片数据
export interface StatCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
}

// 过滤选项
export interface FilterOptions {
  sortBy: 'pnl' | 'winRate' | 'trades' | 'sharpe' | 'recent';
  sortOrder: 'asc' | 'desc';
  riskLevel?: 'low' | 'medium' | 'high' | 'all';
  strategyType?: string;
  minTrades?: number;
  timeRange?: '24h' | '7d' | '30d' | 'all';
}

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// 钱包状态
export interface WalletState {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  chain: {
    id: number;
    name: string;
  } | undefined;
  balance: bigint | undefined;
}
