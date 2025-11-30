# 平台地址修复文档

## 📋 问题说明

**修复前的问题**：
- `NEXT_PUBLIC_TREASURY_ADDRESS` 被错误地当作平台根地址处理
- 实际上 `NEXT_PUBLIC_TREASURY_ADDRESS` 是**营销地址**（仅用于收款）
- 导致营销地址获得了不应有的特殊权限

---

## 🔧 修复内容

### 1. 地址类型区分

| 地址类型 | 环境变量 | 代码引用 | 用途 | 特殊权限 |
|---------|---------|---------|------|---------|
| **营销地址** | `NEXT_PUBLIC_TREASURY_ADDRESS` | `CONTRACT_ADDRESSES.treasury` | 仅用于收款 | ❌ 无 |
| **平台根地址** | `NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS` | `CONTRACT_ADDRESSES.platformRoot` | 平台核心管理地址 | ✅ 有 |

---

### 2. 平台根地址的特殊权限

只有**平台根地址**（`NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS`）拥有以下特权：

#### ✅ 特权 1: 无需购买节点即可获得推荐链接

```typescript
// 平台根地址或已购买节点的用户显示邀请链接
const isPlatformRootAddress = CONTRACT_ADDRESSES.platformRoot &&
  account.toLowerCase() === CONTRACT_ADDRESSES.platformRoot.toLowerCase()

if (isPlatformRootAddress || userNodes.length > 0) {
  return `${window.location.origin}?ref=${account}`
}
```

#### ✅ 特权 2: 推荐人显示特殊文案

```typescript
// 如果是平台根地址且没有推荐人，显示"平台地址（默认绑定）"
{account && CONTRACT_ADDRESSES.platformRoot &&
 account.toLowerCase() === CONTRACT_ADDRESSES.platformRoot.toLowerCase() &&
 !userInfo.referrer
  ? t('profile.platformAddressDefault')  // "平台地址（默認綁定）"
  : (userInfo.referrer || "--")
}
```

---

### 3. 修改的文件

| 文件 | 修改内容 |
|------|---------|
| `lib/contracts.ts:11` | ✅ 添加 `platformRoot` 地址配置 |
| `app/page.tsx:902` | ✅ 推荐人显示逻辑：`treasury` → `platformRoot` |
| `app/page.tsx:927` | ✅ 推荐链接显示逻辑：`treasury` → `platformRoot` |
| `app/page.tsx:943` | ✅ 复制按钮状态逻辑：`treasury` → `platformRoot` |
| `app/page.tsx:565` | ✅ 复制函数验证逻辑：`treasury` → `platformRoot` |
| `.env.example` | ✅ 新增环境变量说明文档 |

---

## 🚀 部署步骤

### 1. 添加新的环境变量

在 `.env` 或 Vercel 环境变量中添加：

```bash
# 平台根地址（必须配置）
NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS=0xYourPlatformRootAddress

# 营销地址（可选，如果已配置则保持不变）
NEXT_PUBLIC_TREASURY_ADDRESS=0xYourMarketingAddress
```

### 2. 重新部署应用

```bash
# 本地开发
npm run dev

# 生产环境
vercel --prod
```

---

## ✅ 验证测试

### 测试场景 1: 平台根地址登录

**预期行为**：
1. ✅ 无需购买节点，直接显示推荐链接
2. ✅ 推荐人显示"平台地址（默認綁定）"
3. ✅ 可以复制推荐链接

### 测试场景 2: 营销地址登录

**预期行为**：
1. ❌ 未购买节点时，推荐链接显示 "--"
2. ✅ 推荐人显示实际推荐人地址或 "--"
3. ❌ 未购买节点时，复制按钮禁用

### 测试场景 3: 普通用户登录（已购买节点）

**预期行为**：
1. ✅ 显示推荐链接
2. ✅ 推荐人显示实际推荐人地址
3. ✅ 可以复制推荐链接

### 测试场景 4: 普通用户登录（未购买节点）

**预期行为**：
1. ❌ 推荐链接显示 "--"
2. ✅ 推荐人显示实际推荐人地址或 "--"
3. ❌ 复制按钮禁用

---

## 📊 修改前后对比

### 修改前（错误）

```typescript
// ❌ 营销地址被当作平台根地址
const isPlatformAddress = CONTRACT_ADDRESSES.treasury &&
  account.toLowerCase() === CONTRACT_ADDRESSES.treasury.toLowerCase()

// ❌ 营销地址获得了特殊权限
if (isPlatformAddress || userNodes.length > 0) {
  return referralLink
}
```

### 修改后（正确）

```typescript
// ✅ 使用专门的平台根地址
const isPlatformRootAddress = CONTRACT_ADDRESSES.platformRoot &&
  account.toLowerCase() === CONTRACT_ADDRESSES.platformRoot.toLowerCase()

// ✅ 只有平台根地址才有特殊权限
if (isPlatformRootAddress || userNodes.length > 0) {
  return referralLink
}
```

---

## 🎯 关键区别

| 项目 | 营销地址 | 平台根地址 |
|------|---------|-----------|
| 环境变量 | `NEXT_PUBLIC_TREASURY_ADDRESS` | `NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS` |
| 用途 | 仅收款 | 平台管理 |
| 购买节点要求 | ✅ 需要 | ❌ 不需要 |
| 推荐链接 | 需购买节点才有 | 始终有 |
| 推荐人显示 | 普通显示 | 特殊文案 |
| 复制按钮 | 需购买节点才启用 | 始终启用 |

---

## ⚠️ 重要提醒

1. **必须配置 `NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS`**
   - 如果不配置，平台根地址功能将失效
   - 建议立即在 Vercel 或 `.env` 中添加

2. **`NEXT_PUBLIC_TREASURY_ADDRESS` 可以保留**
   - 虽然前端不再用于权限判断
   - 但可能在其他地方（如后端）使用

3. **地址格式**
   - 必须是有效的以太坊地址（0x 开头）
   - 前端会自动转换为小写比较

---

## 📝 配置示例

```env
# .env.local 或 Vercel 环境变量

# 营销地址（仅用于收款）
NEXT_PUBLIC_TREASURY_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# 平台根地址（拥有特殊权限）
NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
```

---

## 🔍 验证配置是否生效

打开浏览器控制台，输入：

```javascript
console.log('营销地址:', window.process?.env?.NEXT_PUBLIC_TREASURY_ADDRESS)
console.log('平台根地址:', window.process?.env?.NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS)
```

或者查看页面源代码中的环境变量。

---

**修复完成！✅**
