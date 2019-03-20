
# infura上部署以太坊合约
>infura指令：https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050

> MetaMask 账户助记词：coil black measure pottery light error swap such material cushion pink exhaust
## 安装HDWalletProvider 
```
npm install truffle-hdwallet-provider
```
> 直接部署时，truffle-hdwallet-provide 0.0.6会出错，truffle部署时，0.0.6正常。
## 配置项目
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
const Web3 = require('web3'); 
const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = "coil black measure pottery light error swap such material cushion pink exhaust";
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050");
const web3 = new Web3(provider);

let result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: 8500000 ,chainId: 3});

```
默认情况下，由助记符产生的第一个账户将负责执行合约迁移任务。 但如果需要的话，你可以传入参数以指定要使用的帐户。 例如，要使用第三个帐户：
```
new HDWalletProvider(mnemonic, "https://ropsten.infura.io/<Infura_Access_Token>", 2);
```

## 部署合约
1. 编译项目：
```
npm run  compile
```
2. 部署到Ropsten网络：
```
npm run deploy
```
> 部署时 ropsten测试账号需要有币。
3. 如果想验证合约是否已成功部署，可以在Etherscan的Ropsten部分进行检查。 在搜索字段中，输入部署交易ID
> https://ropsten.etherscan.io/
```


``` 合约ID

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


## 网页交互
```
npm run start
http://39.108.111.144:3001/
```