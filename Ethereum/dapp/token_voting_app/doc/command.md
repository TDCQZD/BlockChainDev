# command

## truffle 项目
```
> mkdir token_based_voting_dapp
> cd token_based_voting_dapp
> truffle unbox webpack
> rm contracts/ConvertLib.sol contracts/MetaCoin.sol
> npm install  ganache-cli --save-dev
```

## 修改配置

**修改truffle.js**

- 端口 ：8545
- ganache->development
```
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: '172.18.121.156',
      port: 8545,
      network_id: '*' ,// Match any network id
      gas: 5000000  
    }
  }
}

```
**修改package.json**
package.json 修改dev,便于云服务器外网可以访问。
``` 
 "dev": "webpack-dev-server --host 172.18.121.156"
```
> 172.18.121.156 :阿里云ESC 内网IP

## 合约
### 编写合约

Voting.sol

### 修改2_deploy_contracts.js

将 `2_deploy_contracts.js `的内容更新为以下信息：
```
var Voting = artifacts.require("../contracts/Voting.sol");

module.exports = function(deployer) { 
	deployer.deploy(Voting, 10000, web3.toWei('0.01', 'ether'), ['Alice', 'Bob', 'Cary']);
};

```
### 编译合约
```
truffle compile
```
### 部署合约
```
truffle migrate
```
## 合约测试

> 测试时：合约必须已经部署成功！！
### Solidity
```
truffle test test/TestVoting.sol
```
注意：如果报`VM Exception while processing transaction: out of gas`异常，修改`truffle.js` 中设置的`gas`值。或者使用默认的Gas值。
### Javascript
```
truffle test test/voting.js
```
## 合约交互

**开启ganache**
```
node_modules/.bin/ganache-cli
node_modules/.bin/ganache-cli -h 172.18.121.156 (0.0.0.0)
node_modules/.bin/ganache-cli -p 8545
```

**控制台交互**

进入turffle控制台：

```
truffle console
```
```
truffle(development)> 
Voting.deployed().then(function(instance) {instance.totalVotesFor.call('Alice').then(function(i) {console.log(i)})})

truffle(development)> 
Voting.deployed().then(function(instance) {console.log(instance.totalTokens.call().then(function(v) {console.log(v)}))})

truffle(development)> 
Voting.deployed().then(function(instance) {console.log(instance.tokensSold.call().then(function(v) {console.log(v)}))})

truffle(development)> 
Voting.deployed().then(function(instance) {console.log(instance.buy({value: web3.toWei('1', 'ether')}).then(function(v) {console.log(v)}))})

truffle(development)> 
web3.eth.getBalance(web3.eth.accounts[0])

truffle(development)> 
Voting.deployed().then(function(instance) {console.log(instance.tokensSold.call().then(function(v) {console.log(v)}))})

truffle(development)> 
Voting.deployed().then(function(instance) {console.log(instance.voteForCandidate('Alice', 25).then(function(v) {console.log(v)}))})

truffle(development)> 
Voting.deployed().then(function(instance) {console.log(instance.voteForCandidate('Bob', 10).then(function(v) {console.log(v)}))})

truffle(development)> 
Voting.deployed().then(function(instance) {console.log(instance.voteForCandidate('Cary', 10).then(function(v) {console.log(v)}))})

truffle(development)>
 Voting.deployed().then(function(instance) {console.log(instance.voterDetails.call(web3.eth.accounts[0]).then(function(v) {console.log(v)}))})

truffle(development)> 
Voting.deployed().then(function(instance) {instance.totalVotesFor.call('Alice').then(function(i) {console.log(i)})})

truffle(development)> 
web3.eth.getBalance(Voting.address).toNumber()

```

**网页交互**
1. 启动webpack
```
npm run dev
```
2. 输入网址：http://39.108.111.144:8080,出现以下界面

![](./voting_4.png)