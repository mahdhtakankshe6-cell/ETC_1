# 同步环境变量到 Vercel (PowerShell 版本)
# 使用方法: powershell -ExecutionPolicy Bypass -File sync-vercel-env.ps1

Write-Host "🚀 开始同步环境变量到 Vercel..." -ForegroundColor Green
Write-Host ""

# 环境变量配置
$envVars = @{
    "NEXT_PUBLIC_CHAIN_ID" = "56"
    "NEXT_PUBLIC_CHAIN_NAME" = "BNB Smart Chain"
    "NEXT_PUBLIC_RPC_URL" = "https://rpc.ankr.com/bsc/1d60160318ce12fea299538fcfbf856166b602f1e9c116c7fefb7d16fd326082"
    "NEXT_PUBLIC_BLOCK_EXPLORER" = "https://bscscan.com"
    "NEXT_PUBLIC_USDT_ADDRESS" = "0x7ADC046363DCc4838BFE979dc24B3CE6E8d17726"
    "NEXT_PUBLIC_VETC_ADDRESS" = "0x3D56B54FF395C2323C10B401e9165DBc80f034C2"
    "NEXT_PUBLIC_NODE_STAKING_ADDRESS" = "0x4b2228a1ea13d3A8C2755F7c0F0dE31B70A62403"
    "NEXT_PUBLIC_TREASURY_ADDRESS" = "0x48abcf12786d01e92831077d68e6521451c6695e"
    "NEXT_PUBLIC_GENESIS_PRICE" = "100"
    "NEXT_PUBLIC_SUPREME_PRICE" = "1000"
    "NEXT_PUBLIC_TIME_UNIT" = "86400"
    "NEXT_PUBLIC_RELEASE_PERIOD" = "100"
    "NEXT_PUBLIC_API_BASE_URL" = "http://107.173.196.26:3000"
}

$total = $envVars.Count
$current = 0

foreach ($key in $envVars.Keys) {
    $current++
    $value = $envVars[$key]

    Write-Host "[$current/$total] 正在更新 $key..." -ForegroundColor Cyan

    # 先删除旧的（忽略错误）
    vercel env rm $key production -y 2>$null | Out-Null

    # 添加新的
    echo $value | vercel env add $key production

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $key 更新成功" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $key 更新失败" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ 环境变量同步完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 当前 Vercel 环境变量列表：" -ForegroundColor Yellow
vercel env ls

Write-Host ""
Write-Host "⚠️  重要提示：" -ForegroundColor Yellow
Write-Host "   1. 环境变量已更新到 production 环境"
Write-Host "   2. 需要重新部署才能生效：vercel --prod"
Write-Host ""
