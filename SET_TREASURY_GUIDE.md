# 设置 Treasury 地址操作指南

## 背景
合约已成功升级到新实现，但还需要最后一步：调用 `setTreasury()` 函数设置 treasury 地址，使平台地址不参与分红。

## 方式一：通过 Polygonscan 手动调用（推荐）

### 步骤：

1. **访问代理合约页面**
   ```
   https://polygonscan.com/address/0x9C9F27B20a0eb4f98Aa8680000514d87Ed0D2889#writeProxyContract
   ```

2. **连接钱包**
   - 点击 "Connect to Web3" 按钮
   - 使用 treasury 地址连接：`0x69E39fa02baf2F6F3b1B9bcF3D9a1906c6E14595`
   - 确保钱包网络切换到 Polygon Mainnet

3. **找到 setTreasury 函数**
   - 在 "Write as Proxy" 选项卡中
   - 向下滚动找到 `setTreasury` 函数

4. **输入参数**
   ```
   _treasury (address): 0x69E39fa02baf2F6F3b1B9bcF3D9a1906c6E14595
   ```

5. **执行交易**
   - 点击 "Write" 按钮
   - 在钱包中确认交易
   - 等待交易确认

6. **验证设置成功**
   - 切换到 "Read as Proxy" 选项卡
   - 调用 `treasury()` 函数
   - 应该返回：`0x69E39fa02baf2F6F3b1B9bcF3D9a1906c6E14595`

## 方式二：使用脚本调用

如果你想通过脚本自动化调用，可以使用 `set-treasury.js` 脚本（需要私钥）。

---

## 合约信息

- **代理合约地址**: `0x9C9F27B20a0eb4f98Aa8680000514d87Ed0D2889`
- **Treasury 地址**: `0x69E39fa02baf2F6F3b1B9bcF3D9a1906c6E14595`
- **新实现地址**: `0xf216f13654D1F019EfaA60Ab3a102863B1A51801`
- **升级交易**: `0x66be315d15a018c8d03bed53e10faaf857e0f4708894f8b1a3d8691bba411e27`

## 注意事项

⚠️ **重要**：
- 只有合约 owner 才能调用 `setTreasury()` 函数
- 确保使用正确的地址连接钱包
- 交易需要支付少量 MATIC 作为 gas 费用
