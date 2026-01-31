'use client';

import { useState, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  getBroker,
  resetBroker,
  getAvailableServices,
  getChatbotServices,
  depositFunds,
  getAccountBalance,
  acknowledgeProvider,
  requestInference,
  requestInferenceStream,
  getProviders,
  clearProvidersCache,
} from '@/lib/0g/compute';
import type { InferenceRequest, InferenceResponse } from '@/types';

// 将 wagmi WalletClient 转换为 ethers Signer
const useEthersSigner = () => {
  const { data: walletClient } = useWalletClient();
  
  const getSigner = useCallback(async () => {
    if (!walletClient) return null;
    
    const provider = new BrowserProvider(walletClient.transport);
    return await provider.getSigner();
  }, [walletClient]);

  return { getSigner, walletClient };
};

// 0G Compute Hook
export function use0GCompute() {
  const { address, isConnected } = useAccount();
  const { getSigner } = useEthersSigner();
  const [streamContent, setStreamContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // 获取 Broker 状态
  const brokerQuery = useQuery({
    queryKey: ['0g-compute-broker', address],
    queryFn: async () => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return getBroker(signer);
    },
    enabled: isConnected && !!address,
    staleTime: 5 * 60 * 1000, // 5 分钟
  });

  // 获取可用服务列表
  const servicesQuery = useQuery({
    queryKey: ['0g-compute-services', address],
    queryFn: async () => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return getAvailableServices(signer);
    },
    enabled: isConnected && !!address,
    staleTime: 60 * 1000, // 1 分钟
  });

  // 获取 Chatbot 服务列表
  const chatbotServicesQuery = useQuery({
    queryKey: ['0g-compute-chatbot-services', address],
    queryFn: async () => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return getChatbotServices(signer);
    },
    enabled: isConnected && !!address,
    staleTime: 60 * 1000,
  });

  // 获取账户余额
  const balanceQuery = useQuery({
    queryKey: ['0g-compute-balance', address],
    queryFn: async () => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return getAccountBalance(signer);
    },
    enabled: isConnected && !!address,
    staleTime: 30 * 1000, // 30 秒
  });

  // 获取服务提供商列表
  const providersQuery = useQuery({
    queryKey: ['0g-compute-providers', address],
    queryFn: async () => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return getProviders(signer);
    },
    enabled: isConnected && !!address,
    staleTime: 5 * 60 * 1000,
  });

  // 存入资金 Mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return depositFunds(signer, amount);
    },
    onSuccess: () => {
      balanceQuery.refetch();
    },
  });

  // 授权服务提供商 Mutation
  const acknowledgeMutation = useMutation({
    mutationFn: async (providerAddress: string) => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return acknowledgeProvider(signer, providerAddress);
    },
  });

  // AI 推理请求 Mutation
  const inferenceMutation = useMutation({
    mutationFn: async ({
      providerAddress,
      request,
    }: {
      providerAddress: string;
      request: InferenceRequest;
    }): Promise<InferenceResponse> => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return requestInference(signer, providerAddress, request);
    },
  });

  // 流式 AI 推理请求
  const requestStream = useCallback(
    async (
      providerAddress: string,
      request: InferenceRequest
    ): Promise<InferenceResponse> => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');

      setStreamContent('');
      setIsStreaming(true);

      const response = await requestInferenceStream(
        signer,
        providerAddress,
        request,
        (chunk) => {
          setStreamContent((prev) => prev + chunk);
        }
      );

      setIsStreaming(false);
      return response;
    },
    [getSigner]
  );

  // 重置 Broker (切换钱包时调用)
  const reset = useCallback(() => {
    resetBroker();
    clearProvidersCache();
    brokerQuery.refetch();
  }, [brokerQuery]);

  return {
    // 状态
    isConnected,
    address,
    
    // 查询
    broker: brokerQuery.data,
    brokerLoading: brokerQuery.isLoading,
    services: servicesQuery.data,
    servicesLoading: servicesQuery.isLoading,
    chatbotServices: chatbotServicesQuery.data,
    chatbotServicesLoading: chatbotServicesQuery.isLoading,
    balance: balanceQuery.data,
    balanceLoading: balanceQuery.isLoading,
    providers: providersQuery.data,
    providersLoading: providersQuery.isLoading,

    // Mutations
    deposit: depositMutation.mutate,
    depositAsync: depositMutation.mutateAsync,
    depositing: depositMutation.isPending,
    
    acknowledge: acknowledgeMutation.mutate,
    acknowledgeAsync: acknowledgeMutation.mutateAsync,
    acknowledging: acknowledgeMutation.isPending,

    inference: inferenceMutation.mutate,
    inferenceAsync: inferenceMutation.mutateAsync,
    inferencing: inferenceMutation.isPending,
    inferenceData: inferenceMutation.data,

    // 流式
    requestStream,
    streamContent,
    isStreaming,

    // 工具
    reset,
    refetchBalance: balanceQuery.refetch,
    refetchServices: servicesQuery.refetch,
  };
}
