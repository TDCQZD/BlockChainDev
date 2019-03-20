# Truffle

## 修改truffle.js
- 端口 ：8545
- ganache->development
```
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}
```

##  contracts目录下重构文件

migrations:修改2_deploy_contracts.js

```
var ConvertLib = artifacts.require('./ConvertLib.sol')
var MetaCoin = artifacts.require('./MetaCoin.sol')

module.exports = function (deployer) {
  deployer.deploy(ConvertLib)
  deployer.link(ConvertLib, MetaCoin)
  deployer.deploy(MetaCoin)
}
```
修改为
```
var Voting = artifacts.require('./Voting.sol')

module.exports = function (deployer) {
  deployer.deploy(Voting,['Alice','Bob','Cary'],{gas:290000})
  
}

```

## Geth
```
nohup geth --datadir data/folder --networkid 15 --rpc --rpcapi db,eth,net,web3,personal,miner  --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain "*" 2>output.log &

geth attach http://127.0.0.1:8545
tail -f output.log

personal.unlockAccount(web3.eth.accounts[0],"123456",3000000)

```

```
geth --datadir data/folder --networkid 15 --dev --rpc --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain "*" console 2>output.log

```
## 账户管理
```
root@Aws:~/blockchain/dapp/truffle_voting_dapp# truffle console
truffle(development)> web3.personal.newAccount('123456')
'0xe761ae77fd4365ff38b20c60d0edd9bf5b4937c9'
truffle(development)> 
undefined
truffle(development)> web3.eth.getBalance('0xe761ae77fd4365ff38b20c60d0edd9bf5b4937c9')
BigNumber { s: 1, e: 0, c: [ 0 ] }
truffle(development)> web3.personal.unlockAccount('0xe761ae77fd4365ff38b20c60d0edd9bf5b4937c9','123456',3000000)
true
truffle(development)> 
```
## 部署

```
root@Aws:~/blockchain/dapp/truffle_voting_dapp# truffle migrate
Using network 'development'.

Running migration: 2_deploy_contracts.js
  Deploying Voting...
  ... 0x5025484e7a6735313f0a3f50c7bb97e98d623c9523879cb1815bb722e470b21d
  Voting: 0x857eb22182aa671fa732ebbedfcea3431604ce11
Saving successful migration to network...
  ... 0x0ff6932e83e7e6f47c20d0beb9ca1547a5103945a6aab9ffcf1e650367d57ce0
Saving artifacts...
```
## 控制台交互
```
truffle(development)> Voting.deployed().then(function(contractInstance) {contractInstance.voteForCandidate('Alice').then(function(v) {console.log(v)})})
undefined
truffle(development)> { tx: '0x542f128d755f346c9910b6610924c2a4bd59826cd7289a4be2a53f950415530b',
  receipt: 
   { blockHash: '0xf1f164f6586b44e547a67859d8e74c7fdea4d1ff25a4f47eccca60377d59bb58',
     blockNumber: 654,
     contractAddress: null,
     cumulativeGasUsed: 42715,
     from: '0x9bbbb891258b071c265b6fd8608ca0c77c959a69',
     gasUsed: 42715,
     logs: [],
     logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
     root: '0xd6c729baebfb20498e671f06fea7d58e11df8aa6fa766bfa0045b7632a99f6e9',
     to: '0x857eb22182aa671fa732ebbedfcea3431604ce11',
     transactionHash: '0x542f128d755f346c9910b6610924c2a4bd59826cd7289a4be2a53f950415530b',
     transactionIndex: 0 },
  logs: [] }


  truffle(development)> Voting.deployed().then(function(contractInstance) {contractInstance.totalVotesFor.call('Alice').then(function(v) {console.log(v)})})
undefined
truffle(development)> BigNumber { s: 1, e: 0, c: [ 1 ] }


```
truffle(development)> Voting.deployed().then(function (contractInstance) {contractInstance.totalVotesFor.call('Alice').then(function (v) {console.log(v.toString())});});
undefined
truffle(development)> 1

undefined
truffle(development)> Voting.deployed().then(function (contractInstance) {contractInstance.totalVotesFor.call('Bob').then(function (v) {console.log(v.toString())});});
undefined
truffle(development)> 0
truffle(development)> Voting.deployed().then(function (contractInstance) {contractInstance.totalVotesFor.call('Cary').then(function (v) {console.log(v.toString())});});
undefined
truffle(development)> 0

```
```

## 网页交互
```
root@Aws:~/blockchain/dapp/truffle_voting_dapp# npm run dev
> truffle-init-webpack@0.0.2 dev /root/blockchain/dapp/truffle_voting_dapp
> webpack-dev-server

ℹ ｢wds｣: Project is running at http://localhost:8080/
ℹ ｢wds｣: webpack output is served from /
⚠ ｢wdm｣: Hash: b9f62e03ea3a96b92108
Version: webpack 4.24.0
Time: 18640ms
Built at: 2018-11-05 15:46:52
     Asset      Size  Chunks                    Chunk Names
    app.js   699 KiB       0  [emitted]  [big]  main
app.js.map  2.59 MiB       0  [emitted]         main
index.html  1.36 KiB          [emitted]         
Entrypoint main [big] = app.js app.js.map
 [31] ./node_modules/url/url.js 22.8 KiB {0} [built]
 [49] ./node_modules/events/events.js 8.13 KiB {0} [built]
[105] multi (webpack)-dev-server/client?http://localhost:8080 ./app/scripts/index.js 40 bytes {0} [built]
[106] (webpack)-dev-server/client?http://localhost:8080 7.78 KiB {0} [built]
[112] ./node_modules/strip-ansi/index.js 161 bytes {0} [built]
[114] ./node_modules/loglevel/lib/loglevel.js 7.68 KiB {0} [built]
[115] (webpack)-dev-server/client/socket.js 1.05 KiB {0} [built]
[117] (webpack)-dev-server/client/overlay.js 3.58 KiB {0} [built]
[122] (webpack)/hot sync nonrecursive ^\.\/log$ 170 bytes {0} [built]
[124] (webpack)/hot/emitter.js 75 bytes {0} [built]
[125] ./app/scripts/index.js 2.87 KiB {0} [built]
[126] ./node_modules/babel-runtime/core-js/object/keys.js 92 bytes {0} [built]
[153] ./node_modules/web3/index.js 193 bytes {0} [built]
[231] ./node_modules/truffle-contract/index.js 437 bytes {0} [built]
[340] ./build/contracts/Voting.json 86.6 KiB {0} [built]
    + 326 hidden modules

```


