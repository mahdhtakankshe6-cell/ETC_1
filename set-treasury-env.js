const { ethers } = require('ethers');
const NodeStakingV5ABI = require('./abi/NodeStakingV5.json');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setTreasury() {
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NODE_STAKING_ADDRESS;
  const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;

  console.log('\n=== 设置 Treasury 地址 ===\n');
  console.log('代理合约地址:', CONTRACT_ADDRESS);
  console.log('Treasury 地址:', TREASURY_ADDRESS);
  console.log('');

  // 读取 .env.treasury 文件
  const envPath = path.join(__dirname, '.env.treasury');
  if (!fs.existsSync(envPath)) {
    console.error('❌ 找不到 .env.treasury 文件');
    console.log('请先创建 .env.treasury 文件并填入私钥');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');

  // 匹配非注释行的 TREASURY_PRIVATE_KEY
  const match = envContent.match(/^TREASURY_PRIVATE_KEY=([^\s\r\n]+)/m);

  if (!match || !match[1] || match[1].trim() === '') {
    console.error('❌ 未在 .env.treasury 文件中找到私钥');
    console.log('请在 .env.treasury 文件中设置: TREASURY_PRIVATE_KEY=你的私钥');
    return;
  }

  let privateKey = match[1].trim();

  // 添加 0x 前缀（如果没有）
  if (!privateKey.startsWith('0x')) {
    privateKey = '0x' + privateKey;
  }

  // 验证长度（0x + 64位十六进制 = 66位）
  if (privateKey.length !== 66) {
    console.error('❌ 私钥格式错误');
    console.log('当前长度:', privateKey.length);
    console.log('应为: 66 (包括0x前缀)');
    return;
  }

  // 验证是否是有效的十六进制
  if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    console.error('❌ 私钥包含无效字符（应该只包含0-9和a-f）');
    return;
  }

  try {
    // 创建 provider 和 wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('钱包地址:', wallet.address);

    // 验证是否是正确的地址
    if (wallet.address.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      console.error('\n❌ 警告: 钱包地址与 Treasury 地址不匹配！');
      console.log('预期:', TREASURY_ADDRESS);
      console.log('实际:', wallet.address);
      console.log('\n请检查私钥是否正确');
      return;
    }

    console.log('✅ 地址验证通过');

    // 创建合约实例
    const contract = new ethers.Contract(CONTRACT_ADDRESS, NodeStakingV5ABI, wallet);

    // 先检查当前 treasury
    console.log('\n检查当前 treasury 状态...');
    const currentTreasury = await contract.treasury();
    console.log('当前 Treasury 地址:', currentTreasury);

    if (currentTreasury.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
      console.log('\n✅ Treasury 地址已经正确设置，无需重复设置');
      return;
    }

    const isZero = currentTreasury === '0x0000000000000000000000000000000000000000';
    console.log('状态:', isZero ? '未设置（零地址）' : '已设置但不正确');

    // 获取 gas 价格
    const feeData = await provider.getFeeData();
    console.log('\nGas 价格:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'Gwei');

    // 估算 gas
    console.log('估算 gas...');
    const estimatedGas = await contract.setTreasury.estimateGas(TREASURY_ADDRESS);
    console.log('预估 Gas:', estimatedGas.toString());

    const gasCost = estimatedGas * feeData.gasPrice * 120n / 100n;
    console.log('预估费用:', ethers.formatEther(gasCost), 'MATIC');

    // 调用 setTreasury
    console.log('\n正在调用 setTreasury...');
    const tx = await contract.setTreasury(TREASURY_ADDRESS, {
      gasLimit: estimatedGas * 120n / 100n // 增加 20% buffer
    });

    console.log('\n✅ 交易已发送!');
    console.log('交易哈希:', tx.hash);
    console.log('查看交易:', `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${tx.hash}`);

    console.log('\n⏳ 等待交易确认...');
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log('\n✅ 交易成功确认!');
      console.log('区块号:', receipt.blockNumber);
      console.log('Gas 使用:', receipt.gasUsed.toString());
      console.log('实际费用:', ethers.formatEther(receipt.gasUsed * receipt.gasPrice), 'MATIC');

      // 再次检查 treasury
      console.log('\n验证设置结果...');
      const newTreasury = await contract.treasury();
      console.log('新的 Treasury 地址:', newTreasury);

      if (newTreasury.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
        console.log('\n🎉🎉🎉 Treasury 地址设置成功! 🎉🎉🎉');
        console.log('✅ 平台地址现在将不参与分红计算');
        console.log('\n合约升级流程完全完成！');
      } else {
        console.log('\n❌ 设置失败: 地址不匹配');
      }
    } else {
      console.log('\n❌ 交易失败');
    }

  } catch (error) {
    console.error('\n❌ 错误:', error.message);

    if (error.code === 'CALL_EXCEPTION') {
      console.log('\n可能的原因:');
      console.log('1. 该钱包不是合约 owner');
      console.log('2. 合约已暂停');
      console.log('3. 合约权限配置问题');
    }

    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.log('\n❌ 钱包余额不足，无法支付 gas 费用');
    }
  }
}

setTreasury();
