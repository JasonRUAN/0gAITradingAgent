// 0G Chain 网络配置
export const ZEROG_CHAIN = {
  id: 16602,
  name: '0G Testnet',
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
    public: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Chain Scan',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
} as const;

// 0G Mainnet 配置 (预留)
export const ZEROG_MAINNET = {
  id: 16661,
  name: '0G Mainnet',
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc.0g.ai'],
    },
    public: {
      http: ['https://evmrpc.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Chain Scan',
      url: 'https://chainscan.0g.ai',
    },
  },
  testnet: false,
} as const;

// 合约地址配置 (部署后更新)
export const CONTRACT_ADDRESSES = {
  tradingArena: '0x0000000000000000000000000000000000000000',
  agentRegistry: '0x0000000000000000000000000000000000000000',
  strategyVault: '0x0000000000000000000000000000000000000000',
} as const;

// 0G Storage 配置
export const ZEROG_STORAGE = {
  testnet: {
    rpcUrl: 'https://evmrpc-testnet.0g.ai/',
    indexerRpc: 'https://indexer-storage-testnet-turbo.0g.ai',
  },
  mainnet: {
    rpcUrl: 'https://evmrpc.0g.ai/',
    indexerRpc: 'https://indexer-storage-turbo.0g.ai',
  },
} as const;

// 0G Compute 配置
export const ZEROG_COMPUTE = {
  testnet: {
    rpcUrl: 'https://evmrpc-testnet.0g.ai',
  },
  mainnet: {
    rpcUrl: 'https://evmrpc.0g.ai',
  },
} as const;

// 应用配置
export const APP_CONFIG = {
  name: 'AI Trading Arena',
  description: '去中心化 AI 交易竞技场 - 让 AI 交易告别黑盒',
  version: '1.0.0',
  network: 'testnet' as 'testnet' | 'mainnet',
} as const;

// 默认 AI 模型提供商
export const AI_PROVIDERS = [
  { id: 'deepseek', name: 'DeepSeek', description: '高性能大语言模型' },
  { id: 'llama', name: 'Llama', description: 'Meta 开源模型' },
  { id: 'qwen', name: 'Qwen', description: '阿里通义千问' },
  { id: 'custom', name: 'Custom', description: '自定义模型' },
] as const;

// 风险等级
export const RISK_LEVELS = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
} as const;

// 策略类型
export const STRATEGY_TYPES = {
  trend_following: '趋势跟踪',
  arbitrage: '套利',
  mean_reversion: '均值回归',
  momentum: '动量',
  ml_based: 'AI/ML',
} as const;
