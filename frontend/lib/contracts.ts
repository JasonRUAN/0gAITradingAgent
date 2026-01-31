import { CONTRACT_ADDRESSES } from './constants';

// Trading Arena 合约 ABI
export const TRADING_ARENA_ABI = [
  // ============ Agent Management ============
  {
    type: 'function',
    name: 'registerAgent',
    inputs: [
      { name: 'name', type: 'string', internalType: 'string' },
      { name: 'description', type: 'string', internalType: 'string' },
      { name: 'modelProvider', type: 'string', internalType: 'string' },
      { name: 'metadata', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: 'agentId', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateAgentStatus',
    inputs: [
      { name: 'agentId', type: 'uint256', internalType: 'uint256' },
      { name: 'isActive', type: 'bool', internalType: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAgent',
    inputs: [{ name: 'agentId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ITradingArena.AgentInfo',
        components: [
          { name: 'agentId', type: 'uint256', internalType: 'uint256' },
          { name: 'owner', type: 'address', internalType: 'address' },
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'description', type: 'string', internalType: 'string' },
          { name: 'modelProvider', type: 'string', internalType: 'string' },
          { name: 'isActive', type: 'bool', internalType: 'bool' },
          { name: 'createdAt', type: 'uint256', internalType: 'uint256' },
          { name: 'totalTrades', type: 'uint256', internalType: 'uint256' },
          { name: 'successfulTrades', type: 'uint256', internalType: 'uint256' },
          { name: 'totalPnL', type: 'int256', internalType: 'int256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getActiveAgents',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct ITradingArena.AgentInfo[]',
        components: [
          { name: 'agentId', type: 'uint256', internalType: 'uint256' },
          { name: 'owner', type: 'address', internalType: 'address' },
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'description', type: 'string', internalType: 'string' },
          { name: 'modelProvider', type: 'string', internalType: 'string' },
          { name: 'isActive', type: 'bool', internalType: 'bool' },
          { name: 'createdAt', type: 'uint256', internalType: 'uint256' },
          { name: 'totalTrades', type: 'uint256', internalType: 'uint256' },
          { name: 'successfulTrades', type: 'uint256', internalType: 'uint256' },
          { name: 'totalPnL', type: 'int256', internalType: 'int256' },
        ],
      },
    ],
    stateMutability: 'view',
  },

  // ============ Strategy Execution ============
  {
    type: 'function',
    name: 'executeStrategy',
    inputs: [
      { name: 'agentId', type: 'uint256', internalType: 'uint256' },
      { name: 'strategyData', type: 'bytes', internalType: 'bytes' },
      { name: 'storageRootHash', type: 'bytes32', internalType: 'bytes32' },
      { name: 'teeSignature', type: 'bytes', internalType: 'bytes' },
    ],
    outputs: [{ name: 'executionId', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'completeStrategy',
    inputs: [
      { name: 'executionId', type: 'uint256', internalType: 'uint256' },
      { name: 'pnl', type: 'int256', internalType: 'int256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getExecution',
    inputs: [{ name: 'executionId', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct ITradingArena.StrategyExecution',
        components: [
          { name: 'executionId', type: 'uint256', internalType: 'uint256' },
          { name: 'agentId', type: 'uint256', internalType: 'uint256' },
          { name: 'user', type: 'address', internalType: 'address' },
          { name: 'amount', type: 'uint256', internalType: 'uint256' },
          { name: 'storageRootHash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'strategyData', type: 'bytes', internalType: 'bytes' },
          { name: 'pnl', type: 'int256', internalType: 'int256' },
          { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
          { name: 'isCompleted', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserExecutions',
    inputs: [{ name: 'user', type: 'address', internalType: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct ITradingArena.StrategyExecution[]',
        components: [
          { name: 'executionId', type: 'uint256', internalType: 'uint256' },
          { name: 'agentId', type: 'uint256', internalType: 'uint256' },
          { name: 'user', type: 'address', internalType: 'address' },
          { name: 'amount', type: 'uint256', internalType: 'uint256' },
          { name: 'storageRootHash', type: 'bytes32', internalType: 'bytes32' },
          { name: 'strategyData', type: 'bytes', internalType: 'bytes' },
          { name: 'pnl', type: 'int256', internalType: 'int256' },
          { name: 'timestamp', type: 'uint256', internalType: 'uint256' },
          { name: 'isCompleted', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },

  // ============ Leaderboard ============
  {
    type: 'function',
    name: 'getLeaderboard',
    inputs: [{ name: 'limit', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        internalType: 'struct ITradingArena.AgentStats[]',
        components: [
          { name: 'agentId', type: 'uint256', internalType: 'uint256' },
          { name: 'name', type: 'string', internalType: 'string' },
          { name: 'totalPnL', type: 'int256', internalType: 'int256' },
          { name: 'winRate', type: 'uint256', internalType: 'uint256' },
          { name: 'totalTrades', type: 'uint256', internalType: 'uint256' },
          { name: 'sharpeRatio', type: 'int256', internalType: 'int256' },
        ],
      },
    ],
    stateMutability: 'view',
  },

  // ============ Fund Management ============
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'withdraw',
    inputs: [{ name: 'amount', type: 'uint256', internalType: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'user', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  // ============ Events ============
  {
    type: 'event',
    name: 'AgentRegistered',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'modelProvider', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AgentStatusUpdated',
    inputs: [
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'isActive', type: 'bool', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'StrategyExecuted',
    inputs: [
      { name: 'executionId', type: 'uint256', indexed: true },
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'storageRootHash', type: 'bytes32', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'StrategyCompleted',
    inputs: [
      { name: 'executionId', type: 'uint256', indexed: true },
      { name: 'agentId', type: 'uint256', indexed: true },
      { name: 'pnl', type: 'int256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FundsDeposited',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FundsWithdrawn',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;

// TypeScript 类型定义
export interface AgentInfo {
  agentId: bigint;
  owner: string;
  name: string;
  description: string;
  modelProvider: string;
  isActive: boolean;
  createdAt: bigint;
  totalTrades: bigint;
  successfulTrades: bigint;
  totalPnL: bigint;
}

export interface AgentStats {
  agentId: bigint;
  name: string;
  totalPnL: bigint;
  winRate: bigint;
  totalTrades: bigint;
  sharpeRatio: bigint;
}

export interface StrategyExecution {
  executionId: bigint;
  agentId: bigint;
  user: string;
  amount: bigint;
  storageRootHash: string;
  strategyData: string;
  pnl: bigint;
  timestamp: bigint;
  isCompleted: boolean;
}

// 合约地址配置（从 constants 导入）
export const CONTRACTS = {
  TRADING_ARENA: CONTRACT_ADDRESSES.tradingArena,
  AGENT_REGISTRY: CONTRACT_ADDRESSES.agentRegistry,
  STRATEGY_VAULT: CONTRACT_ADDRESSES.strategyVault,
} as const;
