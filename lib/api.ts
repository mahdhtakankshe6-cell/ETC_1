// API 配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// ============ 数据类型定义 ============

// 后端返回的团队业绩数据类型
interface BackendTeamPerformance {
  userAddress: string;
  userInvestment: string;
  userNodes: any[];
  directReferralsCount: number;      // 直推总人数（所有直接推荐的人）
  directSales: string;
  directNodes: {
    genesis: number;
    supreme: number;
    total: number;                   // 直推购买的节点总数量
  };
  validDirectReferrals: number;      // ✨ 有效直推人数（直推中购买过至尊节点的人，每人只算一次）
  teamTotalSales: string;
  teamTotalMembers: number;
  teamNodes: {
    genesis: number;
    supreme: number;
    total: number;
  };
  unlockedLevels: number;            // 解锁层深
  level: string;                     // 用户等级 (S0/S1/S3/S4/S5)
  minLineSales: string;              // 小区业绩 (wei)
}

// 前端使用的团队业绩数据类型
export interface TeamPerformanceData {
  totalTeamSales: string;
  directSales: string;
  totalTeamNodes: number;
  teamGenesisNodes: number;
  teamSupremeNodes: number;
  directNodes: number;
  validNodes: number;
  directMembers: number;
  teamTotalMembers: number;
  unlockedLevels: number;            // 解锁层深
  level: string;                     // 用户等级 (S0/S1/S3/S4/S5)
  minLineSales: string;              // 小区业绩 (USDT)
}

// 节点信息类型（后端返回格式）
export interface NodeInfo {
  index: number;
  nodeType: number;
  totalReward: string; // wei 字符串
  claimedReward: string; // wei 字符串
  claimableReward: string; // wei 字符串
  startTime: string; // ISO 8601 时间格式
  lastClaimTime: string; // ISO 8601 时间格式
  elapsedDays: number;
}

// 用户基本信息类型（后端返回格式）
export interface UserBasicInfo {
  address: string; // 小写地址
  referrer: string; // 小写地址
  nodeCount: number;
  nodes: NodeInfo[];
  totalInvestment: string; // wei 字符串
  isValidNode: boolean;
  directReferrals: number; // 有效直推人数（V5.2：购买过任意节点的直推数量，每人只计数1次）
  unlockedLevels: number; // 解锁层深（0-1人=1层，2+人=直推数，最多10层）
  level: string; // 用户等级（S0/S1/S3/S4/S5）
  referralRewards: {
    // 必需字段（前端使用）
    totalClaimedAfterFee: string; // 已领取推荐奖励（USDT，扣费后99%）
    pendingBeforeFee: string; // 待领取推荐奖励（USDT，扣费前100%）

    // 可选字段（后端额外提供）
    totalClaimedBeforeFee?: string; // 已领取推荐奖励（扣费前）
    totalFeesPaid?: string; // 累计已付手续费（1%）
    pendingAfterFee?: string; // 待领取推荐奖励（扣费后99%）
    pendingFee?: string; // 待扣手续费（1%）
  };
  // 向后兼容字段（可选）
  totalClaimedRewards?: string; // USDT 推荐奖励已领取
  totalClaimedVETCRewards?: string; // VETC 节点奖励已领取
  pendingRewards?: string; // USDT 待领取
}

// 总销售额统计类型（后端返回格式）
export interface TotalStats {
  totalSales: string; // wei 字符串
  totalUsers: number;
  totalNodes: number;
  genesisNodes: number;
  supremeNodes: number;
}

// 交易历史类型（后端返回格式）
export interface Transaction {
  id: string;
  type: string; // 'node_claim' | 'referral_claim' | 'node_purchase'
  amount: string; // wei 字符串
  timestamp: string; // ISO 8601 时间格式
  txHash: string;
}

// 直推用户信息类型（后端返回格式）
export interface ReferralUser {
  address: string; // 小写地址
  nodeCount: number;
  isValidNode: boolean;
  totalInvestment: string; // wei 字符串
  joinedAt: string; // ISO 8601 时间格式（后端字段名是 joinedAt）
  nodes?: any[]; // 可选：用户的节点列表
}

// ============ 工具函数 ============

/**
 * 将 ISO 8601 时间转换为 Unix timestamp（秒）
 */
export function iso8601ToUnixTimestamp(isoString: string): number {
  return Math.floor(new Date(isoString).getTime() / 1000);
}

/**
 * 将地址转换为校验和格式（EIP-55）
 */
export function toChecksumAddress(address: string): string {
  // 简单实现，实际项目中应使用 ethers.getAddress()
  return address;
}

// ============ API 请求函数 ============

/**
 * 通用 API 请求函数
 *
 * 后端响应格式：
 * {
 *   "success": true,
 *   "data": { ... }
 * }
 *
 * 数据格式规范：
 * - 💰 金额：字符串（wei单位），如 "1100000000000000000000"
 * - 📅 时间：ISO 8601 格式，如 "2025-11-15T12:47:58.000Z"
 * - 📍 地址：小写格式
 */
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // 404表示用户没有数据，这是正常情况，返回null
    if (response.status === 404) {
      console.log('User data not found (404), returning null');
      return null;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // 后端返回格式：{ success: true, data: {...} }
    if (result.success) {
      return result.data as T;
    } else {
      throw new Error(result.error || 'API request failed');
    }
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// ✅ 获取用户团队业绩数据（从后端API读取，不限层级）
export async function getTeamPerformance(userAddress: string): Promise<TeamPerformanceData> {
  const data = await apiRequest<BackendTeamPerformance>(`/api/users/${userAddress}/team-performance`);

  // 如果用户不存在（404），返回默认空数据
  if (!data) {
    return {
      totalTeamSales: '0',
      directSales: '0',
      totalTeamNodes: 0,
      teamGenesisNodes: 0,
      teamSupremeNodes: 0,
      directNodes: 0,
      validNodes: 0,
      directMembers: 0,
      teamTotalMembers: 0,
      unlockedLevels: 0,
      level: 'S0',
      minLineSales: '0',
    };
  }

  // 转换后端数据格式到前端格式
  // 注意：后端返回的金额是wei格式（18位小数），需要转换为USDT
  const { ethers } = await import('ethers');

  return {
    totalTeamSales: ethers.formatUnits(data.teamTotalSales, 18),      // wei → USDT
    directSales: ethers.formatUnits(data.directSales, 18),            // wei → USDT
    totalTeamNodes: data.teamNodes.total,
    teamGenesisNodes: data.teamNodes.genesis,
    teamSupremeNodes: data.teamNodes.supreme,
    directNodes: data.directNodes.total,
    validNodes: data.validDirectReferrals,        // ✅ 有效直推人数（直推中购买过至尊节点的人，每人只算一次）
    directMembers: data.directReferralsCount,     // 直推总人数
    teamTotalMembers: data.teamTotalMembers,      // 团队总人数（不限层级）
    unlockedLevels: data.unlockedLevels,          // 解锁层深
    level: data.level,                            // 用户等级
    minLineSales: ethers.formatUnits(data.minLineSales, 18),  // wei → USDT
  };
}

// ============ API 调用函数 ============

/**
 * 获取总销售额和统计数据
 * GET /api/stats
 */
export async function getTotalStats(): Promise<TotalStats | null> {
  return apiRequest<TotalStats>('/api/stats');
}

/**
 * 获取用户完整信息
 * GET /api/users/:address
 * 包含：基本信息、节点列表、推荐奖励详情、节点数量、是否有效节点
 */
export async function getUserInfo(userAddress: string): Promise<UserBasicInfo | null> {
  return apiRequest<UserBasicInfo>(`/api/users/${userAddress}`);
}

/**
 * 获取用户交易历史（领取记录）
 * GET /api/users/:address/transactions
 */
export async function getUserTransactions(userAddress: string): Promise<Transaction[] | null> {
  const data = await apiRequest<Transaction[]>(`/api/users/${userAddress}/transactions`);
  return data || [];
}

/**
 * 获取用户直推列表
 * GET /api/users/:address/referrals
 *
 * 后端返回格式：
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "address": "0x...",
 *       "isValidNode": false,
 *       "totalInvestment": "wei字符串",
 *       "nodeCount": 1,
 *       "nodes": [...],
 *       "joinedAt": "ISO 8601时间"
 *     }
 *   ]
 * }
 */
export async function getUserReferrals(userAddress: string): Promise<ReferralUser[]> {
  try {
    const data = await apiRequest<ReferralUser[]>(`/api/users/${userAddress}/referrals`);

    // 确保返回的是数组
    if (Array.isArray(data)) {
      console.log(`获取到 ${data.length} 个直推用户`);
      return data;
    }

    // 如果 data 是 null 或 undefined，返回空数组
    console.log('用户没有直推数据，返回空数组');
    return [];
  } catch (error) {
    console.error('获取直推列表失败:', error);
    return [];
  }
}

/**
 * 同步用户数据（从链上同步到数据库）
 * POST /api/sync/user/:address
 */
export async function syncUserData(userAddress: string) {
  return apiRequest(`/api/sync/user/${userAddress}`, {
    method: 'POST',
  });
}
