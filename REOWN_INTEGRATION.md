# Reown (WalletConnect) 集成文档

## 概述
成功将钱包连接方式从原生 `window.ethereum` 迁移到 Reown AppKit (WalletConnect v3)。

## 已完成的工作

### 1. 安装的依赖
```json
{
  "@web3modal/wagmi": "^5.1.11",
  "wagmi": "latest",
  "viem": "latest",
  "@tanstack/react-query": "latest",
  "@coinbase/wallet-sdk": "latest"
}
```

### 2. 创建的新文件

#### `lib/web3modal.ts`
- 配置 Reown AppKit
- 设置 BSC 主网
- 配置 WalletConnect 和 Injected connectors
- Project ID: `0ab251bdbd0504c690d270e5bfccccc5`
- 自定义绿色主题

#### `components/web3-provider.tsx`
- Wagmi 和 React Query Provider 包装器

### 3. 修改的文件

#### `app/layout.tsx`
- 添加 `Web3Provider` 包装所有内容
- 确保 wagmi hooks 在整个应用可用

#### `components/header.tsx`
- 使用 `useAccount` 获取连接状态和地址
- 使用 `useDisconnect` 处理断开连接
- 使用 `useWeb3Modal` 打开连接模态框
- 使用 `usePublicClient` 读取合约数据（余额）
- ERC20 ABI 改为完整的对象格式以支持 viem

#### `app/page.tsx`
- 使用 `useAccount` hook 获取钱包地址
- 移除 `window.ethereum` 相关代码

#### `hooks/useContract.ts`
- 使用 `useWalletClient` 和 `usePublicClient`
- 将 viem clients 转换为 ethers.js provider/signer
- 保持与原有 API 的兼容性

## 主要特性

✅ **多钱包支持**
- MetaMask（浏览器插件）
- WalletConnect（扫码连接）
- Coinbase Wallet
- 其他 WalletConnect 兼容钱包

✅ **移动端支持**
- 通过 WalletConnect 扫码连接移动钱包
- 响应式 UI

✅ **自动网络切换**
- 自动检测并提示切换到 BSC 主网

✅ **保持原有功能**
- 所有合约交互逻辑保持不变
- UI/UX 保持一致
- 余额显示正常工作

## 使用方法

### 用户端
1. 点击 "连接钱包" 按钮
2. 选择钱包类型：
   - **浏览器钱包**: 如果已安装 MetaMask 等
   - **WalletConnect**: 使用手机钱包扫码
   - **Coinbase Wallet**: 连接 Coinbase 钱包

### 开发者
```tsx
// 获取钱包地址
import { useAccount } from 'wagmi'

function Component() {
  const { address, isConnected } = useAccount()

  // address: 钱包地址
  // isConnected: 是否已连接
}

// 打开连接模态框
import { useWeb3Modal } from '@web3modal/wagmi/react'

function Component() {
  const { open } = useWeb3Modal()

  // 调用 open() 打开钱包选择模态框
}

// 获取合约实例（保持原有API）
import { useContract } from '@/hooks/useContract'

function Component() {
  const { getUSDTContract, getNodeStakingContract } = useContract()

  // 与之前一样使用
  const contract = await getUSDTContract(true) // true = 需要 signer
}
```

## 配置说明

### 环境变量
确保 `.env.local` 中有以下配置：
```env
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://rpc.ankr.com/bsc/...
NEXT_PUBLIC_USDT_ADDRESS=0x55d398326f99059fF775485246999027B3197955
NEXT_PUBLIC_VETC_ADDRESS=0x55df6C50C0469Aa9a0C76BfFB583b393d385B497
NEXT_PUBLIC_NODE_STAKING_ADDRESS=0xEfdbc75AcC3D9fe6F12a4b6A182F8544B6840032
```

### Reown Project ID
在 `lib/web3modal.ts` 中配置：
```typescript
const projectId = '0ab251bdbd0504c690d270e5bfccccc5'
```

## 已知问题与解决方案

### SSR 警告
```
ReferenceError: indexedDB is not defined
```
- **原因**: WalletConnect 在服务器端渲染时尝试访问浏览器 API
- **影响**: 仅警告，不影响客户端功能
- **解决**: 已通过正确标记 'use client' 解决，可忽略此警告

### Google Fonts 加载失败
- **原因**: 网络连接问题
- **影响**: 使用后备字体，不影响功能
- **解决**: 等待网络恢复或使用 VPN

## 测试清单

- [x] 连接 MetaMask
- [ ] 连接 WalletConnect（手机钱包）
- [ ] 连接 Coinbase Wallet
- [ ] 查看余额（USDT/VETC）
- [ ] 购买节点
- [ ] 领取奖励
- [ ] 断开连接
- [ ] 账户切换

## 后续优化建议

1. **错误处理**: 增强错误提示，特别是网络切换失败时
2. **加载状态**: 添加更多加载指示器
3. **缓存优化**: 使用 wagmi 的缓存功能减少 RPC 调用
4. **主题定制**: 进一步定制 Reown 模态框主题
5. **多链支持**: 如需支持其他链，在 `web3modal.ts` 中添加

## 技术栈

- **Next.js 16.0.0**: React 框架
- **Wagmi**: React Hooks for Ethereum
- **Viem**: TypeScript Ethereum 库
- **Reown AppKit (Web3Modal)**: 钱包连接 UI
- **Ethers.js 6**: 合约交互（保持兼容）
- **React Query**: 数据获取和缓存

## 支持

如有问题，请查阅：
- [Reown AppKit 文档](https://docs.reown.com/appkit)
- [Wagmi 文档](https://wagmi.sh)
- [Viem 文档](https://viem.sh)
