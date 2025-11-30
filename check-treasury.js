const { ethers } = require('ethers');
const NodeStakingV5ABI = require('./abi/NodeStakingV5.json');
require('dotenv').config({ path: '.env.local' });

async function checkTreasury() {
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NODE_STAKING_ADDRESS;
  const EXPECTED_TREASURY = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, NodeStakingV5ABI, provider);

  try {
    console.log('=== 检查合约 Treasury 状态 ===\n');
    console.log('代理合约地址:', CONTRACT_ADDRESS);
    console.log('预期 Treasury 地址:', EXPECTED_TREASURY);
    console.log('');

    // 读取当前 treasury 地址
    const currentTreasury = await contract.treasury();
    console.log('当前 Treasury 地址:', currentTreasury);
    console.log('');

    // 检查是否匹配
    const isZeroAddress = currentTreasury === '0x0000000000000000000000000000000000000000';
    const isCorrect = currentTreasury.toLowerCase() === EXPECTED_TREASURY.toLowerCase();

    if (isZeroAddress) {
      console.log('❌ Treasury 地址为零地址（未设置）');
      console.log('');
      console.log('需要执行的操作：');
      console.log('调用 setTreasury() 函数设置 Treasury 地址');
      console.log(`参数: ${EXPECTED_TREASURY}`);
    } else if (isCorrect) {
      console.log('✅ Treasury 地址已正确设置');
    } else {
      console.log('⚠️  Treasury 地址已设置但不匹配预期值');
      console.log('');
      console.log('需要执行的操作：');
      console.log('调用 setTreasury() 函数更新 Treasury 地址');
      console.log(`参数: ${EXPECTED_TREASURY}`);
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

checkTreasury();
