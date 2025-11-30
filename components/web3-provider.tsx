'use client'

import { WagmiProvider, QueryClientProvider, config, queryClient } from '@/lib/web3modal'

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
