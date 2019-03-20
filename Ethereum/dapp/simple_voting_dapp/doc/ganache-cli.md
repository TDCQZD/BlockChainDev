# ganache-cli 

为了便于测试，ganache 默认会创建 10 个账户，每个账户有 100 个以太。。你需要用其中一个账户创建交易，发送、接收以太。
当然，你也可以安装 GUI 版本的 ganache 而不是命令行版本，在这里下载 GUI 版本：http://truffleframework.com/ganache/

## 配置ganache-cli
```
npm install ganache-cli 
```
## 启动 ganache-cli

**启动ganache-cli**

```
node_modules/.bin/ganache-cli
```
**测试结果如下：**

```  
Ganache CLI v6.1.8 (ganache-core: 2.2.1)

Available Accounts
==================
(0) 0xba416bb0d4f4670a09ce4fc9ec874b6dde091b50 (~100 ETH)
(1) 0xbb0185950c68a6638e6e14bfc3ca7858d745f1c1 (~100 ETH)
(2) 0x87932775783e733fd66c85557577539a3ec6760f (~100 ETH)
(3) 0x23e63aff06b14491e38091f2aa4ec59149b54515 (~100 ETH)
(4) 0xd592f9ae6656a61a5e6b207758d48fc9d3a37d10 (~100 ETH)
(5) 0x57ba322d1d527480846c86bbccced8104dc1610c (~100 ETH)
(6) 0x08d8a3203d5afad414c8c80c08a00e1ffd6efd39 (~100 ETH)
(7) 0x66686435c63c3929f7ab82c8119758efc5196956 (~100 ETH)
(8) 0x7ab9d0cd593114b56609fa733ea680a7a3c68ea8 (~100 ETH)
(9) 0xd4e5a47327fec599a6bdb3b56f8e0ce35f976214 (~100 ETH)

Private Keys
==================
(0) 0xc206da5678121d5097b5f0e9b9beb83b26a0126b2a68a7bd85f70f15a246fee0
(1) 0x6357c91e393c1684779534273bffd91032f2cfeb1ca409d2fdbe8b7a25478297
(2) 0x4955aeca4b70f42d6299167dc3cfd7d274244a78c6e128557de734b8bf156df3
(3) 0x41b4a23f6c922da745343794047a688f3204bc4121a3630d09c7bedafce353f5
(4) 0x26e18a27e0888d5221b5713fb4ab0f6408d72cec1153a958c5987fa0f1a942ce
(5) 0xd412349e807cbd8082ad0ad532619d314bd6cc5a053594f2e31dca643105b3ee
(6) 0x8b73c0ed7bc14e47ce9b65074c36497a19aa3d76fb94b332bc97ff9ad41c8054
(7) 0xcec359aee39f9a29deadf70e5feb3e774675167daceaa6d21896b97c74193c60
(8) 0x17282f0d557f06d3884d937ab4a582c56c49dc79f82c9d6d571a7b00162ae22f
(9) 0x21322d4941079e010c0316f54eb6fc3a891fda22106a592926c88f3ded266299

HD Wallet
==================
Mnemonic:      wink thought donate nothing shadow light web fade before team feature relief
Base HD Path:  m/44'/60'/0'/0/{account_index}

Gas Price
==================
20000000000

Gas Limit
==================
6721975

Listening on 127.0.0.1:8545

```
**指定IP启动**
```
node_modules/.bin/ganache-cli --host "0.0.0.0"

```
```
Ganache CLI v6.1.8 (ganache-core: 2.2.1)

Available Accounts
==================
(0) 0x52e2da25293395ffa894c6dc5b15fcba3aaab7e3 (~100 ETH)
(1) 0xc49d1abadc0d9cec6ca50974e07d3ce1fd5e8f20 (~100 ETH)
(2) 0xb1d191436e62b8a534f92fa83fc4ced8cac6968e (~100 ETH)
(3) 0xde6fed4c18d7a53b6f062d817c37adf2c20ed157 (~100 ETH)
(4) 0xe7b4d79fc0d07f5eb6ad676f15adddae32e3fc2d (~100 ETH)
(5) 0x91259cf31ff6928653f7dc062c50d61dbbdeb1e5 (~100 ETH)
(6) 0x27c74b154475c80ff46cdd1999fd92e230c5f42d (~100 ETH)
(7) 0xdd4f2963d6f9b4fad321b8594d7916b3f9169471 (~100 ETH)
(8) 0xc41d4841fd32172884a87ebaa13c02991987d37a (~100 ETH)
(9) 0xf494817d65f8b33c14b8729a7c78dae9f4d9d8cc (~100 ETH)

Private Keys
==================
(0) 0x2c3eaf2759233cfb44dd0a56eea7b4e67631c6acf9b8269ad71a5a39f7afa6f1
(1) 0x20f48d47e29889ce3c00b01fee725dc74d69a6ebbc41b19af4d82576537fefe7
(2) 0x0f5912c0feaed1ad72aa0726200e29874b06202b152ff336aa12f71bd7fad8a6
(3) 0x3ec4580f46b372a386307136c995e924866f23ecd273f8c2bd5afd72a53c8d14
(4) 0xae25f7aa224297225fa4d0f299f7bc9784cf52678ca63339ce3fcd01e4e45f56
(5) 0x1eac4993e4a496e2618c9d58512addb5050d9c87664b12bbd7c78d093fc44145
(6) 0x85ebe75f554c3ec3e7e1f29b26deacbb5247774ce291697fae799d89f16a0dd3
(7) 0xb97d7b94b24591434fb790b6281155f57bf1b9fa08ad0123a245f84facdd42ff
(8) 0x26262b3440ea7174f5c65d7a264fec38e4c575eca3db0acec398ceeabec1ca72
(9) 0x5e0ce00a3ef48339cc488a33e06049ba56b3afa383fc2759c914dae3f68d8213

HD Wallet
==================
Mnemonic:      rain end sick social swap garden capital staff art math element robot
Base HD Path:  m/44'/60'/0'/0/{account_index}

Gas Price
==================
20000000000

Gas Limit
==================
6721975

Listening on 0.0.0.0:8545

```

## 发送交易
```
web3.eth.sendTransaction({from: web3.eth.accounts[8], to: "0x93289B62f14Af3c87a4325c6816941333d1c61be", value: 50000000000000000000})

web3.eth.sendTransaction({from: web3.eth.accounts[9], to: "0xdEB144dBF30308cE72Fd4544Fdc8Fc3F86D3d703", value: 50000000000000000000})
```