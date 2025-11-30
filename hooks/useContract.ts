import { useWalletClient, usePublicClient } from 'wagmi'
import { Contract } from 'ethers'
import { BrowserProvider } from 'ethers'
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/contracts'
import { bsc } from 'wagmi/chains'

export function useContract() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({ chainId: bsc.id })

  // 获取 provider (用于只读操作)
  const getProvider = () => {
    if (!publicClient) return null
    // 将 viem publicClient 转换为 ethers provider
    return new BrowserProvider(publicClient.transport)
  }

  // 获取 signer (用于写入操作)
  const getSigner = async () => {
    if (!walletClient) return null

    // 将 viem walletClient 转换为 ethers signer
    const provider = new BrowserProvider(walletClient.transport as any)
    return await provider.getSigner(walletClient.account.address)
  }

  const getUSDTContract = async (withSigner = false) => {
    if (withSigner) {
      const signer = await getSigner()
      if (!signer) return null
      return new Contract(CONTRACT_ADDRESSES.usdt, CONTRACT_ABIS.usdt, signer)
    } else {
      const provider = getProvider()
      if (!provider) return null
      return new Contract(CONTRACT_ADDRESSES.usdt, CONTRACT_ABIS.usdt, provider)
    }
  }

  const getVETCContract = async (withSigner = false) => {
    if (withSigner) {
      const signer = await getSigner()
      if (!signer) return null
      return new Contract(CONTRACT_ADDRESSES.vetc, CONTRACT_ABIS.vetc, signer)
    } else {
      const provider = getProvider()
      if (!provider) return null
      return new Contract(CONTRACT_ADDRESSES.vetc, CONTRACT_ABIS.vetc, provider)
    }
  }

  const getNodeStakingContract = async (withSigner = false) => {
    if (withSigner) {
      const signer = await getSigner()
      if (!signer) return null
      return new Contract(CONTRACT_ADDRESSES.nodeStaking, CONTRACT_ABIS.nodeStaking, signer)
    } else {
      const provider = getProvider()
      if (!provider) return null
      return new Contract(CONTRACT_ADDRESSES.nodeStaking, CONTRACT_ABIS.nodeStaking, provider)
    }
  }

  return {
    getProvider,
    getSigner,
    getUSDTContract,
    getVETCContract,
    getNodeStakingContract,
  }
}
