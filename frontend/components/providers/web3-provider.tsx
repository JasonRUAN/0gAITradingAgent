'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http, cookieStorage, createStorage } from 'wagmi';
import { ConnectKitProvider } from 'connectkit';
import { defineChain } from 'viem';
import { walletConnect } from 'wagmi/connectors';
import { APP_CONFIG, ZEROG_CHAIN } from '@/lib/constants';
import { useState, type ReactNode } from 'react';

// 定义 0G Chain
const zeroGTestnet = defineChain({
  id: ZEROG_CHAIN.id,
  name: ZEROG_CHAIN.name,
  nativeCurrency: ZEROG_CHAIN.nativeCurrency,
  rpcUrls: ZEROG_CHAIN.rpcUrls,
  blockExplorers: ZEROG_CHAIN.blockExplorers,
  testnet: ZEROG_CHAIN.testnet,
});

// 创建 wagmi 配置 - 使用手动配置以获得更好的稳定性和 SSR 支持
const config = createConfig({
  chains: [zeroGTestnet],
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      showQrModal: false,
    }),
  ],
  transports: {
    [zeroGTestnet.id]: http(ZEROG_CHAIN.rpcUrls.default.http[0]),
  },
  ssr: true, // 启用 SSR 支持
  storage: createStorage({
    storage: cookieStorage, // 使用 cookie 存储以提升生产环境稳定性
  }),
});

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 分钟
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          theme="midnight"
          mode="dark"
          customTheme={{
            '--ck-font-family': 'var(--font-geist-sans)',
            '--ck-accent-color': '#6366F1',
            '--ck-accent-text-color': '#FFFFFF',
            '--ck-body-background': '#131320',
            '--ck-body-background-secondary': '#1A1A2E',
            '--ck-body-background-tertiary': '#0A0A0F',
            '--ck-border-radius': '12px',
          }}
        >
          {children}
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
