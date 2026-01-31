'use client';

import { useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  uploadToStorage,
  downloadFromStorage,
  checkFileExists,
  uploadStrategyData,
  verifyStrategyData,
} from '@/lib/0g/storage';
import type { StorageUploadResult } from '@/types';

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

// 0G Storage Hook
export function use0GStorage() {
  const { address, isConnected } = useAccount();
  const { getSigner } = useEthersSigner();

  // 上传数据 Mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: Uint8Array | string): Promise<StorageUploadResult> => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return uploadToStorage(data, signer);
    },
  });

  // 上传策略数据 Mutation
  const uploadStrategyMutation = useMutation({
    mutationFn: async (strategyData: {
      agentId: number;
      prompt: string;
      response: string;
      timestamp: number;
      signature?: string;
    }): Promise<StorageUploadResult> => {
      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');
      return uploadStrategyData(strategyData, signer);
    },
  });

  // 下载数据
  const download = useCallback(
    async (rootHash: string, withProof: boolean = true): Promise<Uint8Array | null> => {
      return downloadFromStorage(rootHash, undefined, withProof);
    },
    []
  );

  // 下载并解析 JSON 数据
  const downloadJson = useCallback(
    async <T = unknown>(rootHash: string): Promise<T | null> => {
      const data = await downloadFromStorage(rootHash, undefined, true);
      if (!data) return null;
      return JSON.parse(new TextDecoder().decode(data)) as T;
    },
    []
  );

  // 检查文件是否存在
  const checkExists = useCallback(async (rootHash: string): Promise<boolean> => {
    return checkFileExists(rootHash);
  }, []);

  // 验证策略数据
  const verify = useCallback(
    async (rootHash: string, expectedData: object): Promise<boolean> => {
      return verifyStrategyData(rootHash, expectedData);
    },
    []
  );

  // 使用 useQuery 获取存储数据
  const useStorageData = <T = unknown>(rootHash: string | null, enabled: boolean = true) => {
    return useQuery({
      queryKey: ['0g-storage', rootHash],
      queryFn: async () => {
        if (!rootHash) return null;
        const data = await downloadFromStorage(rootHash, undefined, true);
        if (!data) return null;
        return JSON.parse(new TextDecoder().decode(data)) as T;
      },
      enabled: enabled && !!rootHash,
      staleTime: 5 * 60 * 1000, // 5 分钟 (存储数据不会变化)
    });
  };

  return {
    // 状态
    isConnected,
    address,

    // 上传
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    uploading: uploadMutation.isPending,
    uploadResult: uploadMutation.data,
    uploadError: uploadMutation.error,

    // 上传策略数据
    uploadStrategy: uploadStrategyMutation.mutate,
    uploadStrategyAsync: uploadStrategyMutation.mutateAsync,
    uploadingStrategy: uploadStrategyMutation.isPending,
    uploadStrategyResult: uploadStrategyMutation.data,

    // 下载
    download,
    downloadJson,

    // 验证
    checkExists,
    verify,

    // Query Hook
    useStorageData,
  };
}

// 存储数据查询 Hook (独立使用)
export function useStorageQuery<T = unknown>(
  rootHash: string | null,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: ['0g-storage', rootHash],
    queryFn: async () => {
      if (!rootHash) return null;
      const data = await downloadFromStorage(rootHash, undefined, true);
      if (!data) return null;
      return JSON.parse(new TextDecoder().decode(data)) as T;
    },
    enabled: options?.enabled !== false && !!rootHash,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
  });
}

// 存储文件存在性检查 Hook
export function useStorageExists(rootHash: string | null) {
  return useQuery({
    queryKey: ['0g-storage-exists', rootHash],
    queryFn: async () => {
      if (!rootHash) return false;
      return checkFileExists(rootHash);
    },
    enabled: !!rootHash,
    staleTime: 60 * 1000, // 1 分钟
  });
}
