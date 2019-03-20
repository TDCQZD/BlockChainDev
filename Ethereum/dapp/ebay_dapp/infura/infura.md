
# infura上部署以太坊合约
>infura指令：https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050

> MetaMask 账户助记词：coil black measure pottery light error swap such material cushion pink exhaust

## 安装HDWalletProvider 
```
npm install truffle-hdwallet-provider
```
> 直接部署时，truffle-hdwallet-provide 0.0.6会出错，truffle部署时，0.0.6正常。
## 配置Truffle项目
编辑你的truffle.js文件来启用HDWalletProvider并为部署到Ropsten进行必要的配置。

1. 首先，在配置文件中定义HDWalletProvider对象。 在truffle.js文件的顶部添加以下代码：
```
var HDWalletProvider = require("truffle-hdwallet-provider");
```
2. 接下来，提供助记词（mnemonic）来生成你的账户
```
var mnemonic = "coil black measure pottery light error swap such material cushion pink exhaust";
```
3. 添加Ropsten网络定义：
```
module.exports = { 
  networks: { 
    ropsten: { 
      provider: function() { 
        return new HDWalletProvider(mnemonic,"https://ropsten.infura.io/<INFURA_Access_Token>") 
        }, 
      network_id: 3 
    }
  } 
};

```
默认情况下，由助记符产生的第一个账户将负责执行合约迁移任务。 但如果需要的话，你可以传入参数以指定要使用的帐户。 例如，要使用第三个帐户：
```
new HDWalletProvider(mnemonic, "https://ropsten.infura.io/<Infura_Access_Token>", 2);
```

## 部署合约
1. 编译项目：
```
truffle compile
```
2. 部署到Ropsten网络：
```
truffle migrate --network ropsten
```
> 部署时 ropsten测试账号需要有币。
3. 如果想验证合约是否已成功部署，可以在Etherscan的Ropsten部分进行检查。 在搜索字段中，输入部署交易ID
> https://ropsten.etherscan.io/
```
root@Aws:~/ethereum/dapp/ebay_dapp# truffle migrate --network ropsten
Using network 'ropsten'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x5933d155e4c49e3d92d38b1fff6e033c21b71562850bd776bcea1de8c2e194c3
  Migrations: 0x57f28814549ee1685d4b56d574de0bd3739096f8
Saving successful migration to network...
  ... 0x4e2690df635c75a4a6c8c7a5ab429d50755e85506278c4c3721e7c60c72a8479
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying EcommerceStore...
  ... 0x3f87c627e098ff200ad1fb826a2f469b092cf91d12a3c2c88621a7bd75e85f54
  EcommerceStore: 0xa548ffc9ff0fce7590d2a10d606f5caa6f763a3c
Saving successful migration to network...
  ... 0x11c97a6d82eaaab1a8d618cf78dbe64e3fbcf6d6112581be7f774657ec5a846f
Saving artifacts...
root@Aws:~/ethereum/dapp/ebay_dapp#
```

```  
Migrations: 0x57f28814549ee1685d4b56d574de0bd3739096f8
EcommerceStore: 0xa548ffc9ff0fce7590d2a10d606f5caa6f763a3c
```
4. ropsten.etherscan.io 查看信息
``` 
https://ropsten.etherscan.io/tx/0x6e176645d0582592d6d099e6bfdf7fc21591908b8846255b063ab3c6f3197728
```
``` code
https://ropsten.etherscan.io/address/0x9d919cfc01a70488fe32971433b598166d4c212c#code
```
> 说明：测试网只有 bytecode，不能看完整代码
## 网页交互
```
ipfs daemon
npm run dev
http://39.108.111.144:8090/
```