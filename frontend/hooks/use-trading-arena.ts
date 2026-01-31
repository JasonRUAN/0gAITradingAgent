'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useMutation } from '@tanstack/react-query';
import { TradingArenaABI } from '@/lib/contracts/abi';
import { CONTRACT_ADDRESSES } from '@/lib/constants';
import type { AgentInfo, AgentStats, StrategyExecution } from '@/types';

// Trading Arena 合约 Hook
export function useTradingArena() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, data: writeHash, isPending: isWriting } = useWriteContract();
  
  const contractAddress = CONTRACT_ADDRESSES.tradingArena as `0x${string}`;

  // 等待交易确认
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeHash,
  });

  // 读取活跃 Agents
  const {
    data: activeAgents,
    isLoading: agentsLoading,
    refetch: refetchAgents,
  } = useReadContract({
    address: contractAddress,
    abi: TradingArenaABI,
    functionName: 'getActiveAgents',
  });

  // 读取用户余额
  const {
    data: balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: contractAddress,
    abi: TradingArenaABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // 读取排行榜
  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    refetch: refetchLeaderboard,
  } = useReadContract({
    address: contractAddress,
    abi: TradingArenaABI,
    functionName: 'getLeaderboard',
    args: [BigInt(10)],
  });

  // 读取用户执行历史
  const {
    data: userExecutions,
    isLoading: executionsLoading,
    refetch: refetchExecutions,
  } = useReadContract({
    address: contractAddress,
    abi: TradingArenaABI,
    functionName: 'getUserExecutions',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // 注册 Agent
  const registerAgent = async (params: {
    name: string;
    description: string;
    modelProvider: string;
    metadata?: string;
  }) => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: TradingArenaABI,
      functionName: 'registerAgent',
      args: [
        params.name,
        params.description,
        params.modelProvider,
        params.metadata ? `0x${Buffer.from(params.metadata).toString('hex')}` as `0x${string}` : '0x',
      ],
    });
    return hash;
  };

  // 执行策略
  const executeStrategy = async (params: {
    agentId: number;
    strategyData: string;
    storageRootHash: string;
    teeSignature?: string;
    value?: string;
  }) => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: TradingArenaABI,
      functionName: 'executeStrategy',
      args: [
        BigInt(params.agentId),
        `0x${Buffer.from(params.strategyData).toString('hex')}` as `0x${string}`,
        params.storageRootHash as `0x${string}`,
        params.teeSignature ? params.teeSignature as `0x${string}` : '0x',
      ],
      value: params.value ? parseEther(params.value) : undefined,
    });
    return hash;
  };

  // 完成策略
  const completeStrategy = async (params: {
    executionId: number;
    pnl: string;
  }) => {
    const pnlWei = parseEther(params.pnl);
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: TradingArenaABI,
      functionName: 'completeStrategy',
      args: [BigInt(params.executionId), pnlWei],
    });
    return hash;
  };

  // 存款
  const deposit = async (amount: string) => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: TradingArenaABI,
      functionName: 'deposit',
      value: parseEther(amount),
    });
    return hash;
  };

  // 提款
  const withdraw = async (amount: string) => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: TradingArenaABI,
      functionName: 'withdraw',
      args: [parseEther(amount)],
    });
    return hash;
  };

  // 更新 Agent 状态
  const updateAgentStatus = async (agentId: number, isActive: boolean) => {
    const hash = await writeContractAsync({
      address: contractAddress,
      abi: TradingArenaABI,
      functionName: 'updateAgentStatus',
      args: [BigInt(agentId), isActive],
    });
    return hash;
  };

  return {
    // 状态
    isConnected,
    address,
    isWriting,
    isConfirming,
    isConfirmed,
    writeHash,

    // 读取数据
    activeAgents: activeAgents as AgentInfo[] | undefined,
    agentsLoading,
    balance: balance ? formatEther(balance as bigint) : '0',
    balanceLoading,
    leaderboard: leaderboard as AgentStats[] | undefined,
    leaderboardLoading,
    userExecutions: userExecutions as StrategyExecution[] | undefined,
    executionsLoading,

    // 写入操作
    registerAgent,
    executeStrategy,
    completeStrategy,
    deposit,
    withdraw,
    updateAgentStatus,

    // 刷新
    refetchAgents,
    refetchBalance,
    refetchLeaderboard,
    refetchExecutions,
  };
}

// 读取单个 Agent 信息
export function useAgent(agentId: number | null) {
  const contractAddress = CONTRACT_ADDRESSES.tradingArena as `0x${string}`;

  return useReadContract({
    address: contractAddress,
    abi: TradingArenaABI,
    functionName: 'getAgent',
    args: agentId !== null ? [BigInt(agentId)] : undefined,
    query: {
      enabled: agentId !== null,
    },
  });
}

// 读取单个执行记录
export function useExecution(executionId: number | null) {
  const contractAddress = CONTRACT_ADDRESSES.tradingArena as `0x${string}`;

  return useReadContract({
    address: contractAddress,
    abi: TradingArenaABI,
    functionName: 'getExecution',
    args: executionId !== null ? [BigInt(executionId)] : undefined,
    query: {
      enabled: executionId !== null,
    },
  });
}
