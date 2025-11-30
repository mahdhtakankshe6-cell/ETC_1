# NodeStaking Backend API 文档

Base URL: `http://your-domain:3000/api`

---

## 📊 用户相关 API

### 1. 获取所有用户列表
```
GET /api/users
```

**Query 参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 50
- `isValidNode` (可选): 筛选有效节点用户 (true/false)
- `sortBy` (可选): 排序字段，默认 createdAt

**返回示例**:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "totalPages": 10,
    "currentPage": 1,
    "totalUsers": 500
  }
}
```

---

### 2. 根据地址获取单个用户
```
GET /api/users/:address
```

**路径参数**:
- `address`: 钱包地址

**返回示例**:
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "referrer": "0x...",
    "isValidNode": false,
    "directReferrals": 2,
    "unlockedLevels": 2,
    "pendingRewards": "1000000000000000000",
    "nodes": [
      {
        "index": 0,
        "nodeType": "GENESIS",
        "totalReward": "100000000000000000000",
        "claimedReward": "0",
        "claimableReward": "10000000000000000000",
        "startTime": "2025-11-15T12:47:58.000Z",
        "lastClaimTime": "2025-11-15T12:47:58.000Z",
        "elapsedDays": 10
      }
    ],
    "totalInvestment": "100000000000000000000",
    "lastSyncTime": "2025-11-15T13:52:00.000Z"
  }
}
```

---

### 3. 获取用户统计信息
```
GET /api/users/stats
```

**返回示例**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "validNodes": 500,
    "invalidNodes": 500,
    "topReferrers": [
      {
        "address": "0x...",
        "directReferrals": 100,
        "unlockedLevels": 10,
        "totalInvestment": "1000000000000000000000"
      }
    ],
    "recentUsers": [...]
  }
}
```

---

### 4. 获取用户推荐树
```
GET /api/users/:address/referral-tree
```

**Query 参数**:
- `depth` (可选): 递归深度，默认 3

**返回示例**:
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "isValidNode": true,
    "directReferrals": 5,
    "unlockedLevels": 3,
    "totalInvestment": "1000000000000000000000",
    "children": [
      {
        "address": "0x...",
        "isValidNode": false,
        "directReferrals": 2,
        "children": [...]
      }
    ]
  }
}
```

---

### 5. 获取用户交易历史
```
GET /api/users/:address/transactions
```

**Query 参数**:
- `limit` (可选): 返回数量，默认 50

**返回示例**:
```json
{
  "success": true,
  "data": [
    {
      "txHash": "0x...",
      "type": "BUY_NODE",
      "userAddress": "0x...",
      "referrerAddress": "0x...",
      "nodeType": "GENESIS",
      "amount": "100000000000000000000",
      "token": "USDT",
      "blockNumber": 68279713,
      "blockTimestamp": "2025-11-15T12:47:58.000Z",
      "status": "CONFIRMED"
    }
  ]
}
```

---

### 6. 获取用户团队业绩 ⭐
```
GET /api/users/:address/team-performance
```

**返回示例**:
```json
{
  "success": true,
  "data": {
    "userAddress": "0x...",
    "userInvestment": "100000000000000000000",
    "userNodes": [...],
    
    "directReferralsCount": 2,
    "directSales": "1100000000000000000000",
    "directNodes": {
      "genesis": 1,
      "supreme": 1,
      "total": 2
    },
    
    "teamTotalSales": "1100000000000000000000",
    "teamTotalMembers": 2,
    "teamNodes": {
      "genesis": 1,
      "supreme": 1,
      "total": 2
    },
    
    "lastUpdated": "2025-11-15T13:52:16.000Z"
  }
}
```

---

### 7. 手动同步用户数据
```
POST /api/sync/user/:address
```

**说明**: 从链上重新同步用户数据

**返回示例**:
```json
{
  "success": true,
  "message": "用户数据同步成功",
  "data": { ... }
}
```

---

## 💰 交易相关 API

### 1. 获取所有交易
```
GET /api/transactions
```

**Query 参数**:
- `page` (可选): 页码，默认 1
- `limit` (可选): 每页数量，默认 50
- `type` (可选): 交易类型筛选 (BUY_NODE, CLAIM_NODE_REWARD, CLAIM_REFERRAL_REWARDS)
- `userAddress` (可选): 按用户地址筛选

**返回示例**:
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "totalPages": 5,
    "currentPage": 1,
    "totalTransactions": 250
  }
}
```

---

### 2. 根据交易哈希获取交易详情
```
GET /api/transactions/:txHash
```

**返回示例**:
```json
{
  "success": true,
  "data": {
    "txHash": "0x...",
    "type": "BUY_NODE",
    "userAddress": "0x...",
    "referrerAddress": "0x...",
    "nodeType": "GENESIS",
    "nodeIndex": 0,
    "amount": "100000000000000000000",
    "token": "USDT",
    "blockNumber": 68279713,
    "blockTimestamp": "2025-11-15T12:47:58.000Z",
    "status": "CONFIRMED",
    "eventData": { ... }
  }
}
```

---

## 📈 系统统计 API

### 1. 获取系统统计数据
```
GET /api/stats
```

**返回示例**:
```json
{
  "success": true,
  "data": {
    "totalSales": "5000000000000000000000",
    "genesisSales": "1000000000000000000000",
    "supremeSales": "4000000000000000000000",
    "genesisCount": 10,
    "supremeCount": 4,
    "totalNodeCount": 14
  }
}
```

---

## 🔍 监听器状态 API

### 1. 获取监听器状态
```
GET /api/listener/status
```

**返回示例**:
```json
{
  "success": true,
  "message": "获取监听器状态成功",
  "data": {
    "type": "polling",
    "isRunning": true,
    "lastSyncedBlock": 68280912,
    "currentBlock": 68284778,
    "blocksBehind": 3866,
    "scanInterval": 10000,
    "batchSize": 100
  }
}
```

---

## 🏥 健康检查

### 1. 服务器健康检查
```
GET /health
```

**返回示例**:
```json
{
  "success": true,
  "message": "Server is running",
  "database": "PostgreSQL",
  "timestamp": "2025-11-15T14:00:00.000Z"
}
```

---

## 📝 数据格式说明

### 节点类型 (NodeType)
- `GENESIS`: 创世节点 (100 USDT)
- `SUPREME`: 至尊节点 (1000 USDT)

### 交易类型 (TransactionType)
- `BUY_NODE`: 购买节点
- `CLAIM_NODE_REWARD`: 领取节点奖励
- `CLAIM_REFERRAL_REWARDS`: 领取推荐奖励

### 代币类型 (Token)
- `USDT`: Mock USDT
- `VETC`: 奖励代币

### 交易状态 (Status)
- `CONFIRMED`: 已确认

---

## ⚠️ 错误响应格式

所有错误返回统一格式：
```json
{
  "success": false,
  "message": "错误描述信息"
}
```

常见 HTTP 状态码：
- `400`: 请求参数错误
- `404`: 资源不存在
- `429`: 请求过于频繁
- `500`: 服务器内部错误

---

## 🔐 限流说明

- 所有 `/api/*` 路径限制：每 15 分钟最多 100 个请求
- 超出限制返回 429 状态码

---

## 💡 使用示例

### JavaScript/Fetch
```javascript
// 获取用户团队业绩
const response = await fetch('http://localhost:3000/api/users/0x.../team-performance');
const data = await response.json();

if (data.success) {
  console.log('团队总人数:', data.data.teamTotalMembers);
  console.log('团队总销售:', data.data.teamTotalSales);
}
```

### cURL
```bash
# 获取监听器状态
curl http://localhost:3000/api/listener/status

# 手动同步用户
curl -X POST http://localhost:3000/api/sync/user/0x...
```

---

**最后更新**: 2025-11-15  
**API 版本**: v1.0  
**服务端口**: 3000
