
# infura上部署以太坊合约
>infura指令：https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050

> MetaMask 账户助记词：blue destroy kind chuckle exist hundred sphere mushroom panel long neither give

## 安装HDWalletProvider 
```
npm install truffle-hdwallet-provider
```
## 配置Truffle项目
编辑你的truffle.js文件来启用HDWalletProvider并为部署到Ropsten进行必要的配置。

1. 首先，在配置文件中定义HDWalletProvider对象。 在truffle.js文件的顶部添加以下代码：
```
var HDWalletProvider = require("truffle-hdwallet-provider");
```
2. 接下来，提供助记词（mnemonic）来生成你的账户
```
var mnemonic = "blue destroy kind chuckle exist hundred sphere mushroom panel long neither give";
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
root@Aws:~/ethereum/dapp/truffle_voting_dapp# truffle migrate --network ropsten
Using network 'ropsten'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x778ed9abb525d6d171b06eabf52ab7f000ddc8940f74664ec424e5c6c2f62a80
  Migrations: 0x2b0199f5df5b7eca553c24523b22d00b04dcc045
Saving successful migration to network...
  ... 0xc35dbb82e1ea8d968650bb5ba5cacd7c8650d0d81114ad9e0c24f3a39030d694
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying Voting...
  ... 0x6e176645d0582592d6d099e6bfdf7fc21591908b8846255b063ab3c6f3197728
  Voting: 0x9d919cfc01a70488fe32971433b598166d4c212c
Saving successful migration to network...
  ... 0xb75d8dbd5f272ae2d9b6440b4bebd92f2c179e1571caab23110ce5272d8ef98b
Saving artifacts...
root@Aws:~/ethereum/dapp/truffle_voting_dapp#
```

``` 合约ID
0x6e176645d0582592d6d099e6bfdf7fc21591908b8846255b063ab3c6f3197728
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
npm run dev
http://39.108.111.144:8080/
```