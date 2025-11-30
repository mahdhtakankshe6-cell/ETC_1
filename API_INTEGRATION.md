# 前后端 API 集成文档

## 📋 概述

前端已完全迁移至后端 API，不再直接读取链上数据（除了写操作），大幅降低 RPC 延迟。

## ✅ API 端点对照表

| 功能 | API 端点 | 前端调用函数 | 状态 |
|------|---------|------------|------|
| 总销售额统计 | `GET /api/stats` | `getTotalStats()` | ✅ 已集成 |
| 用户基本信息 | `GET /api/users/:address` | `getUserInfo()` | ✅ 已集成 |
| 用户直推列表 | `GET /api/users/:address/referrals` | `getUserReferrals()` | ✅ 已集成 |
| 团队业绩数据 | `GET /api/users/:address/team-performance` | `getTeamPerformance()` | ✅ 已集成 |
| 用户交易历史 | `GET /api/users/:address/transactions` | `getUserTransactions()` | ✅ 已定义 |

## 📦 数据格式规范

### 后端响应格式

```json
{
  "success": true,
  "data": {
    // 具体数据
  }
}
```

### 数据类型规范

| 数据类型 | 格式 | 示例 | 前端处理 |
|---------|------|------|---------|
| 💰 金额 | 字符串（wei） | `"1100000000000000000000"` | `ethers.formatUnits(value, 18)` |
| 📅 时间 | ISO 8601 | `"2025-11-15T12:47:58.000Z"` | `iso8601ToUnixTimestamp(time)` |
| 📍 地址 | 小写 | `"0xabc123..."` | 直接使用或转换为校验和格式 |

## 🔧 前端数据处理

### 1. 总销售额数据

```typescript
// 调用位置: app/page.tsx:loadTotalSales()
const stats = await getTotalStats()
// 返回: { totalSales: "wei字符串", totalUsers: number, ... }
const salesInUSDT = ethers.formatUnits(stats.totalSales, 18)
```

### 2. 用户基本信息

```typescript
// 调用位置: app/page.tsx:loadUserData()
const userInfo = await getUserInfo(address)
// 返回: {
//   address: string,
//   referrer: string,
//   nodeCount: number,
//   nodes: NodeInfo[],
//   totalInvestment: "wei字符串",
//   isValidNode: boolean,
//   referralRewards: {
//     totalClaimedAfterFee: "wei字符串",
//     pendingBeforeFee: "wei字符串"
//   }
// }
```

### 3. 节点信息处理

```typescript
// 时间转换：ISO 8601 → Unix timestamp
const nodes = userInfo.nodes.map((node) => ({
  ...node,
  totalReward: ethers.formatUnits(node.totalReward, 18),
  claimedReward: ethers.formatUnits(node.claimedReward, 18),
  claimableReward: ethers.formatUnits(node.claimableReward, 18),
  startTime: iso8601ToUnixTimestamp(node.startTime),
  lastClaimTime: iso8601ToUnixTimestamp(node.lastClaimTime),
}))
```

### 4. 直推列表

```typescript
// 调用位置: app/page.tsx:loadUserData()
const referrals = await getUserReferrals(address)
// 返回: ReferralUser[] (保证返回数组，不会是 null)
// [
//   {
//     address: "0x...",
//     nodeCount: 1,
//     isValidNode: false,
//     totalInvestment: "wei字符串",
//     joinedAt: "2025-11-15T13:29:28.761Z", // ISO 8601 时间
//     nodes: [...] // 可选：用户的节点列表
//   }
// ]
```

**注意**：
- ✅ 函数保证返回数组（即使后端返回 null 或出错，也会返回空数组 `[]`）
- ✅ 后端字段名是 `joinedAt`，不是 `joinTime`
- ✅ 后端额外返回了 `nodes` 数组（可选使用）

## 🔐 仍需链上交互的操作

以下操作必须直接调用智能合约（需要用户签名）：

| 操作 | 合约方法 | 调用位置 | 原因 |
|------|---------|---------|------|
| 购买节点 | `buyNode()` | app/page.tsx:273 | 需要用户签名交易 |
| 授权 USDT | `approve()` | app/page.tsx:257 | 需要用户签名交易 |
| 领取节点奖励 | `claimNodeReward()` | app/page.tsx:489 | 需要用户签名交易 |
| 领取推荐奖励 | `claimReferralReward()` | app/page.tsx:533 | 需要用户签名交易 |
| 检查合约暂停 | `paused()` | app/page.tsx:232 | 购买前实时检查 |
| 检查 USDT 余额 | `balanceOf()` | app/page.tsx:218 | 购买前实时检查 |
| 检查授权额度 | `allowance()` | app/page.tsx:247 | 购买前实时检查 |

## 📈 性能提升对比

| 操作 | 修改前（链上） | 修改后（API） | 提升 |
|------|--------------|--------------|------|
| 总销售额查询 | ~500-2000ms | ~50-200ms | 🚀 10倍 |
| 用户信息查询 | 5-10次RPC调用 | 2次API调用 | 🚀 5倍 |
| 节点列表加载 | 循环查询链上 | 1次API返回 | 🚀 10倍+ |
| 直推列表 | 逐个查询节点数 | 1次API返回 | 🚀 10倍+ |

## 🛠️ 工具函数

### iso8601ToUnixTimestamp()

```typescript
// 将 ISO 8601 时间转换为 Unix timestamp（秒）
import { iso8601ToUnixTimestamp } from "@/lib/api"

const timestamp = iso8601ToUnixTimestamp("2025-11-15T12:47:58.000Z")
// 返回: 1731675478
```

### toChecksumAddress()

```typescript
// 将地址转换为校验和格式（EIP-55）
import { toChecksumAddress } from "@/lib/api"

const checksumAddr = toChecksumAddress("0xabc123...")
// 返回: "0xAbc123..."
```

## 🔄 数据流程图

### 修改前（直接读链上）
```
前端 → RPC → 智能合约 → 返回数据
延迟：~500-2000ms
```

### 修改后（读后端 API）
```
前端 → 后端 API → 数据库 → 返回数据
延迟：~50-200ms
```

### 写操作（仍需链上）
```
前端 → MetaMask → 用户签名 → RPC → 智能合约 → 交易确认
```

## ⚠️ 注意事项

1. **404 错误处理**：新用户可能在数据库中不存在，返回 404 是正常情况，前端会返回 `null` 并使用默认值
2. **时间格式**：后端返回 ISO 8601，前端需转换为 Unix timestamp
3. **金额格式**：后端返回 wei 字符串，前端需使用 `ethers.formatUnits()` 转换
4. **地址格式**：后端返回小写地址，如需校验和格式需自行转换
5. **数据同步**：用户完成链上操作后，后端会自动同步数据，前端刷新即可获取最新数据

## 📝 TypeScript 类型定义

所有数据类型已在 `lib/api.ts` 中定义：

- `NodeInfo` - 节点信息
- `UserBasicInfo` - 用户基本信息
- `TotalStats` - 总销售额统计
- `Transaction` - 交易历史
- `ReferralUser` - 直推用户信息
- `TeamPerformanceData` - 团队业绩数据

## 🎯 下一步建议

1. ✅ 添加请求缓存机制（减少重复请求）
2. ✅ 添加错误重试逻辑
3. ✅ 添加 loading 状态优化
4. ✅ 考虑使用 SWR 或 React Query 管理数据获取
