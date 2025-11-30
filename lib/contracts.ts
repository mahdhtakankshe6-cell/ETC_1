import MockUSDTABI from '@/abi/MockUSDT.json';
import VETCABI from '@/abi/VETC.json';
import NodeStakingV5ABI from '@/abi/NodeStakingV5.json';

// Contract Addresses (NodeStakingV5 - v5.0 Latest)
export const CONTRACT_ADDRESSES = {
  usdt: (process.env.NEXT_PUBLIC_USDT_ADDRESS || '').trim(),
  vetc: (process.env.NEXT_PUBLIC_VETC_ADDRESS || '').trim(),
  nodeStaking: (process.env.NEXT_PUBLIC_NODE_STAKING_ADDRESS || '').trim(),
  treasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || '').trim(), // 营销地址（仅用于收款）
  platformRoot: (process.env.NEXT_PUBLIC_PLATFORM_ROOT_ADDRESS || '').trim(), // 平台根地址（特殊权限）
} as const;

// Contract ABIs
export const CONTRACT_ABIS = {
  usdt: MockUSDTABI as any,
  vetc: VETCABI as any,
  nodeStaking: NodeStakingV5ABI as any,
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: Number((process.env.NEXT_PUBLIC_CHAIN_ID || '137').trim()),
  chainName: (process.env.NEXT_PUBLIC_CHAIN_NAME || 'Polygon Mainnet').trim(),
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: [(process.env.NEXT_PUBLIC_RPC_URL || '').trim()],
  blockExplorerUrls: [(process.env.NEXT_PUBLIC_BLOCK_EXPLORER || '').trim()],
} as const;

// Node Configuration
export const NODE_CONFIG = {
  genesis: {
    price: (process.env.NEXT_PUBLIC_GENESIS_PRICE || '100').trim(),
    dailyReward: '1',
    totalReward: '100',
    nodeType: 1,
  },
  supreme: {
    price: (process.env.NEXT_PUBLIC_SUPREME_PRICE || '1000').trim(),
    dailyReward: '10',
    totalReward: '1000',
    nodeType: 2,
  },
  releasePeriod: Number((process.env.NEXT_PUBLIC_RELEASE_PERIOD || '100').trim()) || 100,
  timeUnit: Number((process.env.NEXT_PUBLIC_TIME_UNIT || '86400').trim()) || 86400,
} as const;

// Referral Reward Configuration
export const REFERRAL_CONFIG = {
  directRewardPercent: 10,
  layerRewardPercent: 5,
  maxLayers: 10,
  feePercent: 1,
} as const;
