@echo off
echo Syncing environment variables to Vercel...

REM Remove old values first (suppress errors if they don't exist)
vercel env rm NEXT_PUBLIC_CHAIN_ID production -y 2>nul
vercel env rm NEXT_PUBLIC_CHAIN_NAME production -y 2>nul
vercel env rm NEXT_PUBLIC_RPC_URL production -y 2>nul
vercel env rm NEXT_PUBLIC_BLOCK_EXPLORER production -y 2>nul
vercel env rm NEXT_PUBLIC_USDT_ADDRESS production -y 2>nul
vercel env rm NEXT_PUBLIC_VETC_ADDRESS production -y 2>nul
vercel env rm NEXT_PUBLIC_NODE_STAKING_ADDRESS production -y 2>nul
vercel env rm NEXT_PUBLIC_TREASURY_ADDRESS production -y 2>nul
vercel env rm NEXT_PUBLIC_GENESIS_PRICE production -y 2>nul
vercel env rm NEXT_PUBLIC_SUPREME_PRICE production -y 2>nul
vercel env rm NEXT_PUBLIC_TIME_UNIT production -y 2>nul
vercel env rm NEXT_PUBLIC_RELEASE_PERIOD production -y 2>nul

REM Add new values using echo with /n (no newline)
echo|set /p="137" | vercel env add NEXT_PUBLIC_CHAIN_ID production
echo|set /p="Polygon Mainnet" | vercel env add NEXT_PUBLIC_CHAIN_NAME production
echo|set /p="https://rpc.ankr.com/polygon/1d60160318ce12fea299538fcfbf856166b602f1e9c116c7fefb7d16fd326082" | vercel env add NEXT_PUBLIC_RPC_URL production
echo|set /p="https://polygonscan.com" | vercel env add NEXT_PUBLIC_BLOCK_EXPLORER production
echo|set /p="0x7ADC046363DCc4838BFE979dc24B3CE6E8d17726" | vercel env add NEXT_PUBLIC_USDT_ADDRESS production
echo|set /p="0x884D739516cC1433dc5A4230Ee0EEB62ADde5eA4" | vercel env add NEXT_PUBLIC_VETC_ADDRESS production
echo|set /p="0x9C9F27B20a0eb4f98Aa8680000514d87Ed0D2889" | vercel env add NEXT_PUBLIC_NODE_STAKING_ADDRESS production
echo|set /p="0x69E39fa02baf2F6F3b1B9bcF3D9a1906c6E14595" | vercel env add NEXT_PUBLIC_TREASURY_ADDRESS production
echo|set /p="100" | vercel env add NEXT_PUBLIC_GENESIS_PRICE production
echo|set /p="1000" | vercel env add NEXT_PUBLIC_SUPREME_PRICE production
echo|set /p="86400" | vercel env add NEXT_PUBLIC_TIME_UNIT production
echo|set /p="100" | vercel env add NEXT_PUBLIC_RELEASE_PERIOD production

echo.
echo Done! Environment variables synced to Vercel production.
