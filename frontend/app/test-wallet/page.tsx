'use client';

import { ConnectKitButton } from 'connectkit';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WalletTestPage() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>钱包连接测试</CardTitle>
          <CardDescription>测试 0G Chain 钱包连接功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 连接按钮 */}
          <div className="flex justify-center">
            <ConnectKitButton />
          </div>

          {/* 连接状态 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">连接状态</p>
                <p className="text-lg font-semibold">
                  {isConnected ? (
                    <span className="text-green-500">✓ 已连接</span>
                  ) : (
                    <span className="text-gray-500">✗ 未连接</span>
                  )}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">网络</p>
                <p className="text-lg font-semibold">{chain?.name || '-'}</p>
              </div>
            </div>

            {isConnected && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">钱包地址</p>
                  <p className="text-sm font-mono break-all">{address}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">余额</p>
                  <p className="text-lg font-semibold">
                    {balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Chain ID</p>
                  <p className="text-lg font-semibold">{chain?.id}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">RPC URL</p>
                  <p className="text-sm font-mono break-all">{chain?.rpcUrls.default.http[0]}</p>
                </div>

                <Button onClick={() => disconnect()} variant="outline" className="w-full">
                  断开连接
                </Button>
              </>
            )}
          </div>

          {/* 说明文档 */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">配置说明</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ 使用 wagmi v3.4.1 + viem v2.45.1</li>
              <li>✓ 启用 SSR 支持</li>
              <li>✓ 使用 Cookie Storage 持久化</li>
              <li>✓ 手动配置 walletConnect connector</li>
              <li>✓ 0G Testnet (Chain ID: 16602)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
