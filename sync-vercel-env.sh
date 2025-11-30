#!/bin/bash
# 同步环境变量到 Vercel
# 使用方法: bash sync-vercel-env.sh

echo "🚀 开始同步环境变量到 Vercel..."
echo ""

# BSC Mainnet Configuration
echo "📝 更新网络配置..."
vercel env rm NEXT_PUBLIC_CHAIN_ID production -y 2>/dev/null
echo "56" | vercel env add NEXT_PUBLIC_CHAIN_ID production

vercel env rm NEXT_PUBLIC_CHAIN_NAME production -y 2>/dev/null
echo "BNB Smart Chain" | vercel env add NEXT_PUBLIC_CHAIN_NAME production

vercel env rm NEXT_PUBLIC_RPC_URL production -y 2>/dev/null
echo "https://rpc.ankr.com/bsc/1d60160318ce12fea299538fcfbf856166b602f1e9c116c7fefb7d16fd326082" | vercel env add NEXT_PUBLIC_RPC_URL production

vercel env rm NEXT_PUBLIC_BLOCK_EXPLORER production -y 2>/dev/null
echo "https://bscscan.com" | vercel env add NEXT_PUBLIC_BLOCK_EXPLORER production

# Contract Addresses (NodeStakingV5 - v5.0 Latest on BSC)
echo "📝 更新合约地址..."
vercel env rm NEXT_PUBLIC_USDT_ADDRESS production -y 2>/dev/null
echo "0x7ADC046363DCc4838BFE979dc24B3CE6E8d17726" | vercel env add NEXT_PUBLIC_USDT_ADDRESS production

vercel env rm NEXT_PUBLIC_VETC_ADDRESS production -y 2>/dev/null
echo "0x3D56B54FF395C2323C10B401e9165DBc80f034C2" | vercel env add NEXT_PUBLIC_VETC_ADDRESS production

vercel env rm NEXT_PUBLIC_NODE_STAKING_ADDRESS production -y 2>/dev/null
echo "0x4b2228a1ea13d3A8C2755F7c0F0dE31B70A62403" | vercel env add NEXT_PUBLIC_NODE_STAKING_ADDRESS production

# Treasury Address - 新地址
echo "📝 更新 Treasury 地址..."
vercel env rm NEXT_PUBLIC_TREASURY_ADDRESS production -y 2>/dev/null
echo "0x48abcf12786d01e92831077d68e6521451c6695e" | vercel env add NEXT_PUBLIC_TREASURY_ADDRESS production

# Node Prices
echo "📝 更新节点价格..."
vercel env rm NEXT_PUBLIC_GENESIS_PRICE production -y 2>/dev/null
echo "100" | vercel env add NEXT_PUBLIC_GENESIS_PRICE production

vercel env rm NEXT_PUBLIC_SUPREME_PRICE production -y 2>/dev/null
echo "1000" | vercel env add NEXT_PUBLIC_SUPREME_PRICE production

# Time Configuration
echo "📝 更新时间配置..."
vercel env rm NEXT_PUBLIC_TIME_UNIT production -y 2>/dev/null
echo "86400" | vercel env add NEXT_PUBLIC_TIME_UNIT production

vercel env rm NEXT_PUBLIC_RELEASE_PERIOD production -y 2>/dev/null
echo "100" | vercel env add NEXT_PUBLIC_RELEASE_PERIOD production

# Backend API Configuration - 新增
echo "📝 添加后端 API 配置..."
vercel env rm NEXT_PUBLIC_API_BASE_URL production -y 2>/dev/null
echo "http://107.173.196.26:3000" | vercel env add NEXT_PUBLIC_API_BASE_URL production

echo ""
echo "✅ 环境变量同步完成！"
echo ""
echo "📋 当前 Vercel 环境变量列表："
vercel env ls

echo ""
echo "⚠️  重要提示："
echo "   1. 环境变量已更新到 production 环境"
echo "   2. 需要重新部署才能生效：vercel --prod"
echo ""
