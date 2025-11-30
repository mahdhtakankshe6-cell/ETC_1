"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Wallet, Share2, Boxes, Copy, Check, Coins, Rocket, Zap, TrendingUp, ArrowUpRight } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'

export function ReferralAssets() {
  const t = useTranslations('assets')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("https://example.com/?ref=0x1234...5678")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-12">
      {/* Balance Cards - Hero style side by side */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Card className="relative overflow-hidden group bg-gradient-to-br from-card to-secondary/20 border-2 border-border hover:border-secondary/60 transition-all duration-500 hover:shadow-2xl p-10 transform hover:scale-[1.02]">
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-secondary/20">
                <Wallet className="w-10 h-10 text-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">{t('usdtBalance')}</h3>
            </div>

            <div className="space-y-3">
              <div className="text-6xl md:text-7xl font-black text-foreground">
                5,230<span className="text-4xl text-muted-foreground">.50</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <TrendingUp className="w-6 h-6 text-green-500" />
                <span className="text-green-500 font-bold">{t('weeklyChange')}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group bg-gradient-to-br from-primary/20 via-primary/10 to-card border-2 border-primary/40 hover:border-primary transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 p-10 transform hover:scale-[1.02]">
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/30 rounded-full blur-3xl"></div>

          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/30">
                <Coins className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-primary">{t('vetcBalance')}</h3>
            </div>

            <div className="space-y-3">
              <div className="text-6xl md:text-7xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                1,580<span className="text-4xl">.20</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <ArrowUpRight className="w-6 h-6 text-primary" />
                <span className="text-primary font-bold">{t('todayRelease')}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Three column feature cards */}
      <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
        {/* Referral Stats */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-card to-primary/5 border-2 border-border hover:border-primary/50 transition-all duration-500 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">{t('referral')}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-secondary/20 border-2 border-secondary/30 text-center space-y-2">
              <p className="text-sm text-muted-foreground">{t('direct')}</p>
              <p className="text-4xl font-black text-primary">8</p>
            </div>
            <div className="p-5 rounded-2xl bg-secondary/20 border-2 border-secondary/30 text-center space-y-2">
              <p className="text-sm text-muted-foreground">{t('team')}</p>
              <p className="text-4xl font-black text-primary">25</p>
            </div>
          </div>
        </Card>

        {/* Total Earnings */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-card border-2 border-primary/30 hover:border-primary/60 transition-all duration-500 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary">{t('totalEarnings')}</h3>
          </div>

          <div className="text-center py-4">
            <p className="text-5xl font-black text-primary">1,250</p>
            <p className="text-xl font-bold text-muted-foreground mt-2">USDT</p>
          </div>
        </Card>

        {/* Pending Rewards */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-card border-2 border-primary/50 hover:border-primary transition-all duration-500 p-8 space-y-6 transform hover:scale-105">
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/30 animate-bounce">
                <Coins className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-primary">{t('pendingRewards')}</h3>
            </div>

            <div className="text-center">
              <p className="text-5xl font-black text-primary">45.00</p>
              <p className="text-lg font-medium text-muted-foreground mt-2">USDT</p>
            </div>

            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
              {t('claimNow')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Referral Link - Full width */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-card via-primary/5 to-card border-2 border-border hover:border-primary/50 transition-all duration-500 p-8 md:p-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Share2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-3xl font-bold text-foreground">{t('referralLink')}</h3>
          </div>

          <div className="flex gap-4">
            <Input
              readOnly
              value="https://example.com/?ref=0x1234...5678"
              className="bg-secondary/30 border-2 border-secondary/50 font-mono text-lg py-6 hover:bg-secondary/40 transition-colors flex-1"
            />
            <Button
              onClick={handleCopy}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-10 py-6 text-lg hover:scale-105 transition-all shadow-xl"
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6 mr-2" />
                  {t('copied')}
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6 mr-2" />
                  {t('copyLink')}
                </>
              )}
            </Button>
          </div>

          <p className="text-muted-foreground text-center text-lg">{t('shareDescription')}</p>
        </div>
      </Card>

      {/* My Nodes - Stacked cards with alternating alignment */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-card to-secondary/5 border-2 border-border p-10 md:p-12">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px]"></div>

        <div className="relative z-10 space-y-10">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Boxes className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-foreground">{t('myNodes')}</h3>
          </div>

          <div className="space-y-8">
            {/* Node 1 */}
            <Card className="relative bg-gradient-to-br from-primary/10 to-card border-2 border-primary/40 hover:border-primary p-8 md:p-10 space-y-6 transform hover:-translate-y-2 transition-all duration-300 lg:mr-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/20">
                    <Rocket className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-bold text-primary">{t('supremeNode')} #1</h4>
                    <p className="text-sm text-muted-foreground">2025/9/28 {t('started')}</p>
                  </div>
                </div>
                <div className="px-6 py-3 rounded-full bg-primary/20 border-2 border-primary/40">
                  <span className="font-bold text-primary">{t('running')}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-secondary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('total')}</p>
                  <p className="text-3xl font-bold text-foreground">1000</p>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('claimed')}</p>
                  <p className="text-3xl font-bold text-foreground">450</p>
                </div>
                <div className="p-6 rounded-2xl bg-primary/30 border-2 border-primary/50 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('claimable')}</p>
                  <p className="text-3xl font-bold text-primary">75.50</p>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all">
                <Coins className="w-6 h-6 mr-2" />
                {t('claim')} 75.50 VETC
              </Button>
            </Card>

            {/* Node 2 - Offset to left */}
            <Card className="relative bg-gradient-to-br from-secondary/10 to-card border-2 border-secondary/40 hover:border-secondary p-8 md:p-10 space-y-6 transform hover:-translate-y-2 transition-all duration-300 lg:ml-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-secondary/20">
                    <Zap className="w-7 h-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-bold text-foreground">{t('genesisNode')} #2</h4>
                    <p className="text-sm text-muted-foreground">2025/10/13 {t('started')}</p>
                  </div>
                </div>
                <div className="px-6 py-3 rounded-full bg-secondary/20 border-2 border-secondary/40">
                  <span className="font-bold text-secondary-foreground">{t('running')}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-secondary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('total')}</p>
                  <p className="text-3xl font-bold text-foreground">100</p>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('claimed')}</p>
                  <p className="text-3xl font-bold text-foreground">30</p>
                </div>
                <div className="p-6 rounded-2xl bg-primary/30 border-2 border-primary/50 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('claimable')}</p>
                  <p className="text-3xl font-bold text-primary">25.80</p>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all">
                <Coins className="w-6 h-6 mr-2" />
                {t('claim')} 25.80 VETC
              </Button>
            </Card>

            {/* Node 3 - Offset to right */}
            <Card className="relative bg-gradient-to-br from-primary/10 to-card border-2 border-primary/40 hover:border-primary p-8 md:p-10 space-y-6 transform hover:-translate-y-2 transition-all duration-300 lg:mr-12">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/20">
                    <Rocket className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-bold text-primary">{t('supremeNode')} #3</h4>
                    <p className="text-sm text-muted-foreground">2025/10/23 {t('started')}</p>
                  </div>
                </div>
                <div className="px-6 py-3 rounded-full bg-primary/20 border-2 border-primary/40">
                  <span className="font-bold text-primary">{t('running')}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-secondary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('total')}</p>
                  <p className="text-3xl font-bold text-foreground">1000</p>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/20 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('claimed')}</p>
                  <p className="text-3xl font-bold text-foreground">200</p>
                </div>
                <div className="p-6 rounded-2xl bg-primary/30 border-2 border-primary/50 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{t('claimable')}</p>
                  <p className="text-3xl font-bold text-primary">24.00</p>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all">
                <Coins className="w-6 h-6 mr-2" />
                {t('claim')} 24.00 VETC
              </Button>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}
