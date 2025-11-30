"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, ChevronDown, Globe } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useAccount, useDisconnect, usePublicClient } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { formatUnits } from 'viem'
import { useTranslation } from 'react-i18next'
import { bsc } from 'wagmi/chains'

interface HeaderProps {
  onLogoClick?: () => void
}

export function Header({ onLogoClick }: HeaderProps) {
  const { t, i18n } = useTranslation()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const publicClient = usePublicClient({ chainId: bsc.id })

  const [mounted, setMounted] = useState(false)
  const [usdtBalance, setUsdtBalance] = useState<string>("0.00")
  const [vetcBalance, setVetcBalance] = useState<string>("0.00")

  // 防止 hydration 错误
  useEffect(() => {
    setMounted(true)
  }, [])

  // 加载余额
  const loadBalances = async (address: string) => {
    try {
      // 检查网络是否为BSC主网
      if (chain?.id !== bsc.id) {
        console.warn('请切换到BSC主网 (Chain ID: 56)')
        setUsdtBalance(t('header.switchNetwork'))
        setVetcBalance(t('header.switchNetwork'))
        return
      }

      // 检查 publicClient 是否可用
      if (!publicClient) {
        console.error('Public client not available')
        return
      }

      // BSC 主网合约地址（从环境变量读取）
      const USDT_ADDRESS = (process.env.NEXT_PUBLIC_USDT_ADDRESS || '').trim()
      const VETC_ADDRESS = (process.env.NEXT_PUBLIC_VETC_ADDRESS || '').trim()

      // ERC20 ABI (包含 balanceOf 和 decimals)
      const ERC20_ABI = [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'owner', type: 'address' }],
          outputs: [{ type: 'uint256' }]
        },
        {
          name: 'decimals',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ type: 'uint8' }]
        }
      ] as const

      try {
        // 获取USDT余额
        const [usdtDecimals, usdtBal]: any = await Promise.all([
          publicClient.readContract({
            address: USDT_ADDRESS as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'decimals'
          }),
          publicClient.readContract({
            address: USDT_ADDRESS as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          })
        ])

        const formattedUsdt = parseFloat(formatUnits(usdtBal, usdtDecimals)).toFixed(2)
        setUsdtBalance(formattedUsdt)
      } catch (e) {
        console.error("USDT balance load failed:", e)
        setUsdtBalance("0.00")
      }

      try {
        // 获取VETC余额
        const [vetcDecimals, vetcBal]: any = await Promise.all([
          publicClient.readContract({
            address: VETC_ADDRESS as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'decimals'
          }),
          publicClient.readContract({
            address: VETC_ADDRESS as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [address as `0x${string}`]
          })
        ])

        const formattedVetc = parseFloat(formatUnits(vetcBal, vetcDecimals)).toFixed(2)
        setVetcBalance(formattedVetc)
      } catch (e) {
        console.error("VETC balance load failed:", e)
        setVetcBalance("0.00")
      }
    } catch (error) {
      console.error("Error loading balances:", error)
      setUsdtBalance(t('header.error'))
      setVetcBalance(t('header.error'))
    }
  }

  // 当账户连接或变化时加载余额
  useEffect(() => {
    if (mounted && isConnected && address) {
      loadBalances(address)
    } else {
      setUsdtBalance("0.00")
      setVetcBalance("0.00")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, isConnected, address, chain?.id])

  // 连接钱包
  const connectWallet = () => {
    open()
  }

  // 断开钱包
  const disconnectWallet = () => {
    disconnect()
  }

  // 格式化地址
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-2.5 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onLogoClick}
              className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <Image
                src="/logo.png"
                alt={t('header.logoAlt')}
                width={48}
                height={48}
                className="h-10 w-10 md:h-12 md:w-12"
              />
              <span
                className="font-bold text-xl md:text-2xl"
                style={{ color: "rgb(77, 173, 140)" }}
              >
                Eternal Code
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* 语言切换 */}
            {mounted ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg transition-all duration-300 hover:scale-105"
                       style={{
                         backgroundColor: "rgba(77, 173, 140, 0.2)",
                         color: "rgb(77, 173, 140)",
                         border: "2px solid rgba(77, 173, 140, 0.5)"
                       }}>
                  <Globe className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-black border-2 p-1 max-h-96 overflow-y-auto"
                style={{ borderColor: "rgba(77, 173, 140, 0.5)" }}>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('zh-TW')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'zh-TW' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'zh-TW' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  繁體中文
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('en')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'en' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'en' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('es')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'es' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'es' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('vi')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'vi' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'vi' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  Tiếng Việt
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('fil')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'fil' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'fil' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  Filipino
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('fr')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'fr' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'fr' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('id')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'id' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'id' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  Bahasa Indonesia
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('ja')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'ja' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'ja' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  日本語
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => i18n.changeLanguage('ko')}
                  className="cursor-pointer px-3 py-2 rounded transition-colors"
                  style={{
                    backgroundColor: i18n.language === 'ko' ? "rgba(77, 173, 140, 0.2)" : "transparent",
                    color: i18n.language === 'ko' ? "rgb(77, 173, 140)" : "white"
                  }}>
                  한국어
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            ) : (
              <button className="p-2 rounded-lg transition-all duration-300"
                     style={{
                       backgroundColor: "rgba(77, 173, 140, 0.2)",
                       color: "rgb(77, 173, 140)",
                       border: "2px solid rgba(77, 173, 140, 0.5)"
                     }}>
                <Globe className="w-5 h-5" />
              </button>
            )}

            {/* 钱包连接 */}
            {mounted && isConnected && address ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-semibold border-2 flex items-center gap-1 md:gap-2 transition-all duration-300 hover:scale-105"
                       style={{
                         backgroundColor: "rgba(77, 173, 140, 0.2)",
                         color: "rgb(77, 173, 140)",
                         borderColor: "rgba(77, 173, 140, 0.5)"
                       }}>
                  {formatAddress(address)}
                  <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 md:w-56 bg-black border-2 p-2"
                style={{ borderColor: "rgba(77, 173, 140, 0.5)" }}>
                <div className="px-2 md:px-3 py-2 text-xs md:text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white opacity-70">USDT:</span>
                    <span className="font-semibold" style={{ color: "rgb(77, 173, 140)" }}>{usdtBalance}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white opacity-70">VETC:</span>
                    <span className="font-semibold" style={{ color: "rgb(77, 173, 140)" }}>{vetcBalance}</span>
                  </div>
                  <div className="border-t pt-2" style={{ borderColor: "rgba(77, 173, 140, 0.3)" }}>
                    <button
                      onClick={disconnectWallet}
                      className="w-full px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: "transparent",
                        color: "rgb(77, 173, 140)",
                        border: "2px solid rgb(77, 173, 140)"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                        e.currentTarget.style.color = "black"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.color = "rgb(77, 173, 140)"
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('header.disconnect')}
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={connectWallet}
              className="hover:scale-105 transition-transform duration-300 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 h-auto"
              style={{
                backgroundColor: "rgb(77, 173, 140)",
                color: "black",
                border: "none"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
              }}
            >
              <Wallet className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{t('header.connectWallet')}</span>
              <span className="sm:hidden">{t('header.connectShort')}</span>
            </Button>
          )}
          </div>
        </div>
      </div>
    </header>
  )
}
