import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { ethers } from 'ethers';
import { ZEROG_COMPUTE, APP_CONFIG } from '@/lib/constants';
import type { InferenceRequest, InferenceResponse } from '@/types';

// Broker 实例缓存
let brokerInstance: Awaited<ReturnType<typeof createZGComputeNetworkBroker>> | null = null;

// 获取当前网络配置
const getComputeConfig = () => {
  const network = APP_CONFIG.network;
  return ZEROG_COMPUTE[network];
};

// 创建或获取 Broker 实例
export const getBroker = async (signer: ethers.Signer) => {
  if (!brokerInstance) {
    brokerInstance = await createZGComputeNetworkBroker(signer);
  }
  return brokerInstance;
};

// 重置 Broker 实例 (切换钱包时使用)
export const resetBroker = () => {
  brokerInstance = null;
};

// 获取可用的 AI 服务列表
export const getAvailableServices = async (signer: ethers.Signer) => {
  const broker = await getBroker(signer);
  const services = await broker.inference.listService();
  return services;
};

// 获取 Chatbot 类型的服务
export const getChatbotServices = async (signer: ethers.Signer) => {
  const services = await getAvailableServices(signer);
  return services.filter((s: { serviceType: string }) => s.serviceType === 'chatbot');
};

// 存入资金到 0G Compute
export const depositFunds = async (signer: ethers.Signer, amount: number) => {
  const broker = await getBroker(signer);
  await broker.ledger.depositFund(amount);
};

// 获取账户余额
export const getAccountBalance = async (signer: ethers.Signer) => {
  const broker = await getBroker(signer);
  return await broker.ledger.getAccount();
};

// 授权服务提供商
export const acknowledgeProvider = async (
  signer: ethers.Signer,
  providerAddress: string
) => {
  const broker = await getBroker(signer);
  await broker.inference.acknowledgeProviderSigner(providerAddress);
};

// 发起 AI 推理请求
export const requestInference = async (
  signer: ethers.Signer,
  providerAddress: string,
  request: InferenceRequest
): Promise<InferenceResponse> => {
  const broker = await getBroker(signer);

  // 获取服务元数据
  const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);

  // 获取认证请求头
  const headers = await broker.inference.getRequestHeaders(providerAddress);

  // 构建消息
  const messages = [
    {
      role: 'system',
      content: `You are an AI trading strategy assistant. Generate trading strategies based on the following context. Agent ID: ${request.agentId}. ${request.context || ''}`,
    },
    {
      role: 'user',
      content: request.prompt,
    },
  ];

  // 发起请求
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      messages,
      model,
      ...request.parameters,
    }),
  });

  if (!response.ok) {
    console.error('Inference request failed:', response.statusText);
    throw new Error(`Inference request failed: ${response.statusText}`);
  }

  const data = await response.json();

  // 获取 chatID 用于验证
  let chatID = response.headers.get('ZG-Res-Key') || response.headers.get('zg-res-key');
  if (!chatID) {
    chatID = data.id || data.chatID;
  }

  // 处理响应 (费用结算 + TEE 验证)
  if (chatID) {
    const isValid = await broker.inference.processResponse(
      providerAddress,
      chatID,
      JSON.stringify(data.usage || {})
    );
    
    if (!isValid) {
      console.error('TEE verification failed');
    }
  }

  // 解析策略数据
  const strategyContent = data.choices?.[0]?.message?.content || '';
  
  return {
    strategyData: strategyContent,
    confidence: data.usage?.completion_tokens ? 0.8 : 0.5,
    reasoning: 'AI-generated trading strategy based on 0G Compute',
    teeSignature: chatID || undefined,
    chatId: chatID || undefined,
  };
};

// 流式推理请求
export const requestInferenceStream = async (
  signer: ethers.Signer,
  providerAddress: string,
  request: InferenceRequest,
  onChunk: (chunk: string) => void
): Promise<InferenceResponse> => {
  const broker = await getBroker(signer);

  const { endpoint, model } = await broker.inference.getServiceMetadata(providerAddress);
  const headers = await broker.inference.getRequestHeaders(providerAddress);

  const messages = [
    {
      role: 'system',
      content: `You are an AI trading strategy assistant. Agent ID: ${request.agentId}. ${request.context || ''}`,
    },
    {
      role: 'user',
      content: request.prompt,
    },
  ];

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      messages,
      model,
      stream: true,
      ...request.parameters,
    }),
  });

  let chatID = response.headers.get('ZG-Res-Key') || response.headers.get('zg-res-key');
  const decoder = new TextDecoder();
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error('Response body is not readable');
  }

  let fullContent = '';
  let usage = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;

      const jsonStr = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
      
      const message = JSON.parse(jsonStr);

      if (!chatID && (message.id || message.chatID)) {
        chatID = message.id || message.chatID;
      }

      if (message.usage) {
        usage = message.usage;
      }

      const content = message.choices?.[0]?.delta?.content;
      if (content) {
        fullContent += content;
        onChunk(content);
      }
    }
  }

  // 处理响应验证
  if (chatID) {
    await broker.inference.processResponse(
      providerAddress,
      chatID,
      JSON.stringify(usage || {})
    );
  }

  return {
    strategyData: fullContent,
    confidence: 0.8,
    reasoning: 'AI-generated trading strategy (streamed)',
    teeSignature: chatID || undefined,
    chatId: chatID || undefined,
  };
};

// 获取服务提供商列表 (带缓存)
let cachedProviders: { address: string; name: string; model: string }[] | null = null;

export const getProviders = async (signer: ethers.Signer) => {
  if (cachedProviders) return cachedProviders;

  const services = await getChatbotServices(signer);
  cachedProviders = services.map((s: { provider: string; name: string; model: string }) => ({
    address: s.provider,
    name: s.name,
    model: s.model,
  }));

  return cachedProviders;
};

// 清除提供商缓存
export const clearProvidersCache = () => {
  cachedProviders = null;
};
