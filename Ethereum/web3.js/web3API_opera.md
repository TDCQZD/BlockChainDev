#  web3实操 

## 开发环境配置

### 配置环境
1. 新建web3目录
    ```
    mkdir web3
    cd web3
    npm init
    npm install ganache-cli --save-dev
    ```
2. cd web3 目录下
    ```
    mkdir  web3_1.0.0
    mkdir  web3_0.2.x
    ```
3. cd web3_1.0.0 目录下
    ```
    npm init
    npm install web3 --save-dev
    ```
4. cd web3_0.2.x 目录下
    ```
    npm init
    npm install web3@0.20.1 --save-dev
    ```
目录结构如下图所示：

![](../images/web3_1.png)
### 开启测试环境
1. web3目录开启第一个窗口
```
node_modules/.bin/ganache-cli
```
2. web3_0.2.x 目录下开启第二个窗口
```
> var Web3 = require('web3')
undefined
> var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
undefined
> web3.eth.accounts
[ '0xc115d000c3875c45159e848e39140a22f01f83db',
  '0xe5260eceb1cee35cd16b615ed905aba457e3216c',
  '0x6933b84d11808967963a8943ee6bc01c0be4898f',
  '0xa11361f14736d28fac1ae9748a44f2f8720bc249',
  '0x6e7e30947b52404c1f77584bb03e7790d56cb323',
  '0xec9eb12f8ccaed4eefc9274e6d7fa4341dd83934',
  '0x52fc52b47879bf4d7885a3885cf29ab86e5a21e4',
  '0x8aeeabe7dd71f5d5588f2308a0f8c8b590731aa6',
  '0x78cd9eb45fc09a6f6e2967d2d92a56b1a1bd724e',
  '0xbe26d543d4e2a9f5bd10a8228b1346ec2d950377' ]
> 
> web3.net.listening
true
```
3. web3_1.0.0 目录下 开启第三个窗口
```
> var Web3 = require('web3')
undefined
> var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
undefined
> web3.eth.getAccounts().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> [ '0xc115D000C3875C45159e848E39140a22f01F83dB',
  '0xE5260eCeb1CEE35Cd16b615ED905aBA457E3216C',
  '0x6933B84D11808967963A8943Ee6bC01c0Be4898F',
  '0xa11361f14736D28fac1Ae9748a44f2F8720bc249',
  '0x6E7e30947b52404c1F77584bb03E7790d56cb323',
  '0xec9eB12f8CcAEd4EEFc9274E6d7fA4341DD83934',
  '0x52fC52b47879bF4d7885a3885cf29AB86E5a21e4',
  '0x8aEeabE7dd71F5d5588f2308a0f8C8b590731aa6',
  '0x78Cd9Eb45fc09A6F6e2967D2D92A56B1A1bD724e',
  '0xbe26d543d4E2A9F5bD10A8228B1346EC2d950377' ]
> 

```


总结：到此为止，web3的开发环境已配置完毕。接下来就可以开始使用web3。当然，你也可以开启geth私链进行测试。
## web3 模块加载
**web3 加载**
```
> var Web3 = require('web3')
undefined
> var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
undefined

```
**查看当前环境(Provider)**

``` 0.2.0
> web3.currentProvider
HttpProvider {
  host: 'http://localhost:8545',
  timeout: 0,
  user: undefined,
  password: undefined }
> 

```

``` 1.0.0
 > web3.currentProvider
HttpProvider {
  host: 'http://localhost:8545',
  httpAgent: 
   Agent {
     domain: 
      Domain {
        domain: null,
        _events: [Object],
        _eventsCount: 1,
        _maxListeners: undefined,
        members: [] },
     _events: { free: [Function] },
     _eventsCount: 1,
     _maxListeners: undefined,
     defaultPort: 80,
     protocol: 'http:',
     options: { keepAlive: true, path: null },
     requests: {},
     sockets: {},
     freeSockets: {},
     keepAliveMsecs: 1000,
     keepAlive: true,
     maxSockets: Infinity,
     maxFreeSockets: 256 },
  timeout: 0,
  headers: undefined,
  connected: true }
> 

```

## 异步回调（callback）
```
eth.getBlock(2)

web3.eth.getBlock(2, function(error, result){ if(!error) console.log(JSON.stringify(result)); else console.error(error); });
```
``` 同步回调
> eth.getBlock(2)
{
  difficulty: 131072,
  extraData: "0xd683010811846765746886676f312e3130856c696e7578",
  gasLimit: 2104100,
  gasUsed: 0,
  hash: "0x8cdbe299881120e895c313df8ed34c804b596061ed60b2a15ccefc7d78e1b206",
  logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
  miner: "0x9bbbb891258b071c265b6fd8608ca0c77c959a69",
  mixHash: "0x0581a0188e92b54feb48053924f1ab1a1bb668b0e62e02fc2858ad65ef919394",
  nonce: "0x2681ea8082cc4044",
  number: 2,
  parentHash: "0x9f24f0b1639711a35c6b7df7f038755f05224cf2ac2fbe159d4f8a23e93e3408",
  receiptsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  sha3Uncles: "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
  size: 534,
  stateRoot: "0xdc333f60dfca13e78f2f7b7bd018f7a06fb9ca107f1353af522fba1f8e4b958e",
  timestamp: 1540812201,
  totalDifficulty: 264144,
  transactions: [],
  transactionsRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
  uncles: []
}
> 

```
``` 异步回调
web3.eth.getBlock(2, function(error, result){ if(!error) console.log(JSON.stringify(result)); else console.error(error); });
{"difficulty":"131072","extraData":"0xd683010811846765746886676f312e3130856c696e7578","gasLimit":2104100,"gasUsed":0,"hash":"0x8cdbe299881120e895c313df8ed34c804b596061ed60b2a15ccefc7d78e1b206","logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","miner":"0x9bbbb891258b071c265b6fd8608ca0c77c959a69","mixHash":"0x0581a0188e92b54feb48053924f1ab1a1bb668b0e62e02fc2858ad65ef919394","nonce":"0x2681ea8082cc4044","number":2,"parentHash":"0x9f24f0b1639711a35c6b7df7f038755f05224cf2ac2fbe159d4f8a23e93e3408","receiptsRoot":"0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421","sha3Uncles":"0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347","size":534,"stateRoot":"0xdc333f60dfca13e78f2f7b7bd018f7a06fb9ca107f1353af522fba1f8e4b958e","timestamp":1540812201,"totalDifficulty":"264144","transactions":[],"transactionsRoot":"0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421","uncles":[]}
undefined
> 

```

## 应用二进制接口（ABI）

**编译合约**

``` 
solcjs --abi Coin.sol
solcjs --bin Coin.sol
```
生成Coin_sol_Coin.abi 【abi：web3调用】和Coin_sol_Coin.bin 【字节码：在以太坊部署合约时使用】





## 基本信息查询

### 查看 web3 版本
``` 1.0.0
> web3.version
'1.0.0-beta.36'
> 
```
``` 0.2.x
> web3.version.api
'0.20.1'
> 

```
###  查看 web3 连接到的节点版本
``` 同步 web3 0.2.X
> web3.version.node
'EthereumJS TestRPC/v2.2.1/ethereum-js'
``` 

``` 异步 web3 0.2.X
> web3.version.getNode((error,result)=>{console.log(result)})
undefined
> EthereumJS TestRPC/v2.2.1/ethereum-js

```
``` web3 1.0.0
> web3.eth.getNodeInfo().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> EthereumJS TestRPC/v2.2.1/ethereum-js

```
### 获取 network id
``` 同步 web3 0.2.X
> web3.version.network
'1541044462622'

```

``` 异步 web3 0.2.X
> web3.version.getNetwork((err, res)=>{console.log(res)})
undefined
> 1541044462622

```

``` web3 1.0.0
> web3.eth.net.getId().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 1541044462622

```
### 获取节点的以太坊协议版本
``` 同步 web3 0.2.X
> web3.version.ethereum
'63'
```

``` 异步 web3 0.2.X

> web3.version.getEthereum((err, res)=>{console.log(res)})
undefined
> 63

```

``` web3 1.0.0
> web3.eth.getProtocolVersion().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 63

```


## 网络状态查询
### 是否有节点连接/监听
``` 同步 web3 0.2.X
> web3.isConnect() 
TypeError: web3.isConnect is not a function
> web3.net.listening
true

```

``` 异步 web3 0.2.X
> web3.net.getListening((err,res)=>console.log(res))
undefined
> true

```

``` web3 1.0.0
> web3.eth.net.isListening().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> true

```
###  查看当前连接的 peer 节点
``` 同步 web3 0.2.X
> web3.net.peerCount
0
```

``` 异步 web3 0.2.X

> web3.net.getPeerCount((err,res)=>console.log(res))
undefined
> 0

```

``` web3 1.0.0
> web3.eth.net.getPeerCount().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 0

```



## Provider
### 查看当前设置的 `web3 provider`
```  web3 0.2.X
> web3.currentProvider
HttpProvider {
  host: 'http://localhost:8545',
  timeout: 0,
  user: undefined,
  password: undefined }
> 

```


``` web3 1.0.0
> web3.currentProvider
HttpProvider {
  host: 'http://localhost:8545',
  httpAgent: 
   Agent {
     domain: 
      Domain {
        domain: null,
        _events: [Object],
        _eventsCount: 1,
        _maxListeners: undefined,
        members: [] },
     _events: { free: [Function] },
     _eventsCount: 1,
     _maxListeners: undefined,
     defaultPort: 80,
     protocol: 'http:',
     options: { keepAlive: true, path: null },
     requests: {},
     sockets: {},
     freeSockets: {},
     keepAliveMsecs: 1000,
     keepAlive: true,
     maxSockets: Infinity,
     maxFreeSockets: 256 },
  timeout: 0,
  headers: undefined,
  connected: true }
> 

```


### ipc rpc 调用
``` 
geth attach http://localhost:8545
geth attach getp.ipc
```


## web3 通用工具方法
### 以太单位转换
```
> web3.fromWei(12317864289444576897687906777779868)
'12317864289444577'
> web3.fromWei(12317864289444576897687906777779868,'ether')
'12317864289444577'
> 

> web3.toWei(1,'ether')
'1000000000000000000'
> 

```



## web3.eth – 账户相关
### coinbase 查询

``` 同步 web3 0.2.X
> web3.eth.coinbase
'0xc115d000c3875c45159e848e39140a22f01f83db'

```

``` 异步 web3 0.2.X
> web3.eth.getCoinbase( (err, res)=>console.log(res) )
undefined
> 0xc115d000c3875c45159e848e39140a22f01f83db

```

``` web3 1.0.0
> web3.eth.getCoinbase().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 0xc115d000c3875c45159e848e39140a22f01f83db

```

###  账户查询
``` 同步 web3 0.2.X
> web3.eth.accounts
[ '0xc115d000c3875c45159e848e39140a22f01f83db',
  '0xe5260eceb1cee35cd16b615ed905aba457e3216c',
  '0x6933b84d11808967963a8943ee6bc01c0be4898f',
  '0xa11361f14736d28fac1ae9748a44f2f8720bc249',
  '0x6e7e30947b52404c1f77584bb03e7790d56cb323',
  '0xec9eb12f8ccaed4eefc9274e6d7fa4341dd83934',
  '0x52fc52b47879bf4d7885a3885cf29ab86e5a21e4',
  '0x8aeeabe7dd71f5d5588f2308a0f8c8b590731aa6',
  '0x78cd9eb45fc09a6f6e2967d2d92a56b1a1bd724e',
  '0xbe26d543d4e2a9f5bd10a8228b1346ec2d950377' ]


```

``` 异步 web3 0.2.X
> web3.eth.getAccounts( (err, res)=>console.log(res) )
undefined
> [ '0xc115d000c3875c45159e848e39140a22f01f83db',
  '0xe5260eceb1cee35cd16b615ed905aba457e3216c',
  '0x6933b84d11808967963a8943ee6bc01c0be4898f',
  '0xa11361f14736d28fac1ae9748a44f2f8720bc249',
  '0x6e7e30947b52404c1f77584bb03e7790d56cb323',
  '0xec9eb12f8ccaed4eefc9274e6d7fa4341dd83934',
  '0x52fc52b47879bf4d7885a3885cf29ab86e5a21e4',
  '0x8aeeabe7dd71f5d5588f2308a0f8c8b590731aa6',
  '0x78cd9eb45fc09a6f6e2967d2d92a56b1a1bd724e',
  '0xbe26d543d4e2a9f5bd10a8228b1346ec2d950377' ]

> 
```

``` web3 1.0.0
> web3.eth.getAccounts().then(console.log)
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> [ '0xc115D000C3875C45159e848E39140a22f01F83dB',
  '0xE5260eCeb1CEE35Cd16b615ED905aBA457E3216C',
  '0x6933B84D11808967963A8943Ee6bC01c0Be4898F',
  '0xa11361f14736D28fac1Ae9748a44f2F8720bc249',
  '0x6E7e30947b52404c1F77584bb03E7790d56cb323',
  '0xec9eB12f8CcAEd4EEFc9274E6d7fA4341DD83934',
  '0x52fC52b47879bF4d7885a3885cf29AB86E5a21e4',
  '0x8aEeabE7dd71F5d5588f2308a0f8C8b590731aa6',
  '0x78Cd9Eb45fc09A6F6e2967D2D92A56B1A1bD724e',
  '0xbe26d543d4E2A9F5bD10A8228B1346EC2d950377' ]

> 
```



## 区块相关
###  区块高度查询
``` 同步 web3 0.2.X
> web3.eth.blockNumber
3
```

``` 异步 web3 0.2.X
> web3.eth.getBlockNumber((err,res)=>{console.log(res)})
undefined
> 3
```

``` web3 1.0.0
> web3.eth.getBlockNumber((err,res)=>{console.log(res)})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 3
```


###  gasPrice 查询
``` 同步 web3 0.2.X
> web3.eth.gasPrice
BigNumber { s: 1, e: 10, c: [ 20000000000 ] }
```

``` 异步 web3 0.2.X
> web3.eth.getGasPrice( (err,res)=>{console.log(res)} )
undefined
> BigNumber { s: 1, e: 10, c: [ 20000000000 ] }
```
``` web3 1.0.0
> web3.eth.getGasPrice( (err,res)=>{console.log(res)} )
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 20000000000

```

###  区块查询
``` 同步 web3 0.2.X
web3.eth.getBlock(3)

> web3.eth.getBlock(3)
{ number: 3,
  hash: '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4',
  parentHash: '0x15a4912c042932f99fce613f9fc0f86377880d3b4e881322c791256e5a6e2d32',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  stateRoot: '0x758bc53d5c0b50add3724ac628730cbacd68ee904d22d906e1aaeae3409320e1',
  receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  miner: '0x0000000000000000000000000000000000000000',
  difficulty: BigNumber { s: 1, e: 0, c: [ 0 ] },
  totalDifficulty: BigNumber { s: 1, e: 0, c: [ 0 ] },
  extraData: '0x',
  size: 1000,
  gasLimit: 6721975,
  gasUsed: 21000,
  timestamp: 1541062796,
  transactions: 
   [ '0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618' ],
  uncles: [] }
> 

```

``` 异步 web3 0.2.X
web3.eth.getBlock(1,(err,res)=>{console.log(res)} )


> web3.eth.getBlock(1,(err,res)=>{console.log(res)} )
undefined
> { number: 1,
  hash: '0x0c751415b8033cda426485b14e2f325c456241d5afec07cc8d589e4942cbe1ad',
  parentHash: '0xb8be486fab4955e5e0339c679f8a97e5a8d6db559fc722514fd62594aee55021',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  stateRoot: '0x5d95b10d29ea831dff16b5f8aaf280f60a9e5ce6e9f76e72f6876f7352355344',
  receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  miner: '0x0000000000000000000000000000000000000000',
  difficulty: BigNumber { s: 1, e: 0, c: [ 0 ] },
  totalDifficulty: BigNumber { s: 1, e: 0, c: [ 0 ] },
  extraData: '0x',
  size: 1000,
  gasLimit: 6721975,
  gasUsed: 90000,
  timestamp: 1541062122,
  transactions: 
   [ '0x38db14c279f85ac3bca8f3cb54b92d9167951ec7f876034dfe840da635bcf48e' ],
  uncles: [] }

> 

```

``` web3 1.0.0
> web3.eth.getBlock(3,(err,res)=>{console.log(res)} )
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> { number: 3,
  hash: '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4',
  parentHash: '0x15a4912c042932f99fce613f9fc0f86377880d3b4e881322c791256e5a6e2d32',
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  nonce: '0x0000000000000000',
  sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  stateRoot: '0x758bc53d5c0b50add3724ac628730cbacd68ee904d22d906e1aaeae3409320e1',
  receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
  miner: '0x0000000000000000000000000000000000000000',
  difficulty: '0',
  totalDifficulty: '0',
  extraData: '0x',
  size: 1000,
  gasLimit: 6721975,
  gasUsed: 21000,
  timestamp: 1541062796,
  transactions: 
   [ '0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618' ],
  uncles: [] }



```
### 块中交易数量查询
``` 同步 web3 0.2.X

> web3.eth.getBlockTransactionCount( 3 )
1
> web3.eth.getBlockTransactionCount( '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4' )
1
> 



```

``` 异步 web3 0.2.X

> web3.eth.getBlockTransactionCount( 3, (err,res)=>{console.log(res)} )
undefined
> 1

> web3.eth.getBlockTransactionCount( '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4' , (err,res)=>{console.log(res)} )
undefined
> 1

```

``` web3 1.0.0
> web3.eth.getBlockTransactionCount( 3, (err,res)=>{console.log(res)} )
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 1

> web3.eth.getBlockTransactionCount( '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4' , (err,res)=>{console.log(res)} )
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 1

```

## 交易相关
### 余额查询
``` 同步 web3 0.2.X
> web3.eth.getBalance(web3.eth.accounts[0]).toString()
'100000000000000000000'
> web3.eth.getBalance('0xc115d000c3875c45159e848e39140a22f01f83db').toString()
'100000000000000000000'
> 
> web3.eth.getBalance(web3.eth.accounts[0],'latest').toString()
'100000000000000000000'
> 

```

``` 异步 web3 0.2.X
web3.eth.getBalance(web3.eth.accounts[0] , (err,res)=>{console.log(res.toString())})
> web3.eth.getBalance(web3.eth.accounts[0] , (err,res)=>{console.log(res.toString())})
undefined
> 100000000000000000000

```

``` web3 1.0.0
web3.eth.getBalance(web3.eth.accounts[0], (err,res)=>{console.log(res.toString())})
```
###  交易查询
``` 同步 web3 0.2.X
web3.eth.getTransaction(transactionHash)
```

``` 异步 web3 0.2.X
web3.eth.getTransaction(transactionHash , (err,res)=>{console.log(res)})
```

``` web3 1.0.0
web3.eth.getTransaction(transactionHash , (err,res)=>{console.log(res)})

```

## 交易执行相关
### 交易收据查询（已进块）
``` 同步 web3 0.2.X
> web3.eth.getTransactionReceipt('0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618')
{ transactionHash: '0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618',
  transactionIndex: 0,
  blockHash: '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4',
  blockNumber: 3,
  gasUsed: 21000,
  cumulativeGasUsed: 21000,
  contractAddress: null,
  logs: [],
  status: '0x1',
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' }
>
```

``` 异步 web3 0.2.X
> web3.eth.getTransactionReceipt('0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618', (err,res)=>{console.log(res)})
undefined
> { transactionHash: '0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618',
  transactionIndex: 0,
  blockHash: '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4',
  blockNumber: 3,
  gasUsed: 21000,
  cumulativeGasUsed: 21000,
  contractAddress: null,
  logs: [],
  status: '0x1',
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' }


```

``` web3 1.0.0
> web3.eth.getTransactionReceipt('0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618', (err,res)=>{console.log(res)})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> { transactionHash: '0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618',
  transactionIndex: 0,
  blockHash: '0x558a7471e5d9126714da8d38fc9a2c12653f098317494d33456fc5101b6628c4',
  blockNumber: 3,
  gasUsed: 21000,
  cumulativeGasUsed: 21000,
  contractAddress: null,
  logs: [],
  status: true,
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' }

> 

```
### 估计 gas 消耗量
``` 同步 web3 0.2.X
> web3.eth.estimateGas({from:web3.eth.accounts[0],to:web3.eth.accounts[1],value:100000})
21000



```

``` 异步 web3 0.2.X
> web3.eth.estimateGas({from:web3.eth.accounts[0],to:web3.eth.accounts[1],value:100000},(err,res)=>{console.log(res)})
undefined
> 21000

```

``` web3 1.0.0

> web3.eth.estimateGas({from:web3.eth.accounts[0],to:web3.eth.accounts[1],value:100000},(err,res)=>{console.log(res)})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
> 53000

```




## 发送交易

```
> web3.eth.sendTransaction({from:web3.eth.accounts[0],to:web3.eth.accounts[1],value:100000})
'0xd796574775231c68e5cc7268cc2d7955b291050c80eef1d7cdd64e1e95ef2db4'
> web3.eth.sendTransaction({from:web3.eth.accounts[2],to:web3.eth.accounts[1],value:100000})
'0x5efdff2863240bf37ba372304977f605a6bc86d03d3f10a70fd02253195aa618'
> 

```
1.0.0的交易如何发送？

## 消息调用
sendTransaction：普通交易

call:合约交易
## 日志过滤（事件监听）
```
var filter = web3.eth.filter("latest"); 
filter
filter.watch(function(error, result){ if (!error) console.log(result); });
web3.reset()
```
```
> var filter = web3.eth.filter("latest"); 
undefined
> filter
Filter {
  requestManager: 
   RequestManager {
     provider: 
      HttpProvider {
        host: 'http://localhost:8545',
        timeout: 0,
        user: undefined,
        password: undefined },
     polls: {},
     timeout: null },
  options: 'latest',
  implementation: 
   { newFilter: { [Function: send] request: [Function: bound ], call: [Function: newFilterCall] },
     uninstallFilter: { [Function: send] request: [Function: bound ], call: 'eth_uninstallFilter' },
     getLogs: { [Function: send] request: [Function: bound ], call: 'eth_getFilterLogs' },
     poll: { [Function: send] request: [Function: bound ], call: 'eth_getFilterChanges' } },
  filterId: '0x01',
  callbacks: [],
  getLogsCallbacks: [],
  pollFilters: [],
  formatter: [Function: outputLogFormatter] }
> filter.watch(function(error, result){ if (!error) console.log(result); });
Filter {
  requestManager: 
   RequestManager {
     provider: 
      HttpProvider {
        host: 'http://localhost:8545',
        timeout: 0,
        user: undefined,
        password: undefined },
     polls: { '0x01': [Object] },
     timeout: 
      Timeout {
        _called: false,
        _idleTimeout: 500,
        _idlePrev: [Object],
        _idleNext: [Object],
        _idleStart: 11571217,
        _onTimeout: [Function: bound ],
        _timerArgs: undefined,
        _repeat: null,
        _destroyed: false,
        domain: [Object],
        [Symbol(asyncId)]: 4042,
        [Symbol(triggerAsyncId)]: 5 } },
  options: 'latest',
  implementation: 
   { newFilter: { [Function: send] request: [Function: bound ], call: [Function: newFilterCall] },
     uninstallFilter: { [Function: send] request: [Function: bound ], call: 'eth_uninstallFilter' },
     getLogs: { [Function: send] request: [Function: bound ], call: 'eth_getFilterLogs' },
     poll: { [Function: send] request: [Function: bound ], call: 'eth_getFilterChanges' } },
  filterId: '0x01',
  callbacks: [ [Function] ],
  getLogsCallbacks: [],
  pollFilters: [],
  formatter: [Function: outputLogFormatter] }
> 0xb8be486fab4955e5e0339c679f8a97e5a8d6db559fc722514fd62594aee55021

```
## 合约相关

### 创建合约

```
> var abi = ''
> var CoinContract = web3.eth.contract(abi)
> var byteCode = '0x' + byteCode
> var deployTxObject = {from: web3.eth.accounts[0],data: byteCode, gas:1000000}
> var coinContractInstance = CoinContract.new(deployTxObject)
> coinContractInstance
> coinContractInstance.address
```
```
> var abi = [{"constant":true,"inputs":[],"name":"minter","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"send","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Sent","type":"event"}]
undefined
> 



> var CoinContract = web3.eth.contract(abi)
undefined



> var byteCode = '0x' + '608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061044f806100606000396000f300608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063075461721461006757806327e235e3146100be57806340c10f1914610115578063d0679d3414610162575b600080fd5b34801561007357600080fd5b5061007c6101af565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156100ca57600080fd5b506100ff600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506101d4565b6040518082815260200191505060405180910390f35b34801561012157600080fd5b50610160600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506101ec565b005b34801561016e57600080fd5b506101ad600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610298565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016020528060005260406000206000915090505481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561024757600080fd5b80600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505050565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205481111515156102e657600080fd5b80600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055507f3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345338383604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828152602001935050505060405180910390a150505600a165627a7a72305820330c4de53eb32f074d375eff93ca872350693a955a2614bba9066bb13c1aeb5d0029'

> 

> var deployTxObject = {from: web3.eth.accounts[0],data: byteCode, gas:1000000}
undefined
> 



> var coinContractInstance = CoinContract.new(deployTxObject)
undefined
> 



> coinContractInstance
Contract {
  _eth: 
   Eth {
     _requestManager: RequestManager { provider: [Object], polls: {}, timeout: null },
     getBalance: { [Function: send] request: [Function: bound ], call: 'eth_getBalance' },
     getStorageAt: { [Function: send] request: [Function: bound ], call: 'eth_getStorageAt' },
     getCode: { [Function: send] request: [Function: bound ], call: 'eth_getCode' },
     getBlock: { [Function: send] request: [Function: bound ], call: [Function: blockCall] },
     getUncle: { [Function: send] request: [Function: bound ], call: [Function: uncleCall] },
     getCompilers: { [Function: send] request: [Function: bound ], call: 'eth_getCompilers' },
     getBlockTransactionCount: 
      { [Function: send]
        request: [Function: bound ],
        call: [Function: getBlockTransactionCountCall] },
     getBlockUncleCount: 
      { [Function: send]
        request: [Function: bound ],
        call: [Function: uncleCountCall] },
     getTransaction: 
      { [Function: send]
        request: [Function: bound ],
        call: 'eth_getTransactionByHash' },
     getTransactionFromBlock: 
      { [Function: send]
        request: [Function: bound ],
        call: [Function: transactionFromBlockCall] },
     getTransactionReceipt: 
      { [Function: send]
        request: [Function: bound ],
        call: 'eth_getTransactionReceipt' },
     getTransactionCount: { [Function: send] request: [Function: bound ], call: 'eth_getTransactionCount' },
     call: { [Function: send] request: [Function: bound ], call: 'eth_call' },
     estimateGas: { [Function: send] request: [Function: bound ], call: 'eth_estimateGas' },
     sendRawTransaction: { [Function: send] request: [Function: bound ], call: 'eth_sendRawTransaction' },
     signTransaction: { [Function: send] request: [Function: bound ], call: 'eth_signTransaction' },
     sendTransaction: { [Function: send] request: [Function: bound ], call: 'eth_sendTransaction' },
     sign: { [Function: send] request: [Function: bound ], call: 'eth_sign' },
     compile: { solidity: [Object], lll: [Object], serpent: [Object] },
     submitWork: { [Function: send] request: [Function: bound ], call: 'eth_submitWork' },
     getWork: { [Function: send] request: [Function: bound ], call: 'eth_getWork' },
     coinbase: [Getter],
     getCoinbase: { [Function: get] request: [Function: bound ] },
     mining: [Getter],
     getMining: { [Function: get] request: [Function: bound ] },
     hashrate: [Getter],
     getHashrate: { [Function: get] request: [Function: bound ] },
     syncing: [Getter],
     getSyncing: { [Function: get] request: [Function: bound ] },
     gasPrice: [Getter],
     getGasPrice: { [Function: get] request: [Function: bound ] },
     accounts: [Getter],
     getAccounts: { [Function: get] request: [Function: bound ] },
     blockNumber: [Getter],
     getBlockNumber: { [Function: get] request: [Function: bound ] },
     protocolVersion: [Getter],
     getProtocolVersion: { [Function: get] request: [Function: bound ] },
     iban: 
      { [Function: Iban]
        fromAddress: [Function],
        fromBban: [Function],
        createIndirect: [Function],
        isValid: [Function] },
     sendIBANTransaction: [Function: bound transfer] },
  transactionHash: '0x39746ab77efc582c40876d456eb0e5700dac7d1a1e1b248aea0f9b23778aa95f',
  address: '0x4c6bf21e964789914e56f146b8c366f718e65346',
  abi: 
   [ { constant: true,
       inputs: [],
       name: 'minter',
       outputs: [Array],
       payable: false,
       stateMutability: 'view',
       type: 'function' },
     { constant: true,
       inputs: [Array],
       name: 'balances',
       outputs: [Array],
       payable: false,
       stateMutability: 'view',
       type: 'function' },
     { constant: false,
       inputs: [Array],
       name: 'mint',
       outputs: [],
       payable: false,
       stateMutability: 'nonpayable',
       type: 'function' },
     { constant: false,
       inputs: [Array],
       name: 'send',
       outputs: [],
       payable: false,
       stateMutability: 'nonpayable',
       type: 'function' },
     { inputs: [],
       payable: false,
       stateMutability: 'nonpayable',
       type: 'constructor' },
     { anonymous: false, inputs: [Array], name: 'Sent', type: 'event' } ],
  minter: 
   { [Function: bound ]
     request: [Function: bound ],
     call: [Function: bound ],
     sendTransaction: [Function: bound ],
     estimateGas: [Function: bound ],
     getData: [Function: bound ],
     '': [Circular] },
  balances: 
   { [Function: bound ]
     request: [Function: bound ],
     call: [Function: bound ],
     sendTransaction: [Function: bound ],
     estimateGas: [Function: bound ],
     getData: [Function: bound ],
     address: [Circular] },
  mint: 
   { [Function: bound ]
     request: [Function: bound ],
     call: [Function: bound ],
     sendTransaction: [Function: bound ],
     estimateGas: [Function: bound ],
     getData: [Function: bound ],
     'address,uint256': [Circular] },
  send: 
   { [Function: bound ]
     request: [Function: bound ],
     call: [Function: bound ],
     sendTransaction: [Function: bound ],
     estimateGas: [Function: bound ],
     getData: [Function: bound ],
     'address,uint256': [Circular] },
  allEvents: [Function: bound ],
  Sent: { [Function: bound ] 'address,address,uint256': [Function: bound ] } }
> 

> coinContractInstance.address
'0x4c6bf21e964789914e56f146b8c366f718e65346'
```
### 调用合约函数
```
> coinContractInstance.minter()
'0xc115d000c3875c45159e848e39140a22f01f83db'


> coinContractInstance.minter.call((error,result)=>{console.log(result)})
undefined
> 0xc115d000c3875c45159e848e39140a22f01f83db

> coinContractInstance.minter.call({from:web3.eth.accounts[0],to:web3.eth.accounts[1],value:100000},(error,result)=>{console.log(result)})
undefined
> null

> coinContractInstance.mint(web3.eth.accounts[0],3000000,{from:web3.eth.accounts[0]},(error,result)=>{console.log(result)})
undefined
> 0xfdeeb713fc4886bb5724087dc8913874fd938eb801a092926b9af4d99716da07

> coinContractInstance.balances(web3.eth.accounts[0],(error,result)=>{console.log(result)})
undefined
> BigNumber { s: 1, e: 6, c: [ 3000000 ] }

> coinContractInstance.balances(web3.eth.accounts[0],(error,result)=>{console.log(result.toString())})
undefined
> 3000000


```
### 监听合约事件
```

> coinContractInstance.Sent("pending", (err,res)=>conlose.log(res))
Filter {
  requestManager: 
   RequestManager {
     provider: 
      HttpProvider {
        host: 'http://localhost:8545',
        timeout: 0,
        user: undefined,
        password: undefined },
     polls: {},
     timeout: null },
  options: 
   { topics: 
      [ '0x3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345' ],
     from: undefined,
     to: undefined,
     address: '0x1e3b8ee785f4f1a68c9535a82681e644d46e7920',
     fromBlock: undefined,
     toBlock: undefined },
  implementation: 
   { newFilter: { [Function: send] request: [Function: bound ], call: [Function: newFilterCall] },
     uninstallFilter: { [Function: send] request: [Function: bound ], call: 'eth_uninstallFilter' },
     getLogs: { [Function: send] request: [Function: bound ], call: 'eth_getFilterLogs' },
     poll: { [Function: send] request: [Function: bound ], call: 'eth_getFilterChanges' } },
  filterId: null,
  callbacks: [],
  getLogsCallbacks: [],
  pollFilters: [],
  formatter: [Function: bound ] }
> 

> coinContractInstance.Sent("latest", (err,res)=>conlose.log(res))

> coinContractInstance.send(web3.eth.accounts[1],230000,{from:web3.eth.accounts[0]})
```


