import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { ZEROG_STORAGE, APP_CONFIG } from '@/lib/constants';

// 获取当前网络配置
const getStorageConfig = () => {
  const network = APP_CONFIG.network;
  return ZEROG_STORAGE[network];
};

// 创建 Indexer 实例
export const createIndexer = () => {
  const config = getStorageConfig();
  return new Indexer(config.indexerRpc);
};

// 上传数据到 0G Storage
export const uploadToStorage = async (
  data: Uint8Array | string,
  signer: ethers.Signer
): Promise<{ rootHash: string; txHash: string }> => {
  const config = getStorageConfig();
  const indexer = createIndexer();

  // 将字符串转换为 Uint8Array
  const dataBytes = typeof data === 'string' 
    ? new TextEncoder().encode(data) 
    : data;

  // 创建文件对象
  const file = await ZgFile.fromBuffer(dataBytes);

  // 获取 Merkle Tree 和 Root Hash
  const [tree, treeErr] = await file.merkleTree();
  if (treeErr || !tree) {
    console.error('Failed to create merkle tree:', treeErr);
    throw new Error('Failed to create merkle tree');
  }

  const rootHash = tree.rootHash();

  // 上传文件
  const [tx, uploadErr] = await indexer.upload(file, config.rpcUrl, signer);
  if (uploadErr || !tx) {
    console.error('Failed to upload file:', uploadErr);
    throw new Error('Failed to upload file');
  }

  await file.close();

  return {
    rootHash: rootHash || '',
    txHash: tx,
  };
};

// 从 0G Storage 下载数据
export const downloadFromStorage = async (
  rootHash: string,
  outputPath?: string,
  withProof: boolean = true
): Promise<Uint8Array | null> => {
  const indexer = createIndexer();

  const [data, err] = await indexer.download(rootHash, outputPath || '', withProof);
  if (err) {
    console.error('Failed to download file:', err);
    return null;
  }

  return data as Uint8Array;
};

// 检查文件是否存在
export const checkFileExists = async (rootHash: string): Promise<boolean> => {
  const indexer = createIndexer();
  const info = await indexer.getFileInfo(rootHash);
  return info !== null;
};

// 策略数据上传存证
export const uploadStrategyData = async (
  strategyData: {
    agentId: number;
    prompt: string;
    response: string;
    timestamp: number;
    signature?: string;
  },
  signer: ethers.Signer
): Promise<{ rootHash: string; txHash: string }> => {
  const data = JSON.stringify(strategyData);
  return uploadToStorage(data, signer);
};

// 验证策略数据
export const verifyStrategyData = async (
  rootHash: string,
  expectedData: object
): Promise<boolean> => {
  const data = await downloadFromStorage(rootHash);
  if (!data) return false;

  const storedData = JSON.parse(new TextDecoder().decode(data));
  return JSON.stringify(storedData) === JSON.stringify(expectedData);
};
