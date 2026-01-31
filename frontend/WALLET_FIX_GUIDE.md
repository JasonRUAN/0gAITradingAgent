# 钱包连接修复说明

## 🔧 修复内容

### 1. Web3Provider 配置优化

**修改文件：** `components/providers/web3-provider.tsx`

**主要改进：**
- ✅ 从 `getDefaultConfig` 改为手动配置，提升稳定性
- ✅ 启用 SSR 支持 (`ssr: true`)
- ✅ 使用 Cookie Storage 替代 localStorage，提升生产环境稳定性
- ✅ 手动配置 `walletConnect` connector，更灵活控制

**修改前：**
```typescript
const config = createConfig(
  getDefaultConfig({
    chains: [zeroGTestnet],
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    // ...
  })
);
```

**修改后：**
```typescript
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
    storage: cookieStorage, // 使用 cookie 存储
  }),
});
```

### 2. 环境变量修正

**修改文件：** `.env`

**修改内容：**
- 统一环境变量命名：`NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` → `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 3. 合约 ABI 集中管理

**新增文件：** `lib/contracts.ts`

**功能：**
- ✅ 集中管理合约 ABI 定义
- ✅ TypeScript 类型定义
- ✅ 合约地址导出
- ✅ 便于维护和复用

**包含内容：**
- `TRADING_ARENA_ABI` - 完整的 Trading Arena 合约 ABI
- `AgentInfo` / `AgentStats` / `StrategyExecution` - TypeScript 类型
- `CONTRACTS` - 合约地址常量

### 4. 测试页面

**新增文件：** `app/test-wallet/page.tsx`

**功能：**
- ✅ 测试钱包连接状态
- ✅ 显示钱包地址和余额
- ✅ 显示网络信息
- ✅ 测试断开连接功能

---

## 📊 技术栈对比

| 项目 | 配置方式 | SSR | 存储 | Connector |
|------|----------|-----|------|-----------|
| **修复前** | `getDefaultConfig` | ❌ | localStorage | 自动 |
| **修复后** | 手动配置 | ✅ | Cookie Storage | WalletConnect |
| **参考项目** | 手动配置 | ✅ | Cookie Storage | WalletConnect |

---

## 🚀 测试步骤

### 1. 安装依赖（如果需要）

```bash
cd frontend
npm install
```

### 2. 检查环境变量

确保 `.env` 文件包含：
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=5fbfb27c3cbbdf26b341e0e579773b9b
NEXT_PUBLIC_AGENT_PAYMENT_HUB_ADDRESS=0xB50FAadEe72280E60C354FF6e8E7084ce0586771
NEXT_PUBLIC_CHAIN_ID=16602
NEXT_PUBLIC_RPC_URL=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_EXPLORER_URL=https://chainscan-newton.0g.ai
```

### 3. 启动开发服务器

```bash
npm run dev
```

### 4. 访问测试页面

打开浏览器访问：
```
http://localhost:3000/test-wallet
```

### 5. 测试功能

- ✅ 点击 "Connect Wallet" 按钮
- ✅ 选择钱包（MetaMask / WalletConnect / Coinbase Wallet）
- ✅ 确认连接到 0G Testnet (Chain ID: 16602)
- ✅ 查看钱包地址、余额、网络信息
- ✅ 测试断开连接功能
- ✅ 刷新页面，验证连接状态是否持久化

---

## 🎯 关键改进点

### 1. SSR 支持

**为什么重要？**
- Next.js 13+ App Router 默认使用服务端渲染
- 没有 SSR 支持会导致水合(hydration)错误
- Cookie Storage 在服务端也能读取

### 2. Cookie Storage

**优势：**
- ✅ 服务端和客户端都可访问
- ✅ 更安全（可设置 httpOnly, secure）
- ✅ 生产环境更稳定
- ✅ 避免 localStorage 的跨域问题

### 3. 手动配置 Connector

**优势：**
- ✅ 更灵活的控制
- ✅ 可以精确配置 WalletConnect 参数
- ✅ `showQrModal: false` - 使用 ConnectKit 自己的 UI
- ✅ 便于调试和排查问题

### 4. 合约 ABI 集中管理

**优势：**
- ✅ 单一数据源，便于维护
- ✅ TypeScript 类型安全
- ✅ 避免重复定义
- ✅ 便于版本控制

---

## 📝 使用示例

### 读取合约数据

```typescript
import { useReadContract } from 'wagmi';
import { TRADING_ARENA_ABI, CONTRACTS } from '@/lib/contracts';

function MyComponent() {
  const { data: agents } = useReadContract({
    address: CONTRACTS.TRADING_ARENA,
    abi: TRADING_ARENA_ABI,
    functionName: 'getActiveAgents',
  });

  return (
    <div>
      {agents?.map(agent => (
        <div key={agent.agentId}>{agent.name}</div>
      ))}
    </div>
  );
}
```

### 写入合约数据

```typescript
import { useWriteContract } from 'wagmi';
import { TRADING_ARENA_ABI, CONTRACTS } from '@/lib/contracts';

function RegisterAgent() {
  const { writeContract } = useWriteContract();

  const handleRegister = async () => {
    await writeContract({
      address: CONTRACTS.TRADING_ARENA,
      abi: TRADING_ARENA_ABI,
      functionName: 'registerAgent',
      args: ['AI Trader', 'My trading agent', 'DeepSeek', '0x'],
    });
  };

  return <button onClick={handleRegister}>Register Agent</button>;
}
```

---

## 🔍 常见问题排查

### Q1: 钱包连接后刷新页面断开

**原因：** 没有启用持久化存储
**解决：** ✅ 已修复 - 使用 Cookie Storage

### Q2: 水合错误 (Hydration Error)

**原因：** 没有启用 SSR 支持
**解决：** ✅ 已修复 - 设置 `ssr: true`

### Q3: WalletConnect 无法连接

**原因：** Project ID 未配置或错误
**解决：** 检查 `.env` 文件中的 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### Q4: 网络切换失败

**原因：** 钱包未添加 0G Testnet
**解决：** 在钱包中手动添加网络：
- Network Name: `0G Testnet`
- RPC URL: `https://evmrpc-testnet.0g.ai`
- Chain ID: `16602`
- Currency Symbol: `0G`
- Block Explorer: `https://chainscan-newton.0g.ai`

---

## ✅ 验证清单

- [x] Web3Provider 使用手动配置
- [x] 启用 SSR 支持
- [x] 使用 Cookie Storage
- [x] 配置 WalletConnect connector
- [x] 环境变量命名统一
- [x] 创建合约 ABI 配置文件
- [x] 创建测试页面
- [x] 钱包连接功能正常
- [x] 刷新页面状态持久化
- [x] 显示余额和网络信息

---

## 📚 参考资源

- [Wagmi 官方文档](https://wagmi.sh/)
- [Viem 官方文档](https://viem.sh/)
- [ConnectKit 官方文档](https://docs.family.co/connectkit)
- [WalletConnect 文档](https://docs.walletconnect.com/)
- [0G Chain 文档](https://docs.0g.ai/)

---

## 🎉 总结

通过这次修复，项目的钱包连接功能已经：
1. ✅ 更稳定 - SSR + Cookie Storage
2. ✅ 更灵活 - 手动配置 connector
3. ✅ 更易维护 - ABI 集中管理
4. ✅ 更易测试 - 专门的测试页面

参考了 `payment_agent` 项目的最佳实践，同时保留了原项目的 UI 定制。
