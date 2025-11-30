# PowerShell script to sync environment variables to Vercel
Write-Host "Syncing environment variables to Vercel..." -ForegroundColor Cyan

# Environment variables
$envVars = @{
    "NEXT_PUBLIC_CHAIN_ID" = "137"
    "NEXT_PUBLIC_CHAIN_NAME" = "Polygon Mainnet"
    "NEXT_PUBLIC_RPC_URL" = "https://rpc.ankr.com/polygon/1d60160318ce12fea299538fcfbf856166b602f1e9c116c7fefb7d16fd326082"
    "NEXT_PUBLIC_BLOCK_EXPLORER" = "https://polygonscan.com"
    "NEXT_PUBLIC_USDT_ADDRESS" = "0x7ADC046363DCc4838BFE979dc24B3CE6E8d17726"
    "NEXT_PUBLIC_VETC_ADDRESS" = "0x884D739516cC1433dc5A4230Ee0EEB62ADde5eA4"
    "NEXT_PUBLIC_NODE_STAKING_ADDRESS" = "0x9C9F27B20a0eb4f98Aa8680000514d87Ed0D2889"
    "NEXT_PUBLIC_TREASURY_ADDRESS" = "0x69E39fa02baf2F6F3b1B9bcF3D9a1906c6E14595"
    "NEXT_PUBLIC_GENESIS_PRICE" = "100"
    "NEXT_PUBLIC_SUPREME_PRICE" = "1000"
    "NEXT_PUBLIC_TIME_UNIT" = "86400"
    "NEXT_PUBLIC_RELEASE_PERIOD" = "100"
}

# Remove old values first
Write-Host "Removing old environment variables..." -ForegroundColor Yellow
foreach ($key in $envVars.Keys) {
    Write-Host "  Removing $key..." -NoNewline
    vercel env rm $key production -y 2>$null
    Write-Host " Done" -ForegroundColor Green
}

Write-Host ""
Write-Host "Adding new environment variables..." -ForegroundColor Yellow

# Add new values
foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    Write-Host "  Adding $key = $value..." -NoNewline

    # Use echo with explicit encoding to avoid issues
    $value | vercel env add $key production

    Write-Host " Done" -ForegroundColor Green
}

Write-Host ""
Write-Host "Environment variables synced successfully!" -ForegroundColor Green
