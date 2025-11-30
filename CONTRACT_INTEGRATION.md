# 合约集成文档

## ✅ 已完成的集成

### 1. ABI 文件
已复制以下 ABI 文件到 `abi/` 目录：
- `MockUSDT.json` - USDT 代币合约
- `VETC.json` - VETC 代币合约
- `NodeStakingV4.json` - 节点质押合约 (v4.0 最新版)

### 2. 环境变量配置
创建 `.env.local` 文件，包含：
```env
# Polygon Mainnet
NEXT_PUBLIC_CHAIN_ID=137
NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com

# 合约地址 (NodeStakingV4)
NEXT_PUBLIC_USDT_ADDRESS=0x7ADC046363DCc4838BFE979dc24B3CE6E8d17726
NEXT_PUBLIC_VETC_ADDRESS=0x884D739516cC1433dc5A4230Ee0EEB62ADde5eA4
NEXT_PUBLIC_NODE_STAKING_ADDRESS=0x9C9F27B20a0eb4f98Aa8680000514d87Ed0D2889
```

### 3. 合约配置文件
`lib/contracts.ts` - 统一管理合约地址、ABI 和配置

### 4. useContract Hook
`hooks/useContract.ts` - 提供便捷的合约访问方法

### 5. Header 组件更新
已更新为使用环境变量中的合约地址

## 📖 使用示例

### 读取余额
```typescript
import { useContract } from '@/hooks/useContract'

const { getUSDTContract, getVETCContract } = useContract()

// 读取 USDT 余额
const usdtContract = await getUSDTContract()
const balance = await usdtContract.balanceOf(address)

// 读取 VETC 余额
const vetcContract = await getVETCContract()
const vetcBalance = await vetcContract.balanceOf(address)
```

### 购买节点
```typescript
import { useContract } from '@/hooks/useContract'
import { NODE_CONFIG } from '@/lib/contracts'
import { ethers } from 'ethers'

const { getUSDTContract, getNodeStakingContract } = useContract()

// 1. 授权 USDT
const usdtContract = await getUSDTContract(true) // withSigner=true
const nodeStakingAddress = process.env.NEXT_PUBLIC_NODE_STAKING_ADDRESS
const amount = ethers.parseUnits(NODE_CONFIG.genesis.price, 18)
await usdtContract.approve(nodeStakingAddress, amount)

// 2. 购买节点
const stakingContract = await getNodeStakingContract(true)
await stakingContract.buyNode(NODE_CONFIG.genesis.nodeType, referrerAddress)
```

### 领取奖励
```typescript
const { getNodeStakingContract } = useContract()

const stakingContract = await getNodeStakingContract(true)

// 领取节点奖励 (VETC)
await stakingContract.claimNodeReward(nodeIndex)

// 领取推荐奖励 (USDT)
await stakingContract.claimReferralReward()
```

### 查询用户信息
```typescript
const { getNodeStakingContract } = useContract()

const stakingContract = await getNodeStakingContract()

// 获取用户信息
const userInfo = await stakingContract.getUserInfo(address)
// 返回: { referrer, directReferrals, isValidNode, hasReferrer }

// 获取节点信息
const nodeInfo = await stakingContract.getNodeInfo(address, nodeIndex)
// 返回: { nodeType, totalReward, claimedReward, startTime, lastClaimTime, claimableReward }

// 获取领取历史
const history = await stakingContract.getUserClaimHistory(address)
// 返回: { claimedVETC, claimedUSDT, pendingUSDT, claimableVETC }

// 获取推荐奖励详情
const details = await stakingContract.getReferralRewardDetails(address)
// 返回: {
//   totalClaimedBeforeFee,
//   totalClaimedAfterFee,
//   totalFeesPaid,
//   pendingBeforeFee,
//   pendingAfterFee,
//   pendingFee
// }
```

## 🔧 配置说明

### 节点配置
```typescript
import { NODE_CONFIG } from '@/lib/contracts'

// 创世节点
NODE_CONFIG.genesis.price       // "100" USDT
NODE_CONFIG.genesis.dailyReward // "1" VETC/day
NODE_CONFIG.genesis.nodeType    // 1

// 至尊节点
NODE_CONFIG.supreme.price       // "1000" USDT
NODE_CONFIG.supreme.dailyReward // "10" VETC/day
NODE_CONFIG.supreme.nodeType    // 2
```

### 推荐奖励配置
```typescript
import { REFERRAL_CONFIG } from '@/lib/contracts'

REFERRAL_CONFIG.directRewardPercent // 10%
REFERRAL_CONFIG.layerRewardPercent  // 5%
REFERRAL_CONFIG.maxLayers           // 10
REFERRAL_CONFIG.feePercent          // 1%
```

## ⚠️ 重要说明

1. **网络**: Polygon Mainnet (Chain ID: 137)
2. **版本**: NodeStakingV4 (v4.0 最新版)
3. **24小时冷却**: VETC 节点奖励必须间隔 24 小时领取
4. **1% 手续费**: 领取推荐奖励时自动扣除，99% 到账
5. **无条件直推**: 所有用户默认拥有 10% 直推奖励权限

## 📚 相关文档

- 完整部署信息：`DEPLOYMENT.md`
- 系统设计文档：`文档/ETC节点解析.md`
- 合约源码：`contracts/NodeStakingV4.sol`
