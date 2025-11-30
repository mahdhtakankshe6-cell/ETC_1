"use client"

import { Header } from "@/components/header"
import { useTranslation } from "react-i18next"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Menu } from "lucide-react"
import { useContract } from "@/hooks/useContract"
import { copyToClipboard } from "@/lib/clipboard"
import { NODE_CONFIG, CONTRACT_ADDRESSES } from "@/lib/contracts"
import { ethers } from "ethers"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { getTotalStats, getUserInfo as getUserInfoAPI, getUserReferrals, iso8601ToUnixTimestamp, syncUserData, getTeamPerformance } from "@/lib/api"
import { TechBackground } from "@/components/tech-background"
import { useAccount } from 'wagmi'

export default function Home() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { getUSDTContract, getNodeStakingContract } = useContract()
  const { address: account, isConnected } = useAccount()

  // 防止 hydration 错误
  const [mounted, setMounted] = useState(false)

  const [activeMenu, setActiveMenu] = useState("dashboard")
  const [showReferrerModal, setShowReferrerModal] = useState(false)
  const [selectedNodeType, setSelectedNodeType] = useState<1 | 2>(1)
  const [referrerAddress, setReferrerAddress] = useState("")
  const [displayText, setDisplayText] = useState("")
  const [hasTyped, setHasTyped] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [card1Visible, setCard1Visible] = useState(false)
  const [card3Visible, setCard3Visible] = useState(false)
  const [socialLinksVisible, setSocialLinksVisible] = useState(false)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)

  // 购买页面节点收益卡片打字机效果
  const [purchaseCardLines, setPurchaseCardLines] = useState<string[]>([])
  const [purchaseCardTypingDone, setPurchaseCardTypingDone] = useState(false)

  const menuItems = [
    { id: "dashboard", label: t('nav.dashboard') },
    { id: "purchase", label: t('nav.purchase') },
    { id: "nodes", label: t('nav.rewards') },
    { id: "profile", label: t('nav.profile') },
  ]

  // 用户数据
  const [userInfo, setUserInfo] = useState({
    referrer: "",
    directNodes: 0,
    validNodes: 0,
    directMembers: 0,
    teamMembers: 0,
  })

  // 用户类型标记（根据是否有推荐人判断）
  const [isOldUser, setIsOldUser] = useState(false)

  // 团队业绩数据
  const [teamPerformance, setTeamPerformance] = useState({
    totalTeamSales: "0",
    directSales: "0",
    totalTeamNodes: 0,
    teamGenesisNodes: 0,
    teamSupremeNodes: 0,
    teamTotalMembers: 0,
    directMembers: 0,
    validNodes: 0,
    unlockedLevels: 0,
    level: "S0",
    minLineSales: "0",
  })

  // 节点数据
  const [userNodes, setUserNodes] = useState<any[]>([])

  // 奖励数据
  const [rewardData, setRewardData] = useState({
    totalReferralIncome: "0.00",
    pendingRewards: "0.00",
  })

  // 总销售额数据
  const [totalSales, setTotalSales] = useState("0")
  const [salesPercentage, setSalesPercentage] = useState("0")

  // 加载状态
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingTeamData, setIsLoadingTeamData] = useState(false)  // ✅ 新增：团队业绩加载状态
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [claimingNodeIndex, setClaimingNodeIndex] = useState<number | null>(null)
  const [isClaimingReferralReward, setIsClaimingReferralReward] = useState(false)

  // 手动复制对话框状态
  const [showManualCopy, setShowManualCopy] = useState(false)
  const [manualCopyLink, setManualCopyLink] = useState("")

  const fullText = t('dashboard.title')

  // 检查是否为用户取消交易的错误
  const isUserRejectedError = (error: any): boolean => {
    if (!error) return false

    // 检查错误代码
    if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
      return true
    }

    // 检查错误信息
    const errorMessage = error.message?.toLowerCase() || ''
    return errorMessage.includes('user rejected') ||
           errorMessage.includes('user denied') ||
           errorMessage.includes('user cancelled')
  }

  // 防止 hydration 错误
  useEffect(() => {
    setMounted(true)
  }, [])

  // 在客户端挂载后读取 localStorage 和 URL 参数
  useEffect(() => {
    const savedMenu = localStorage.getItem("activeMenu")
    if (savedMenu) {
      setActiveMenu(savedMenu)
    }

    // 从URL读取推荐人地址
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const refAddress = urlParams.get('ref')
      if (refAddress && ethers.isAddress(refAddress)) {
        setReferrerAddress(refAddress)
      }
    }
  }, [])

  // 保存当前页面状态到 localStorage
  useEffect(() => {
    localStorage.setItem("activeMenu", activeMenu)
  }, [activeMenu])

  useEffect(() => {
    if (activeMenu === "dashboard" && !hasTyped) {
      let index = 0
      const textArray = Array.from(fullText) // 将字符串转换为字符数组，正确处理中文字符

      const typeInterval = setInterval(() => {
        if (index < textArray.length) {
          setDisplayText(textArray.slice(0, index + 1).join(''))
          index++
        } else {
          clearInterval(typeInterval)
          setHasTyped(true)
        }
      }, 150)

      return () => {
        clearInterval(typeInterval)
      }
    } else if (activeMenu === "dashboard" && hasTyped) {
      setDisplayText(fullText)
    }
  }, [activeMenu, hasTyped, fullText])

  // 打字完成后依次触发卡片掉落
  useEffect(() => {
    // 只在仪表盘页面且打字完成后执行
    if (activeMenu !== "dashboard" || !hasTyped) return

    // 重置可见状态
    setCard1Visible(false)
    setCard3Visible(false)
    setSocialLinksVisible(false)

    // 依次触发：Logo+按钮出现后 -> card1 掉落 -> card3 掉落 -> 社媒链接出现
    const timer1 = setTimeout(() => {
      setCard1Visible(true)
    }, 300) // Logo出现后300ms，card1开始掉落

    const timer2 = setTimeout(() => {
      setCard3Visible(true)
    }, 900) // card1掉落后600ms，card3开始掉落

    const timer3 = setTimeout(() => {
      setSocialLinksVisible(true)
    }, 1500) // card3掉落后600ms，社媒链接出现

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [activeMenu, hasTyped])

  // 购买页面节点收益卡片打字机效果
  useEffect(() => {
    if (activeMenu !== "purchase") {
      setPurchaseCardLines([])
      setPurchaseCardTypingDone(false)
      return
    }

    // 定义要显示的7行内容
    const lines = [
      t('dashboard.card2.genesis'),
      t('dashboard.card2.genesisDesc'),
      t('dashboard.card2.genesisMember'),
      t('dashboard.card2.supreme'),
      t('dashboard.card2.supremeDesc'),
      t('dashboard.card2.supremeMember'),
      t('dashboard.card2.exchangeNote'),
    ]

    // 计算总字符数，动态设置间隔以在2秒内完成
    const totalChars = lines.reduce((sum, line) => sum + Array.from(line).length, 0)
    const targetDuration = 2000 // 2秒
    const interval = Math.floor(targetDuration / totalChars)

    let currentLineIndex = 0
    let currentCharIndex = 0
    const displayLines: string[] = []

    const typeInterval = setInterval(() => {
      if (currentLineIndex >= lines.length) {
        clearInterval(typeInterval)
        setPurchaseCardTypingDone(true)
        return
      }

      const currentLine = lines[currentLineIndex]
      const chars = Array.from(currentLine)

      if (currentCharIndex < chars.length) {
        displayLines[currentLineIndex] = chars.slice(0, currentCharIndex + 1).join('')
        setPurchaseCardLines([...displayLines])
        currentCharIndex++
      } else {
        currentLineIndex++
        currentCharIndex = 0
      }
    }, interval)

    return () => clearInterval(typeInterval)
  }, [activeMenu, t])

  const handleBuyNode = (nodeType: 1 | 2) => {
    if (!account) {
      toast({
        title: t('header.connectWallet'),
        description: t('header.installMetaMask'),
        variant: "destructive",
      })
      return
    }

    setSelectedNodeType(nodeType)

    // ✅ 优先使用用户已绑定的推荐人地址
    if (userInfo.referrer) {
      setReferrerAddress(userInfo.referrer)
    } else if (typeof window !== 'undefined') {
      // 如果用户还没有绑定推荐人，检查 URL 中的 ref 参数
      const urlParams = new URLSearchParams(window.location.search)
      const refAddress = urlParams.get('ref')

      if (refAddress && ethers.isAddress(refAddress)) {
        // 保存到 localStorage 和 state
        localStorage.setItem("referrerAddress", refAddress)
        setReferrerAddress(refAddress)

        // 清理 URL 中的 ref 参数
        const newUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, '', newUrl)
      } else if (!referrerAddress) {
        // 如果 URL 没有 ref 参数，尝试从 localStorage 读取
        const savedRef = localStorage.getItem("referrerAddress")
        if (savedRef && ethers.isAddress(savedRef)) {
          setReferrerAddress(savedRef)
        }
      }
    }

    // 显示推荐人确认弹窗（所有用户都弹窗）
    setShowReferrerModal(true)
  }

  const handleConfirmPurchase = async () => {
    if (!account) {
      toast({
        title: t('purchase.purchaseFailed'),
        description: t('header.connectWallet'),
        variant: "destructive",
      })
      return
    }

    // ✅ 验证推荐人地址：必须是非空字符串且是有效的以太坊地址
    if (!referrerAddress || typeof referrerAddress !== 'string' || referrerAddress.trim() === '') {
      toast({
        title: t('purchase.purchaseFailed'),
        description: t('purchase.invalidReferrer'),
        variant: "destructive",
      })
      return
    }

    // ✅ 验证是否是有效的以太坊地址格式
    try {
      if (!ethers.isAddress(referrerAddress)) {
        toast({
          title: t('purchase.purchaseFailed'),
          description: t('purchase.invalidReferrer'),
          variant: "destructive",
        })
        return
      }
    } catch (error) {
      console.error('地址验证失败:', error)
      toast({
        title: t('purchase.purchaseFailed'),
        description: t('purchase.invalidReferrer'),
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)

    try {
      // 获取节点价格
      const nodeConfig = selectedNodeType === 1 ? NODE_CONFIG.genesis : NODE_CONFIG.supreme
      const price = ethers.parseUnits(nodeConfig.price, 18)

      const usdtContract = await getUSDTContract(true)
      if (!usdtContract) throw new Error("Unable to get USDT contract")

      const nodeStakingAddress = (process.env.NEXT_PUBLIC_NODE_STAKING_ADDRESS || '').trim()

      // 检查USDT余额
      const balance = await usdtContract.balanceOf(account)
      if (balance < price) {
        toast({
          title: t('purchase.purchaseFailed'),
          description: t('purchase.insufficientBalance'),
          variant: "destructive",
        })
        return
      }

      // 检查合约是否暂停
      const stakingContractRead = await getNodeStakingContract()
      if (stakingContractRead) {
        try {
          const isPaused = await stakingContractRead.paused()
          if (isPaused) {
            toast({
              title: t('purchase.purchaseFailed'),
              description: t('purchase.contractPaused'),
              variant: "destructive",
            })
            return
          }
        } catch (e) {
          console.log("Unable to check contract status")
        }
      }

      // 检查当前授权额度
      const currentAllowance = await usdtContract.allowance(account, nodeStakingAddress)

      // 如果授权额度不足，先授权
      if (currentAllowance < price) {
        toast({
          title: t('purchase.approvingStep'),
          description: t('purchase.approvingUSDT'),
        })

        // 授权最大额度，避免后续购买需要再次授权
        const approveTx = await usdtContract.approve(
          nodeStakingAddress,
          ethers.MaxUint256
        )
        await approveTx.wait()
      }

      // 购买节点
      toast({
        title: currentAllowance < price ? t('purchase.purchasingStep') : t('purchase.purchasing'),
        description: t('purchase.purchasingNode'),
      })

      const stakingContract = await getNodeStakingContract(true)
      if (!stakingContract) throw new Error("Unable to get staking contract")

      // 1. 执行链上购买
      const buyTx = await stakingContract.buyNode(selectedNodeType, referrerAddress)
      // console.log('交易已发送:', buyTx.hash)
      // console.log('使用推荐人地址:', referrerAddress)

      // 2. 等待交易确认
      const receipt = await buyTx.wait()
      // console.log('交易已确认:', receipt.transactionHash)

      toast({
        title: t('purchase.purchaseSuccess'),
        description: selectedNodeType === 1 ? t('purchase.purchaseSuccessGenesis') : t('purchase.purchaseSuccessSupreme'),
      })

      setShowReferrerModal(false)

      // 3. ✅ 直接从链上读取最新用户信息（不等待后端）
      const userOnChainInfo = await stakingContract.getUserInfo(account)

      // ✅ 更新用户推荐人信息和用户类型标记（首次购买后会绑定推荐人）
      const newReferrer = userOnChainInfo.referrer && userOnChainInfo.referrer !== ethers.ZeroAddress
        ? userOnChainInfo.referrer
        : ""

      if (newReferrer) {
        setUserInfo(prev => ({ ...prev, referrer: newReferrer }))
        setIsOldUser(true) // 标记为老用户，下次购买不弹窗
        // console.log('推荐人已绑定:', newReferrer)
      } else {
        // 新用户首次购买，但没有推荐人（不应该发生）
        console.warn('购买成功但未绑定推荐人')
      }
      setReferrerAddress("")

      // ✅ 获取用户的节点总数（不是 directReferrals！）
      const nodeCount = await stakingContract.getNodeCount(account)
      // console.log('用户节点数量:', nodeCount.toString())

      // 读取新购买的节点（最后一个节点，索引从0开始）
      const newNodeIndex = Number(nodeCount) - 1
      const newNodeInfo = await stakingContract.getNodeInfo(account, newNodeIndex)
      // console.log('从链上读取新节点数据:', newNodeInfo)

      // 4. 立即更新前端状态 - 添加新节点
      const newNode = {
        index: newNodeIndex,
        nodeType: selectedNodeType,
        totalReward: ethers.formatUnits(newNodeInfo.totalReward, 18),
        claimedReward: ethers.formatUnits(newNodeInfo.claimedReward, 18),
        claimableReward: ethers.formatUnits(newNodeInfo.claimableReward, 18),
        startTime: Number(newNodeInfo.startTime),
        lastClaimTime: Number(newNodeInfo.lastClaimTime),
        elapsedDays: Number(newNodeInfo.elapsedDays)
      }

      setUserNodes((prevNodes) => [...prevNodes, newNode])

      // 5. 立即更新按钮状态（触发本地计算）
      setTimeout(() => {
        updateNodeClaimableStatus()
      }, 100)

      // 6. 后台触发同步和刷新总销售额（不阻塞UI）
      syncUserData(account).catch(err => console.warn('后台同步失败:', err))
      loadTotalSales().catch(err => console.warn('刷新总销售额失败:', err))
    } catch (error: any) {
      console.error("Purchase failed:", error)

      // 如果用户取消交易，显示友好提示
      if (isUserRejectedError(error)) {
        toast({
          title: t('purchase.cancelled'),
          description: t('purchase.transactionCancelled'),
        })
      } else {
        toast({
          title: t('purchase.purchaseFailed'),
          description: t('purchase.purchaseFailed'),
          variant: "destructive",
        })
      }
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleCancelPurchase = () => {
    setShowReferrerModal(false)
    setReferrerAddress("")
  }

  // 清空推荐人地址
  const handleClearReferrerAddress = () => {
    // 只有在用户没有绑定推荐人时才能清空
    if (!userInfo.referrer) {
      setReferrerAddress("")
      localStorage.removeItem("referrerAddress")
    }
  }

  // 加载总销售额（从后端 API）
  const loadTotalSales = async () => {
    try {
      const stats = await getTotalStats()
      if (!stats) return

      const salesInUSDT = ethers.formatUnits(stats.totalSales, 18)
      setTotalSales(salesInUSDT)

      // 计算百分比（总目标 3,000,000 USDT）
      const targetAmount = 3000000
      const percentage = (parseFloat(salesInUSDT) / targetAmount * 100).toFixed(2)
      setSalesPercentage(percentage)
    } catch (error) {
      console.error("Failed to load total sales:", error)
    }
  }

  // ✅ 加载团队业绩数据（从后端API读取，不限层级）
  const loadTeamPerformance = async () => {
    if (!account) return

    setIsLoadingTeamData(true)  // ✅ 开始加载
    try {
      // ✅ 从后端API获取团队业绩数据（不限层级）
      const teamData = await getTeamPerformance(account)

      setTeamPerformance(prev => ({
        ...prev,
        totalTeamSales: teamData.totalTeamSales,          // 已转换为USDT
        directSales: teamData.directSales,                // 已转换为USDT
        totalTeamNodes: teamData.totalTeamNodes,
        teamGenesisNodes: teamData.teamGenesisNodes,
        teamSupremeNodes: teamData.teamSupremeNodes,
        teamTotalMembers: teamData.teamTotalMembers,      // 不限层级
        directMembers: teamData.directMembers,            // 直推人数
        validNodes: teamData.validNodes,                  // 直推有效节点
        unlockedLevels: teamData.unlockedLevels,          // 解锁层深（直接使用后端返回值）
        level: teamData.level,                            // 用户等级
        minLineSales: teamData.minLineSales,              // 小区业绩
      }))
    } catch (error) {
      console.error("从后端API加载团队业绩失败:", error)
      toast({
        title: t('error'),
        description: "无法加载团队数据，请检查网络连接",
        variant: "destructive",
      })
    } finally {
      setIsLoadingTeamData(false)  // ✅ 加载完成
    }
  }

  // 加载用户数据（从链上直接读取核心数据）
  const loadUserData = async () => {
    if (!account) return

    setIsLoadingData(true)
    try {
      const stakingContract = await getNodeStakingContract()
      if (!stakingContract) {
        console.error("无法获取合约实例")
        setIsLoadingData(false)
        return
      }

      // ✅ 1. 从链上读取推荐奖励数据
      try {
        const rewardDetails = await stakingContract.getReferralRewardDetails(account)
        // console.log('从链上读取推荐奖励数据:', rewardDetails)

        setRewardData({
          totalReferralIncome: ethers.formatUnits(rewardDetails.totalClaimedAfterFee || "0", 18),
          pendingRewards: ethers.formatUnits(rewardDetails.pendingBeforeFee || "0", 18),
        })
      } catch (error) {
        console.error('从链上读取推荐奖励失败:', error)
        setRewardData({
          totalReferralIncome: "0.00",
          pendingRewards: "0.00",
        })
      }

      // ✅ 2. 批量读取节点数据（使用 getAllNodeInfo，性能优化）
      try {
        const allNodesData = await stakingContract.getAllNodeInfo(account)
        // console.log('批量查询节点数量:', allNodesData.length)

        const nodes = allNodesData.map((node: any) => ({
          index: Number(node.index),
          nodeType: Number(node.nodeType),
          totalReward: ethers.formatUnits(node.totalReward, 18),
          claimedReward: ethers.formatUnits(node.claimedReward, 18),
          claimableReward: ethers.formatUnits(node.claimableReward, 18),  // ✅ 实时计算
          startTime: Number(node.startTime),
          lastClaimTime: Number(node.lastClaimTime),
          elapsedDays: Math.min(100, Number(node.elapsedDays)),  // ✅ 合约已计算
        }))

        setUserNodes(nodes)
        // console.log('节点数据加载完成（批量查询）:', nodes)
      } catch (error) {
        console.error('批量查询节点数据失败:', error)
        setUserNodes([])
      }

      // ✅ 3. 从链上读取用户基本信息
      try {
        const userInfo = await stakingContract.getUserInfo(account)
        // console.log('从链上读取用户信息:', userInfo)

        // 获取直推列表
        const referralsList = await stakingContract.getReferrals(account)
        // console.log('从链上读取直推列表:', referralsList)

        // 统计直推节点数量（遍历每个直推，查询他们的节点数量）
        let totalDirectNodes = 0
        let validNodesCount = 0

        for (const referralAddress of referralsList) {
          try {
            const referralNodeCount = await stakingContract.getNodeCount(referralAddress)
            const referralInfo = await stakingContract.getUserInfo(referralAddress)

            totalDirectNodes += Number(referralNodeCount)
            if (referralInfo.isValidNode) {
              validNodesCount++
            }
          } catch (err) {
            console.warn(`查询直推 ${referralAddress} 信息失败:`, err)
          }
        }

        // ✅ 处理推荐人地址：如果是零地址，存储空字符串
        const referrerAddress = userInfo.referrer && userInfo.referrer !== ethers.ZeroAddress
          ? userInfo.referrer
          : ""

        setUserInfo({
          referrer: referrerAddress,
          directNodes: totalDirectNodes,
          validNodes: validNodesCount,
          directMembers: referralsList.length,
          teamMembers: 0, // 团队总人数需要递归计算，暂时从API读取
        })

        // ✅ 判断并标记用户类型：有推荐人 = 老用户
        const hasReferrer = referrerAddress !== ""
        setIsOldUser(hasReferrer)
        // console.log('用户类型:', hasReferrer ? '老用户（已有推荐人）' : '新用户（无推荐人）')
        // console.log('推荐人地址:', referrerAddress || '无')

        // console.log('用户信息加载完成')

        // 4. 团队业绩从API读取（需要递归计算，链上查询太慢）
        await loadTeamPerformance()

        // 5. 从后端API获取用户数据（等级、有效直推、解锁层深）
        try {
          const userApiInfo = await getUserInfoAPI(account)
          if (userApiInfo) {
            // ✅ 使用后端数据库的 directReferrals（每个用户只计数1次，不含复投）
            if (userApiInfo.directReferrals !== undefined) {
              // 更新 userInfo
              setUserInfo(prev => ({
                ...prev,
                validNodes: userApiInfo.directReferrals
              }))

              // ✅ 更新 teamPerformance.validNodes
              setTeamPerformance(prev => ({
                ...prev,
                validNodes: userApiInfo.directReferrals
              }))
            }

            // 注：unlockedLevels 和 level 现在从 loadTeamPerformance 获取
          }
        } catch (error) {
          console.warn('获取用户API数据失败:', error)
          // 如果API调用失败，保留链上统计的值（validNodesCount）
        }
      } catch (error) {
        console.error("从链上读取用户信息失败:", error)
        setUserInfo({
          referrer: "",
          directNodes: 0,
          validNodes: 0,
          directMembers: 0,
          teamMembers: 0,
        })
        setIsOldUser(false) // 重置为新用户
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }


  // 领取节点奖励
  const handleClaimNodeReward = async (nodeIndex: number) => {
    if (!account) return

    setClaimingNodeIndex(nodeIndex)
    try {
      const stakingContract = await getNodeStakingContract(true)
      if (!stakingContract) throw new Error("Unable to get staking contract")

      toast({
        title: t('rewards.claiming'),
        description: t('rewards.waitingConfirmation'),
      })

      // 1. 执行链上领取
      const tx = await stakingContract.claimNodeReward(nodeIndex)
      // console.log('交易已发送:', tx.hash)

      // 2. 等待交易确认
      const receipt = await tx.wait()
      // console.log('交易已确认:', receipt.transactionHash)

      toast({
        title: t('rewards.claimSuccess'),
        description: t('rewards.nodeRewardClaimed'),
      })

      // 3. ✅ 直接从链上读取最新数据（不等待后端）
      const updatedNodeInfo = await stakingContract.getNodeInfo(account, nodeIndex)
      // console.log('从链上读取的最新节点数据:', updatedNodeInfo)

      // 4. 立即更新前端状态
      setUserNodes((prevNodes) => {
        const newNodes = [...prevNodes]
        newNodes[nodeIndex] = {
          ...newNodes[nodeIndex],
          claimedReward: ethers.formatUnits(updatedNodeInfo.claimedReward, 18),
          claimableReward: ethers.formatUnits(updatedNodeInfo.claimableReward, 18),
          lastClaimTime: Number(updatedNodeInfo.lastClaimTime),
          elapsedDays: Number(updatedNodeInfo.elapsedDays)
        }
        return newNodes
      })

      // 5. 立即更新按钮状态（触发本地计算）
      setTimeout(() => {
        updateNodeClaimableStatus()
      }, 100)

      // 5. 后台触发同步（不阻塞UI，失败也不影响）
      syncUserData(account).catch(err => console.warn('后台同步失败:', err))
    } catch (error: any) {
      console.error("领取失败:", error)

      // 检查是否是24小时冷却限制错误
      const errorMessage = error.message?.toLowerCase() || error.toString().toLowerCase()
      if (errorMessage.includes('must wait 24 hours')) {
        toast({
          title: "领取失败",
          description: "每个节点需要间隔24小时才能再次领取奖励，请稍后再试",
          variant: "destructive",
        })
      }
      // 如果用户取消交易，显示友好提示
      else if (isUserRejectedError(error)) {
        toast({
          title: t('purchase.cancelled'),
          description: t('purchase.transactionCancelled'),
        })
      } else {
        toast({
          title: t('rewards.claimFailed'),
          description: t('rewards.claimFailed'),
          variant: "destructive",
        })
      }
    } finally {
      setClaimingNodeIndex(null)
    }
  }

  // 领取推荐奖励
  const handleClaimReferralReward = async () => {
    if (!account) return

    setIsClaimingReferralReward(true)
    try {
      const stakingContract = await getNodeStakingContract(true)
      if (!stakingContract) throw new Error("Unable to get staking contract")

      toast({
        title: t('rewards.claiming'),
        description: t('rewards.waitingConfirmation'),
      })

      // 1. 执行链上领取
      const tx = await stakingContract.claimReferralReward()
      // console.log('交易已发送:', tx.hash)

      // 2. 等待交易确认
      const receipt = await tx.wait()
      // console.log('交易已确认:', receipt.transactionHash)

      toast({
        title: t('rewards.claimSuccess'),
        description: t('rewards.referralRewardClaimed'),
      })

      // 3. ✅ 直接从链上读取最新推荐奖励数据（不等待后端）
      const updatedRewardDetails = await stakingContract.getReferralRewardDetails(account)
      // console.log('从链上读取的最新推荐奖励数据:', updatedRewardDetails)

      // 4. 立即更新前端状态
      setRewardData({
        totalReferralIncome: ethers.formatUnits(updatedRewardDetails.totalClaimedAfterFee || "0", 18),
        pendingRewards: ethers.formatUnits(updatedRewardDetails.pendingBeforeFee || "0", 18),
      })

      // 5. 后台触发同步（不阻塞UI，失败也不影响）
      syncUserData(account).catch(err => console.warn('后台同步失败:', err))
    } catch (error: any) {
      console.error("领取失败:", error)

      // 如果用户取消交易，显示友好提示
      if (isUserRejectedError(error)) {
        toast({
          title: t('purchase.cancelled'),
          description: t('purchase.transactionCancelled'),
        })
      } else {
        toast({
          title: t('rewards.claimFailed'),
          description: t('rewards.claimFailed'),
          variant: "destructive",
        })
      }
    } finally {
      setIsClaimingReferralReward(false)
    }
  }

  // 复制推荐链接
  const handleCopyReferralLink = async () => {
    // 检查是否是平台根地址
    const isPlatformRootAddress = account && CONTRACT_ADDRESSES.platformRoot &&
      account.toLowerCase() === CONTRACT_ADDRESSES.platformRoot.toLowerCase()

    if (!account || (!isPlatformRootAddress && userNodes.length === 0)) {
      toast({
        title: t('profile.copyFailed'),
        description: t('profile.needPurchaseFirst'),
        variant: "destructive",
      })
      return
    }

    const referralLink = `${window.location.origin}?ref=${account}`

    // 尝试复制到剪贴板
    const copied = await copyToClipboard(referralLink)

    if (copied) {
      // ✅ 复制成功：轻量级提示
      toast({
        title: t('profile.copied'),
        description: t('profile.copySuccess'),
      })
    } else {
      // ❌ 复制失败：打开手动复制弹窗
      setManualCopyLink(referralLink)
      setShowManualCopy(true)
    }
  }

  // 页面加载时加载总销售额
  useEffect(() => {
    loadTotalSales()
  }, [])

  // 当账户变化时重新加载数据
  useEffect(() => {
    if (account) {
      setIsOldUser(false) // 重置用户类型标记，等待 loadUserData 更新
      loadUserData()
    } else {
      // 断开钱包时重置所有状态
      setIsOldUser(false)
      setUserInfo({
        referrer: "",
        directNodes: 0,
        validNodes: 0,
        directMembers: 0,
        teamMembers: 0,
      })
    }
  }, [account])

  return (
    <div className="min-h-screen relative">
      {/* 背景图片层 */}
      <div
        className="fixed inset-0 z-[-10] bg-no-repeat bg-cover md:bg-center"
        style={{
          backgroundImage: "url('/20251113-015814.png')",
          backgroundPosition: "0% center"
        }}
      />
      {/* 科技感背景 */}
      <TechBackground />

      <Header onLogoClick={() => {
        setActiveMenu("dashboard")
        window.scrollTo({ top: 0, behavior: "smooth" })
      }} />

      {/* Main Content Section */}
      <section className="py-4 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            {/* 汉堡菜单 */}
            <div className="mb-4">
              {mounted ? (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300"
                    style={{
                      backgroundColor: "rgba(77, 173, 140, 0.2)",
                      color: "rgb(77, 173, 140)",
                      borderColor: "rgba(77, 173, 140, 0.5)"
                    }}
                  >
                    <Menu className="w-5 h-5" />
                    <span className="font-semibold text-sm">{t('nav.menu')}</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] bg-black border-r-2 p-0" style={{ borderColor: "rgba(77, 173, 140, 0.5)" }}>
                  <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
                  <nav className="flex flex-col pt-8">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveMenu(item.id)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full px-6 py-4 transition-all duration-300 flex items-center justify-start ${
                          activeMenu === item.id ? "font-semibold" : "hover:bg-white/10"
                        }`}
                        style={{
                          color: "rgb(77, 173, 140)",
                          backgroundColor: activeMenu === item.id ? "rgba(77, 173, 140, 0.2)" : "transparent"
                        }}
                      >
                        <span className="text-base">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
              ) : (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300"
                  style={{
                    backgroundColor: "rgba(77, 173, 140, 0.2)",
                    color: "rgb(77, 173, 140)",
                    borderColor: "rgba(77, 173, 140, 0.5)"
                  }}
                >
                  <Menu className="w-5 h-5" />
                  <span className="font-semibold text-sm">{t('nav.menu')}</span>
                </button>
              )}
            </div>

            {activeMenu === "dashboard" && (
                  <div className="pt-4 md:pt-8">
                      <div className="text-center mb-6 md:mb-12">
                        <h1 className="text-2xl md:text-4xl font-black" style={{ color: "rgb(77, 173, 140)" }}>
                          {displayText}
                          {!hasTyped && displayText.length < fullText.length && (
                            <span className="animate-pulse">|</span>
                          )}
                        </h1>

                        {/* Logo 图片 - 打字完成后显示 */}
                        {hasTyped && (
                          <div className="mt-4 md:mt-6 flex flex-col items-center gap-4">
                            <Image
                              src="/logo-infinity.png"
                              alt="Eternal Code Logo"
                              width={120}
                              height={60}
                              className="opacity-80"
                            />
                            <button
                              className="tech-btn tech-btn-auto px-8 md:px-12 py-2.5 rounded-xl font-bold text-base md:text-lg transition-all duration-300 border-2"
                              style={{
                                backgroundColor: "rgb(77, 173, 140)",
                                color: "black",
                                borderColor: "transparent"
                              }}
                              onClick={() => setActiveMenu("purchase")}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "black"
                                e.currentTarget.style.color = "rgb(77, 173, 140)"
                                e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                                e.currentTarget.style.color = "black"
                                e.currentTarget.style.borderColor = "transparent"
                              }}
                            >
                              {t('dashboard.joinButton')}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 卡片列表 */}
                      <div className="grid grid-cols-1 gap-4">
                        <div ref={card1Ref} data-card-id="1" className={`rounded-xl p-4 md:p-6 tech-card ${card1Visible ? 'animate-drop-in-left' : 'opacity-0'}`} style={{ backgroundColor: "rgb(77, 173, 140)" }}>
                          <div className="text-left space-y-3 md:space-y-4">
                            <div>
                              <p className="text-black font-bold text-base md:text-lg mb-1">{t('dashboard.card1.title')}</p>
                              <p className="text-black font-light text-sm md:text-base">{t('dashboard.card1.desc2')}</p>
                            </div>
                            <div>
                              <p className="text-black font-bold text-base md:text-lg mb-1">{t('dashboard.card1.desc1')}</p>
                              <p className="text-black font-light text-sm md:text-base">{t('dashboard.card1.desc1Sub')}</p>
                            </div>
                            <div>
                              <p className="text-black font-bold text-base md:text-lg mb-1">{t('dashboard.card1.desc3')}</p>
                              <p className="text-black font-light text-sm md:text-base">{t('dashboard.card1.desc3Sub')}</p>
                            </div>
                          </div>
                        </div>

                        <div ref={card3Ref} data-card-id="3" className={`rounded-2xl p-4 md:p-6 bg-black border-2 relative glow-card ${card3Visible ? 'animate-drop-in-right' : 'opacity-0'}`} style={{ borderColor: "rgba(77, 173, 140, 0.5)" }}>
                          <Image
                            src="/20251113-015747.png"
                            alt="QR Code"
                            width={60}
                            height={60}
                            className="absolute top-3 right-3 w-12 h-12 md:w-14 md:h-14"
                          />
                          <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-center text-white">{t('profile.referralLink')}</h3>
                          <div className="space-y-2 md:space-y-3">
                            <input
                              type="text"
                              readOnly
                              value={(() => {
                                if (!mounted || !account) return "--"
                                const isPlatformRootAddress = CONTRACT_ADDRESSES.platformRoot &&
                                  account.toLowerCase() === CONTRACT_ADDRESSES.platformRoot.toLowerCase()
                                if (isPlatformRootAddress || userNodes.length > 0) {
                                  return `${window.location.origin}?ref=${account}`
                                }
                                return "--"
                              })()}
                              className="w-full px-2 md:px-3 py-2 bg-black border-2 rounded-xl text-center font-mono text-xs md:text-sm break-all"
                              style={{ borderColor: "rgba(77, 173, 140, 0.5)", color: "rgb(77, 173, 140)" }}
                            />
                            <button
                              onClick={handleCopyReferralLink}
                              disabled={!mounted || !account || ((() => {
                                const isPlatformRootAddress = CONTRACT_ADDRESSES.platformRoot &&
                                  account.toLowerCase() === CONTRACT_ADDRESSES.platformRoot.toLowerCase()
                                return !isPlatformRootAddress && userNodes.length === 0
                              })())}
                              className="tech-btn w-full font-bold py-2 rounded-xl transition-all duration-300 text-xs md:text-sm border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                backgroundColor: "rgb(77, 173, 140)",
                                color: "black",
                                borderColor: "rgb(77, 173, 140)"
                              }}
                              onMouseEnter={(e) => {
                                if (!e.currentTarget.disabled) {
                                  e.currentTarget.style.backgroundColor = "black"
                                  e.currentTarget.style.color = "rgb(77, 173, 140)"
                                  e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                                e.currentTarget.style.color = "black"
                                e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                              }}
                            >
                              {t('profile.copyLink')}
                            </button>
                            <p className="text-xs text-center text-white opacity-70">
                              {t('profile.shareLink')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 社交媒体链接 */}
                      <div className={`mt-4 flex justify-center gap-4 transition-all duration-500 ${socialLinksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        <a
                          href="https://x.com/Code_EternalHQ"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tech-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border-2"
                          style={{
                            backgroundColor: "black",
                            color: "rgb(77, 173, 140)",
                            borderColor: "rgba(77, 173, 140, 0.5)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                            e.currentTarget.style.color = "black"
                            e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "black"
                            e.currentTarget.style.color = "rgb(77, 173, 140)"
                            e.currentTarget.style.borderColor = "rgba(77, 173, 140, 0.5)"
                          }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          <span>Twitter</span>
                        </a>
                        <a
                          href="https://t.me/EternalCodeHQ"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tech-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border-2"
                          style={{
                            backgroundColor: "black",
                            color: "rgb(77, 173, 140)",
                            borderColor: "rgba(77, 173, 140, 0.5)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                            e.currentTarget.style.color = "black"
                            e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "black"
                            e.currentTarget.style.color = "rgb(77, 173, 140)"
                            e.currentTarget.style.borderColor = "rgba(77, 173, 140, 0.5)"
                          }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                          <span>Telegram</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {activeMenu === "purchase" && (
                    <div>
                      {/* Progress Section */}
                      <div className="mb-6 md:mb-12 text-center">
                        <h1 className="text-2xl md:text-4xl font-black" style={{ color: "rgb(77, 173, 140)" }}>
                          {t('purchase.presaleInProgress')}
                        </h1>
                      </div>

                      {/* Node Selection Cards */}
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        {/* Genesis Node Card */}
                        <div
                          onClick={() => setSelectedNodeType(1)}
                          className={`tech-card bg-black rounded-2xl p-3 md:p-5 border-4 transition-all duration-300 text-white relative overflow-hidden cursor-pointer animate-drop-in-left ${
                            selectedNodeType === 1 ? 'scale-105 animate-border-glow' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{
                            borderColor: selectedNodeType === 1 ? "rgb(77, 173, 140)" : "rgba(77, 173, 140, 0.3)",
                            animationDelay: "0s, 0s"
                          }}
                        >
                          {/* 选中标记 */}
                          {selectedNodeType === 1 && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgb(77, 173, 140)" }}>
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <Image
                            src="/20251113-015803.png"
                            alt={t('purchase.genesisNode')}
                            width={60}
                            height={60}
                            className="mx-auto w-12 h-12 md:w-16 md:h-16 object-contain animate-bounce-subtle mb-2"
                          />
                          <div className="text-center">
                            <h3 className="text-sm md:text-lg font-black uppercase tracking-wider mb-1">{t('purchase.genesisNode')}</h3>
                            <div className="text-xl md:text-2xl font-black" style={{ color: "rgb(77, 173, 140)" }}>{t('purchase.genesisPrice')}</div>
                          </div>
                        </div>

                        {/* Supreme Node Card */}
                        <div
                          onClick={() => setSelectedNodeType(2)}
                          className={`tech-card bg-black rounded-2xl p-3 md:p-5 border-4 transition-all duration-300 text-white relative overflow-hidden cursor-pointer animate-drop-in-right ${
                            selectedNodeType === 2 ? 'scale-105 animate-border-glow' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{
                            borderColor: selectedNodeType === 2 ? "rgb(77, 173, 140)" : "rgba(77, 173, 140, 0.3)",
                            animationDelay: "0.2s, 1.5s"
                          }}
                        >
                          {/* 选中标记 */}
                          {selectedNodeType === 2 && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgb(77, 173, 140)" }}>
                              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          <Image
                            src="/20251113-015737.png"
                            alt={t('purchase.supremeNode')}
                            width={60}
                            height={60}
                            className="mx-auto w-12 h-12 md:w-16 md:h-16 object-contain animate-bounce-subtle mb-2"
                            style={{ animationDelay: "1s" }}
                          />
                          <div className="text-center">
                            <h3 className="text-sm md:text-lg font-black uppercase tracking-wider mb-1">{t('purchase.supremeNode')}</h3>
                            <div className="text-xl md:text-2xl font-black" style={{ color: "rgb(77, 173, 140)" }}>{t('purchase.supremePrice')}</div>
                          </div>
                        </div>
                      </div>

                      {/* 购买按钮 */}
                      <div className="mt-6">
                        <button
                          onClick={() => handleBuyNode(selectedNodeType)}
                          className="tech-btn tech-btn-auto w-full font-black py-3 md:py-4 rounded-xl transition-all duration-300 text-base md:text-lg uppercase tracking-wide border-2"
                          style={{
                            backgroundColor: "rgb(77, 173, 140)",
                            color: "black",
                            borderColor: "transparent"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "black"
                            e.currentTarget.style.color = "rgb(77, 173, 140)"
                            e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                            e.currentTarget.style.color = "black"
                            e.currentTarget.style.borderColor = "transparent"
                          }}
                        >
                          {t('purchase.confirmPurchase')} {selectedNodeType === 1 ? t('purchase.genesisNode') : t('purchase.supremeNode')}
                        </button>
                      </div>

                      {/* 节点收益说明卡片 - 打字机效果 */}
                      <div className="mt-6 rounded-xl p-4 md:p-6" style={{ backgroundColor: "rgb(77, 173, 140)" }}>
                        <div className="text-left space-y-3 md:space-y-4">
                          <div>
                            <p className="text-black font-bold text-base md:text-lg mb-1">
                              {purchaseCardLines[0] || ""}
                              {!purchaseCardTypingDone && purchaseCardLines.length === 1 && <span className="animate-pulse">|</span>}
                            </p>
                            {purchaseCardLines[1] !== undefined && (
                              <p className="text-black font-light text-sm md:text-base">
                                {purchaseCardLines[1]}
                                {!purchaseCardTypingDone && purchaseCardLines.length === 2 && <span className="animate-pulse">|</span>}
                              </p>
                            )}
                            {purchaseCardLines[2] !== undefined && (
                              <p className="text-black font-medium text-sm md:text-base mt-1">
                                {purchaseCardLines[2]}
                                {!purchaseCardTypingDone && purchaseCardLines.length === 3 && <span className="animate-pulse">|</span>}
                              </p>
                            )}
                          </div>
                          {purchaseCardLines[3] !== undefined && (
                            <div>
                              <p className="text-black font-bold text-base md:text-lg mb-1">
                                {purchaseCardLines[3]}
                                {!purchaseCardTypingDone && purchaseCardLines.length === 4 && <span className="animate-pulse">|</span>}
                              </p>
                              {purchaseCardLines[4] !== undefined && (
                                <p className="text-black font-light text-sm md:text-base">
                                  {purchaseCardLines[4]}
                                  {!purchaseCardTypingDone && purchaseCardLines.length === 5 && <span className="animate-pulse">|</span>}
                                </p>
                              )}
                              {purchaseCardLines[5] !== undefined && (
                                <p className="text-black font-medium text-sm md:text-base mt-1">
                                  {purchaseCardLines[5]}
                                  {!purchaseCardTypingDone && purchaseCardLines.length === 6 && <span className="animate-pulse">|</span>}
                                </p>
                              )}
                            </div>
                          )}
                          {purchaseCardLines[6] !== undefined && (
                            <div className="pt-2 border-t border-black/20">
                              <p className="text-black font-light text-xs md:text-sm">
                                {purchaseCardLines[6]}
                                {!purchaseCardTypingDone && purchaseCardLines.length === 7 && <span className="animate-pulse">|</span>}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                  {activeMenu === "profile" && (
                    <div>
                      {/* 标题 */}
                      <div className="mb-6 md:mb-12 text-center">
                        <h1 className="text-2xl md:text-4xl font-black" style={{ color: "rgb(77, 173, 140)" }}>
                          {t('profile.title')}
                        </h1>
                      </div>

                      {/* 综合业绩卡片 */}
                      <div className="rounded-2xl p-4 md:p-6 bg-black border-2 glow-card" style={{ borderColor: "rgba(77, 173, 140, 0.5)" }}>
                        {/* 用户等级模块 */}
                        <div className="mb-5 pb-5 border-b-2 flex items-center justify-between" style={{ borderColor: "rgba(77, 173, 140, 0.3)" }}>
                          <div className="text-left">
                            <p className="text-3xl md:text-4xl font-black" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingTeamData ? "..." : teamPerformance.level}
                            </p>
                            <p className="text-xs text-white">{t('profile.currentLevel')}</p>
                          </div>
                          <div className="animate-pulse-slow">
                            <Image
                              src="/award.png"
                              alt="Level Badge"
                              width={64}
                              height={64}
                              className="w-14 h-14 md:w-16 md:h-16 object-contain"
                              style={{
                                filter: "brightness(0) saturate(100%) invert(58%) sepia(52%) saturate(405%) hue-rotate(107deg) brightness(92%) contrast(87%)"
                              }}
                            />
                          </div>
                        </div>

                        {/* 个人业绩标题 */}
                        <h4 className="text-sm font-bold text-white mb-3">{t('profile.personalPerformance')}</h4>

                        {/* 个人节点统计 - 3列 */}
                        <div className="grid grid-cols-3 gap-2 mb-5 pb-5 border-b-2" style={{ borderColor: "rgba(77, 173, 140, 0.3)" }}>
                          <div className="text-center">
                            <p className="font-bold text-xl md:text-2xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {userNodes.filter(node => node.nodeType === 1).length}
                            </p>
                            <p className="font-light text-xs text-white">{t('profile.genesisNodes')}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-xl md:text-2xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {userNodes.filter(node => node.nodeType === 2).length}
                            </p>
                            <p className="font-light text-xs text-white">{t('profile.supremeNodes')}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-xl md:text-2xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {(() => {
                                const genesisCount = userNodes.filter(node => node.nodeType === 1).length
                                const supremeCount = userNodes.filter(node => node.nodeType === 2).length
                                return ((genesisCount * 100) + (supremeCount * 1000)).toLocaleString()
                              })()}
                            </p>
                            <p className="font-light text-xs text-white">{t('profile.totalInvestment')}</p>
                          </div>
                        </div>

                        {/* 团队业绩标题 */}
                        <h4 className="text-sm font-bold text-white mb-3">{t('profile.teamPerformance')}</h4>

                        {/* 团队业绩 - 2列大数字 */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(77, 173, 140, 0.1)" }}>
                            <p className="font-black text-lg md:text-xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingTeamData ? "..." : parseFloat(teamPerformance.totalTeamSales).toLocaleString()}
                            </p>
                            <p className="text-xs text-white">{t('profile.totalTeamSales')}</p>
                          </div>
                          <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(77, 173, 140, 0.1)" }}>
                            <p className="font-black text-lg md:text-xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingTeamData ? "..." : parseFloat(teamPerformance.directSales).toLocaleString()}
                            </p>
                            <p className="text-xs text-white">{t('profile.directSales')}</p>
                          </div>
                        </div>

                        {/* 团队人数统计 - 3列 */}
                        <div className="grid grid-cols-3 gap-2 rounded-xl p-3" style={{ backgroundColor: "rgba(77, 173, 140, 0.05)" }}>
                          <div className="text-center">
                            <p className="font-bold text-lg md:text-xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingTeamData ? "..." : teamPerformance.teamTotalMembers}
                            </p>
                            <p className="font-light text-xs text-white">{t('profile.teamMembers')}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg md:text-xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingTeamData ? "..." : teamPerformance.directMembers}
                            </p>
                            <p className="font-light text-xs text-white">{t('profile.directMembers')}</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg md:text-xl" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingTeamData ? "..." : teamPerformance.unlockedLevels}
                            </p>
                            <p className="font-light text-xs text-white">{t('profile.unlockedLevels')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeMenu === "nodes" && (
                    <div>
                      {/* 推荐奖励卡片 */}
                      <div className="rounded-2xl p-4 md:p-6 mb-4 md:mb-6 bg-black border-2 glow-card" style={{ borderColor: "rgba(77, 173, 140, 0.5)" }}>
                        <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-white">{t('rewards.referralRewards')}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                          {/* 累计推荐收益 */}
                          <div className="text-center">
                            <div className="text-2xl md:text-3xl font-black mb-2" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingData ? "..." : parseFloat(rewardData.totalReferralIncome).toFixed(2)} USDT
                            </div>
                            <div className="text-sm md:text-base font-bold text-white">{t('rewards.totalReferralIncome')}</div>
                          </div>

                          {/* 待领取奖励 */}
                          <div className="text-center">
                            <div className="text-2xl md:text-3xl font-black mb-2" style={{ color: "rgb(77, 173, 140)" }}>
                              {isLoadingData ? "..." : parseFloat(rewardData.pendingRewards).toFixed(2)} USDT
                            </div>
                            <div className="text-sm md:text-base font-bold text-white">{t('rewards.pendingRewards')}</div>
                          </div>
                        </div>

                        {/* 领取推荐奖励按钮 */}
                        <button
                          onClick={handleClaimReferralReward}
                          disabled={!mounted || !account || isClaimingReferralReward || parseFloat(rewardData.pendingRewards) <= 0}
                          className="tech-btn w-full font-black py-2.5 md:py-3 rounded-xl transition-all duration-300 text-sm md:text-base border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: "rgb(77, 173, 140)",
                            color: "black",
                            borderColor: "rgb(77, 173, 140)"
                          }}
                          onMouseEnter={(e) => {
                            if (!e.currentTarget.disabled) {
                              e.currentTarget.style.backgroundColor = "black"
                              e.currentTarget.style.color = "rgb(77, 173, 140)"
                              e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                            e.currentTarget.style.color = "black"
                            e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                          }}
                        >
                          {isClaimingReferralReward ? t('rewards.processing') : t('rewards.claimReferralRewards')}
                        </button>
                      </div>

                      {/* 节点奖励领取列表 */}
                      {userNodes.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-white opacity-70 text-lg">{t('rewards.noNodes')}</p>
                        </div>
                      ) :
                        userNodes.map((node) => {
                            const runningDays = node.elapsedDays
                            const purchaseDate = new Date(node.startTime * 1000).toLocaleDateString()

                            return (
                              <div key={node.index} className="relative p-4 md:p-6 bg-transparent border-b transition-all duration-300 hover:bg-opacity-5 mb-4"
                                style={{
                                  borderColor: "rgb(77, 173, 140)",
                                  borderLeft: "1px solid rgb(77, 173, 140)"
                                }}>
                                {/* 节点类型和购买时间 */}
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2 md:gap-4">
                                  <div className="flex items-center gap-3">
                                    <span className="inline-block px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-semibold border-2"
                                      style={{
                                        backgroundColor: "rgba(77, 173, 140, 0.2)",
                                        color: "rgb(77, 173, 140)",
                                        borderColor: "rgba(77, 173, 140, 0.5)"
                                      }}>
                                      {node.nodeType === 1 ? t('purchase.genesisNode') : t('purchase.supremeNode')}
                                    </span>
                                  </div>
                                  <div className="text-xs md:text-sm text-white opacity-70">
                                    {t('rewards.purchaseTime')}: {purchaseDate}
                                  </div>
                                </div>

                                {/* 奖励信息网格 - 4列布局 */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white opacity-70">{t('rewards.totalReward')}:</span>
                                    <span className="font-semibold text-sm md:text-base text-white">{parseFloat(node.totalReward).toFixed(2)} VETC</span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white opacity-70">{t('rewards.claimed')}:</span>
                                    <span className="font-semibold text-sm md:text-base text-white">0.00 VETC</span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white opacity-70">{t('rewards.claimable')}:</span>
                                    <span className="font-semibold text-base md:text-lg" style={{ color: "rgb(77, 173, 140)" }}>
                                      0.00 VETC
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs md:text-sm text-white opacity-70">{t('rewards.runningDays')}:</span>
                                    <span className="font-semibold text-sm md:text-base text-white">0 / 100 {t('rewards.days')}</span>
                                  </div>
                                </div>

                                {/* 领取按钮 */}
                                <div className="flex gap-3 items-center flex-wrap">
                                  <button
                                    onClick={() => handleClaimNodeReward(node.index)}
                                    disabled={true}
                                    className="tech-btn font-black py-2 md:py-2.5 px-4 md:px-6 rounded-xl transition-all duration-300 text-xs md:text-sm border-2 w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                      backgroundColor: "rgb(77, 173, 140)",
                                      color: "black",
                                      borderColor: "rgb(77, 173, 140)"
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.backgroundColor = "black"
                                        e.currentTarget.style.color = "rgb(77, 173, 140)"
                                        e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "rgb(77, 173, 140)"
                                      e.currentTarget.style.color = "black"
                                      e.currentTarget.style.borderColor = "rgb(77, 173, 140)"
                                    }}
                                  >
                                    {claimingNodeIndex === node.index ? t('rewards.processing') : t('rewards.claimButton')}
                                  </button>
                                </div>
                              </div>
                            )
                          })
                      }
                    </div>
                  )}
          </div>
        </div>
      </section>

      {/* 邀请人输入弹窗 */}
      {showReferrerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10001]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-2 text-black text-center">{t('purchase.modalTitle')}{selectedNodeType}</h3>
            <p className="text-black text-sm mb-6 text-center">{t('purchase.modalWarning')}</p>
            <div className="mb-6">
              <label className="block mb-2 font-medium text-black">{t('purchase.referrerAddress')}:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x..."
                  value={referrerAddress}
                  onChange={(e) => setReferrerAddress(e.target.value)}
                  disabled={!mounted || !!userInfo.referrer}
                  className="flex-1 px-4 py-3 border rounded-lg text-base focus:outline-none focus:ring-2 transition-all bg-white text-black border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed break-all"
                  style={{ wordBreak: 'break-all' }}
                />
                {!userInfo.referrer && referrerAddress && (
                  <button
                    onClick={handleClearReferrerAddress}
                    className="px-4 py-3 rounded-lg font-medium transition-all duration-300 bg-red-500 text-white hover:bg-red-600 flex-shrink-0"
                    type="button"
                  >
                    删除
                  </button>
                )}
              </div>
              {userInfo.referrer && (
                <p className="text-xs text-gray-500 mt-1">{t('purchase.referrerLocked')}</p>
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleCancelPurchase}
                className="flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-black text-white hover:opacity-80"
              >
                {t('purchase.cancel')}
              </button>
              <button
                onClick={handleConfirmPurchase}
                disabled={!mounted || isPurchasing}
                className="flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "rgb(77, 173, 140)", color: "black" }}
              >
                {isPurchasing ? t('purchase.processing') : t('purchase.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 手动复制链接对话框 */}
      <Dialog open={showManualCopy} onOpenChange={setShowManualCopy}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('profile.manualCopyTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={manualCopyLink}
              readOnly
              onClick={(e) => e.currentTarget.select()}
              onFocus={(e) => e.currentTarget.select()}
              rows={3}
              className="w-full p-3 text-sm font-mono bg-muted rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-sm text-muted-foreground text-center">
              {t('profile.manualCopyHint')}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
