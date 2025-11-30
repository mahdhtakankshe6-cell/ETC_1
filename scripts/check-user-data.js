const https = require('https');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://code-kk.duckdns.org';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 404) {
          resolve({ status: 404, data: null });
        } else if (res.statusCode === 200) {
          try {
            resolve({ status: 200, data: JSON.parse(data) });
          } catch (e) {
            reject(new Error('JSON 解析失败'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function fetchUserData(address) {
  console.log('\n========================================');
  console.log('📍 查询地址:', address);
  console.log('========================================\n');

  try {
    // 1. 获取用户基本信息
    console.log('📋 用户基本信息:');
    const userInfoResult = await httpsGet(`${API_BASE_URL}/api/users/${address}`);

    if (userInfoResult.status === 404) {
      console.log('⚠️  用户不存在（404）\n');
    } else if (userInfoResult.status === 200) {
      const userInfo = userInfoResult.data.data;

      console.log('  推荐人:', userInfo.referrer || '无');
      console.log('  节点数量:', userInfo.nodeCount);
      console.log('  总投资:', userInfo.totalInvestment, 'wei');
      console.log('  有效直推:', userInfo.directReferrals);
      console.log('  解锁层深:', userInfo.unlockedLevels);
      console.log('  用户等级:', userInfo.level);
      console.log('  是否有效节点:', userInfo.isValidNode);

      if (userInfo.referralRewards) {
        console.log('  \n  💰 推荐奖励:');
        console.log('    - 已领取（扣费后）:', userInfo.referralRewards.totalClaimedAfterFee, 'USDT');
        console.log('    - 待领取（扣费前）:', userInfo.referralRewards.pendingBeforeFee, 'USDT');
      }

      if (userInfo.nodes && userInfo.nodes.length > 0) {
        console.log('  \n  📦 节点列表:');
        userInfo.nodes.forEach(node => {
          console.log(`    - 节点 #${node.index}:`, node.nodeType === 1 ? 'Genesis' : 'Supreme');
          console.log(`      总奖励: ${node.totalReward} wei`);
          console.log(`      已领取: ${node.claimedReward} wei`);
        });
      }
      console.log('');
    }

    // 2. 获取团队业绩数据
    console.log('📊 团队业绩数据:');
    const teamResult = await httpsGet(`${API_BASE_URL}/api/users/${address}/team-performance`);

    if (teamResult.status === 404) {
      console.log('⚠️  团队数据不存在（404）\n');
    } else if (teamResult.status === 200) {
      const team = teamResult.data.data;

      console.log('  用户投资:', team.userInvestment, 'wei');
      console.log('  用户节点数:', team.userNodes.length);
      console.log('  \n  👥 直推数据:');
      console.log('    - 直推总人数:', team.directReferralsCount);
      console.log('    - 直推销售额:', team.directSales, 'wei');
      console.log('    - 直推节点 (Genesis/Supreme/Total):', `${team.directNodes.genesis}/${team.directNodes.supreme}/${team.directNodes.total}`);
      console.log('    - 有效直推人数:', team.validDirectReferrals);

      console.log('  \n  🌳 团队数据:');
      console.log('    - 团队总销售额:', team.teamTotalSales, 'wei');
      console.log('    - 团队总人数:', team.teamTotalMembers);
      console.log('    - 团队节点 (Genesis/Supreme/Total):', `${team.teamNodes.genesis}/${team.teamNodes.supreme}/${team.teamNodes.total}`);

      console.log('  \n  🎯 等级信息:');
      console.log('    - 用户等级:', team.level);
      console.log('    - 解锁层深:', team.unlockedLevels);
      console.log('    - 小区业绩:', team.minLineSales, 'wei');
      console.log('');
    }

    // 3. 获取推荐列表
    console.log('👨‍👩‍👧‍👦 推荐列表:');
    const referralsResult = await httpsGet(`${API_BASE_URL}/api/users/${address}/referrals`);

    if (referralsResult.status === 404) {
      console.log('⚠️  推荐列表不存在（404）\n');
    } else if (referralsResult.status === 200) {
      const referrals = referralsResult.data.data;

      if (referrals && referrals.length > 0) {
        console.log(`  共 ${referrals.length} 个直推:\n`);
        referrals.forEach((ref, index) => {
          console.log(`  ${index + 1}. ${ref.address}`);
          console.log(`     - 节点数: ${ref.nodeCount}`);
          console.log(`     - 投资: ${ref.totalInvestment} wei`);
          console.log(`     - 等级: ${ref.level}`);
        });
        console.log('');
      } else {
        console.log('  暂无直推\n');
      }
    }

  } catch (error) {
    console.error('❌ 发生错误:', error.message);
  }

  console.log('========================================\n');
}

// 执行查询
const address = process.argv[2] || '0x08Ff9EA21F8A637c8c2b3C600596d2e6F9b6ee91';
fetchUserData(address);
