"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Zap, Rocket, Clock, Sparkles } from "lucide-react"
import { useTranslations } from 'next-intl'
import { useContract } from '@/hooks/useContract'
import { ethers } from 'ethers'

export function NodePurchase() {
  const t = useTranslations('purchase')
  const { getNodeStakingContract } = useContract()

  // 状态管理
  const [soldAmount, setSoldAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(3000000)
  const [isLoading, setIsLoading] = useState(true)

  // 从合约获取销售数据
  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const contract = await getNodeStakingContract()
        if (contract) {
          // 调用合约接口
          const sales = await contract.getTotalSales()
          const maxSales = await contract.MAX_TOTAL_SALES()

          // USDT 是 6 位小数
          setSoldAmount(Number(ethers.formatUnits(sales, 6)))
          setTotalAmount(Number(ethers.formatUnits(maxSales, 6)))
        }
      } catch (error) {
        console.error('获取销售数据失败:', error)
        // 失败时使用默认值
        setSoldAmount(0)
        setTotalAmount(3000000)
      } finally {
        setIsLoading(false)
      }
    }

    loadSalesData()
  }, [])

  const percentage = totalAmount > 0 ? (soldAmount / totalAmount) * 100 : 0

  return (
    <div className="space-y-16">
      {/* Progress Section - Full width showcase */}
      <div className="relative">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/10 border-2 border-primary/30 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[120px]"></div>

          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                {t('title')}
              </h2>
              <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-muted-foreground">{t('sold')}</span>
                <span className="text-2xl font-bold text-primary">
                  {isLoading ? '...' : `${percentage.toFixed(2)}%`}
                </span>
                <span className="text-muted-foreground">{t('total')}</span>
              </div>
              <div className="relative group">
                <Progress value={percentage} className="h-6 bg-secondary/30" />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {isLoading ? '加载中...' : `${soldAmount.toLocaleString()} USDT`}
                </span>
                <span>{totalAmount.toLocaleString()} USDT</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Node Cards - Banch-style side-by-side comparison */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Genesis Node - Left side */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <Card className="relative h-full bg-gradient-to-br from-card to-secondary/10 border-2 border-secondary/40 hover:border-secondary transition-all duration-500 p-8 space-y-8">
            {/* Badge */}
            <div className="flex justify-between items-start">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/30 backdrop-blur-sm border-2 border-secondary/50">
                <Zap className="w-6 h-6 text-secondary-foreground" />
                <span className="font-bold text-secondary-foreground text-lg">{t('startVersion')}</span>
              </div>
            </div>

            {/* Title & Price */}
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-black text-foreground">{t('genesisNode')}</h3>
              <div className="inline-block">
                <div className="text-6xl md:text-7xl font-black text-primary">100</div>
                <div className="text-2xl font-bold text-muted-foreground mt-2">USDT</div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-secondary/20 backdrop-blur-sm border-l-4 border-primary space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Sparkles className="w-5 h-5" />
                  <span>{t('initialReward')}</span>
                </div>
                <p className="text-3xl font-black text-foreground">100 VETC</p>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/20 backdrop-blur-sm border-l-4 border-primary/60 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-5 h-5" />
                  <span>{t('dailyRelease')}</span>
                </div>
                <p className="text-3xl font-black text-foreground">1 VETC</p>
                <p className="text-sm text-muted-foreground">{t('for100Days')}</p>
              </div>

              <div className="p-4 rounded-xl bg-destructive/20 border-2 border-destructive/40">
                <p className="text-destructive font-bold text-center">{t('notValidNode')}</p>
              </div>
            </div>

            {/* CTA */}
            <Button className="w-full bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground font-bold text-lg py-7 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all">
              {t('purchaseNow')}
            </Button>
          </Card>
        </div>

        {/* Supreme Node - Right side with premium styling */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-3xl blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

          <Card className="relative h-full bg-gradient-to-br from-primary/20 via-primary/10 to-card border-2 border-primary/50 hover:border-primary transition-all duration-500 p-8 space-y-8 transform hover:scale-[1.02]">
            {/* Badge with animation */}
            <div className="flex justify-between items-start">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/30 backdrop-blur-sm border-2 border-primary/60 animate-pulse">
                <Rocket className="w-6 h-6 text-primary" />
                <span className="font-bold text-primary text-lg">{t('premiumVersion')}</span>
              </div>
              <div className="px-4 py-2 rounded-full bg-primary/20 border border-primary/40">
                <span className="text-xs font-bold text-primary">{t('recommended')}</span>
              </div>
            </div>

            {/* Title & Price */}
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                {t('supremeNode')}
              </h3>
              <div className="inline-block">
                <div className="text-6xl md:text-7xl font-black text-primary">1000</div>
                <div className="text-2xl font-bold text-primary/70 mt-2">USDT</div>
              </div>
            </div>

            {/* Features in grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-primary/20 backdrop-blur-sm border-2 border-primary/40 space-y-2">
                  <div className="text-muted-foreground text-xs">{t('initialReward')}</div>
                  <p className="text-3xl font-black text-primary">1000</p>
                  <p className="text-sm text-muted-foreground">VETC</p>
                </div>

                <div className="p-6 rounded-2xl bg-primary/20 backdrop-blur-sm border-2 border-primary/40 space-y-2">
                  <div className="text-muted-foreground text-xs">{t('dailyRelease')}</div>
                  <p className="text-3xl font-black text-primary">10</p>
                  <p className="text-sm text-muted-foreground">VETC</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/30 to-primary/20 border-2 border-primary/50 backdrop-blur-sm space-y-2">
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <Clock className="w-5 h-5" />
                  <span>{t('releaseSchedule')}</span>
                </div>
                <p className="text-xl font-bold text-primary">{t('linearRelease100Days')}</p>
              </div>

              <div className="p-4 rounded-xl bg-green-500/20 border-2 border-green-500/40">
                <p className="text-green-400 font-bold text-center">{t('isValidNode')}</p>
              </div>
            </div>

            {/* Premium CTA */}
            <Button className="w-full bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-primary-foreground font-bold text-lg py-7 rounded-2xl shadow-2xl shadow-primary/50 hover:shadow-primary/70 hover:scale-[1.02] transition-all">
              {t('purchaseSupremeNode')}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
