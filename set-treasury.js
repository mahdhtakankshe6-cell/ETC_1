const { ethers } = require('ethers');
const NodeStakingV5ABI = require('./abi/NodeStakingV5.json');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

async function setTreasury() {
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NODE_STAKING_ADDRESS;
  const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;

  console.log('\n=== 设置 Treasury 地址 ===\n');
  console.log('代理合约地址:', CONTRACT_ADDRESS);
  console.log('Treasury 地址:', TREASURY_ADDRESS);
  console.log('');

  // 提示用户输入私钥
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const privateKey = await new Promise((resolve) => {
    rl.question('请输入 owner 钱包私钥 (0x69E39fa02baf2F6F3b1B9bcF3D9a1906c6E14595): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });

  if (!privateKey || privateKey.length < 64) {
    console.error('❌ 私钥格式错误');
    return;
  }

  try {
    // 创建 provider 和 wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('\n钱包地址:', wallet.address);

    // 验证是否是正确的地址
    if (wallet.address.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
      console.error('❌ 警告: 钱包地址与 Treasury 地址不匹配！');
      console.log('预期:', TREASURY_ADDRESS);
      console.log('实际:', wallet.address);
      return;
    }

    // 创建合约实例
    const contract = new ethers.Contract(CONTRACT_ADDRESS, NodeStakingV5ABI, wallet);

    // 先检查当前 treasury
    console.log('\n检查当前 treasury 状态...');
    const currentTreasury = await contract.treasury();
    console.log('当前 Treasury 地址:', currentTreasury);

    if (currentTreasury.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
      console.log('✅ Treasury 地址已经正确设置，无需重复设置');
      return;
    }

    // 获取 gas 价格
    const feeData = await provider.getFeeData();
    console.log('\nGas 价格:', ethers.formatUnits(feeData.gasPrice, 'gwei'), 'Gwei');

    // 估算 gas
    console.log('\n估算 gas...');
    const estimatedGas = await contract.setTreasury.estimateGas(TREASURY_ADDRESS);
    console.log('预估 Gas:', estimatedGas.toString());

    // 调用 setTreasury
    console.log('\n正在调用 setTreasury...');
    const tx = await contract.setTreasury(TREASURY_ADDRESS, {
      gasLimit: estimatedGas * 120n / 100n // 增加 20% buffer
    });

    console.log('交易已发送!');
    console.log('交易哈希:', tx.hash);
    console.log('查看交易:', `${process.env.NEXT_PUBLIC_BLOCK_EXPLORER}/tx/${tx.hash}`);

    console.log('\n等待交易确认...');
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log('✅ 交易成功确认!');
      console.log('区块号:', receipt.blockNumber);
      console.log('Gas 使用:', receipt.gasUsed.toString());

      // 再次检查 treasury
      console.log('\n验证设置结果...');
      const newTreasury = await contract.treasury();
      console.log('新的 Treasury 地址:', newTreasury);

      if (newTreasury.toLowerCase() === TREASURY_ADDRESS.toLowerCase()) {
        console.log('\n✅✅✅ Treasury 地址设置成功! ✅✅✅');
        console.log('平台地址现在将不参与分红计算');
      } else {
        console.log('❌ 设置失败: 地址不匹配');
      }
    } else {
      console.log('❌ 交易失败');
    }

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    if (error.data) {
      console.error('错误数据:', error.data);
    }
  }
}

setTreasury();
