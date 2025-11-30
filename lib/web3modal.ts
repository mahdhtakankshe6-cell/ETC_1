'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { http, fallback, createConfig, WagmiProvider } from 'wagmi'
import { bsc } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. 设置 queryClient
const queryClient = new QueryClient()

// 1. 定义项目 ID（从环境变量或硬编码）
const projectId = '0ab251bdbd0504c690d270e5bfccccc5'

// 2. 创建 wagmiConfig
const metadata = {
  name: 'Eternal Code',
  description: 'Eternal Code - Node Staking Platform',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://eternalcode.com',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : 'https://eternalcode.com/logo.png']
}

// 配置多个免费 BSC RPC 端点进行轮询
const bscRpcEndpoints = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org',
  'https://bsc.publicnode.com',
  'https://bsc-rpc.publicnode.com'
]

export const config = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: fallback(
      bscRpcEndpoints.map(url => http(url))
    )
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true })
  ]
})

// 3. 创建 modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: false,
  allowUnsupportedChain: false,  // 禁止不支持的链，自动提示切换网络
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': 'rgb(77, 173, 140)',
    '--w3m-accent': 'rgb(77, 173, 140)',
    '--w3m-border-radius-master': '12px'
  }
})

export { queryClient, WagmiProvider, QueryClientProvider }
