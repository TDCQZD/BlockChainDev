# truffle构建智能合约项目


## Truffle项目

```
> npm install -g truffle
> npm install -g webpack
```
```
> mkdir truffle_voting_dapp
> cd truffle_voting_dapp
> truffle unbox webpack
> rm contracts/ConvertLib.sol contracts/MetaCoin.sol
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
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    }
  }
}
```
**修改package.json**
package.json 修改dev,便于云服务器外网可以访问。
``` 
 "dev": "webpack-dev-server --host 0.0.0.0"
```

## 合约

### 编写合约

Voting.sol

### 修改2_deploy_contracts.js

将 `2_deploy_contracts.js `的内容更新为以下信息：
```
var Voting = artifacts.require("./Voting.sol");
module.exports = function(deployer) { 
	deployer.deploy(Voting, ['Alice', 'Bob', 'Cary'], {gas: 
				290000});
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

## 合约交互


**控制台交互**

进入turffle控制台：

```
truffle console
```
```
Voting.deployed().then(function(contractInstance) {contractInstance.voteForCandidate('Alice').then(function(v) {console.log(v)})})


 Voting.deployed().then(function(contractInstance) {contractInstance.totalVotesFor.call('Alice').then(function(v) {console.log(v)})})
```
**网页交互**

![](./voting_3.png)
