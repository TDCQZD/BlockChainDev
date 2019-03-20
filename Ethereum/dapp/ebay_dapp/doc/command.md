
## Truffle项目
```
$ mkdir ebay_dapp
$ cd ebay_dapp
$ truffle unbox webpack
$ rm contracts/ConvertLib.sol contracts/MetaCoin.sol
$ npm install  ganache-cli --save-dev
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

## 控制台交互

**开启ganache**
```
node_modules/.bin/ganache-cli
node_modules/.bin/ganache-cli -h 172.18.121.156 (0.0.0.0)
node_modules/.bin/ganache-cli -p 8545
```
**修改migrations/2_deploy_contracts.js**


var EcommerceStore = artifacts.require("./EcommerceStore.sol");

module.exports = function(deployer) {
 deployer.deploy(EcommerceStore);
};

**编译部署合约**

```
truffle compile
truffle migrate
```

```
truffle console
```

**测试：添加产品和获取产品**

```
 amt_1 = web3.toWei(1, 'ether');

 current_time = Math.round(new Date() / 1000);

 EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 6', 'Cell Phones & Accessories', 'imagelink', 'desclink', current_time, current_time + 800, amt_1, 0).then(function(res) {console.log(res)})});

 EcommerceStore.deployed().then(function(i) {i.getProduct.call(1).then(function(res) {console.log(res)})});

```

```
web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]).toString(),'ether')

web3.fromWei(web3.eth.getBalance(web3.eth.accounts[2]).toString(),'ether')
```


**测试：拍卖出价**

```
 sealedBid = web3.sha3((2 * amt_1)+'secret1')

EcommerceStore.deployed().then(function(i) {i.bid(1, sealedBid, {value: 3*amt_1, from: web3.eth.accounts[1]}).then(function(res) {console.log(res)}).catch(console.log)});


sealedBid = web3.sha3((3 * amt_1)+'secret2')

EcommerceStore.deployed().then(function(i) {i.bid(1, sealedBid, {value: 3*amt_1, from: web3.eth.accounts[2]}).then(function(res) {console.log(res)})});

```
**测试：揭示出价**
```

EcommerceStore.deployed().then(function(i){i.revealBid(1,(2*amt_1).toString(),'secret1',{from: web3.eth.accounts[1]}).then(function(res){console.log(res)})})

EcommerceStore.deployed().then(function(i){i.revealBid(1,(2*amt_1).toString(),'secret2',{from: web3.eth.accounts[2]}).then(function(res){console.log(res)}).catch(console.log)})

EcommerceStore.deployed().then(function(i) {i.highestBidderInfo.call(1).then(function(res) {console.log(res)})})

EcommerceStore.deployed().then(function(i) {i.totalBids.call(1).then(function(res) {console.log(res)})})
```

## IPFS 

**IPFS 配置**
```
> tar xzvf go-ipfs_v0.4.10_linux-386.tar.gz 
> cd go-ipfs
> ./ipfs init
> ./ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
> ./ipfs daemon
```
**通过前端与 IPFS 进行交互**
```
npm install ipfs-api --save-dev
```


## Web 产品

1. 种子区块链

```
truffle exec seed.js
```

2. index.html

3. inde.js

## 陈列表单
1. list-item.htm
2. 更新 webpack 配置

```
new CopyWebpackPlugin([
{ from: './app/index.html', to: "index.html" },
{ from: './app/list-item.html', to: "list-item.html" }
])
```



## web 拍卖
1. product.html
2. 更新 webpack 配置
```
new CopyWebpackPlugin([
{ from: './app/index.html', to: "index.html" },
{ from: './app/list-item.html', to: "list-item.html" },
{ from: './app/product.html', to: "product.html" }
])

```
3. 更新 index.js

## 托管服务


### 托管合约
1. 创建一个叫做 Escrow 的合约，参数为买方，卖方，任意第三者和产品 id。买方，卖方和第三方实际上都是以太坊地址。


### 宣布赢家
1. 向 index.js 添加一个结束拍卖的功能。并且检查产品状态，显示结束拍卖的按钮。
2. 更新product.html
3. 更新EcommerceStore.sol
4. 更新index.js
###  释放资金
1. 修改EcommerceStore.sol
2. 修改index.js
3. product.html：在 html 中加上下面的元素，用来显示托管信息
## 链下产品
### 安装MongoDB
package.json
```
"devDependencies": {
  ...
  ...
  "ethereumjs-util": "5.1.2",
  "mongoose": "4.11.7"
}
```
```
$ npm install
```
### 产品定义
当使用 Mongoose 时，我们必须定义一个打算在 MongoDB 数据库中存储的实体的 schema。在我们的案例中，我们是在数据库中存储和查询产品。让我们给产品添加一个 schema，内容就是我们在 contract struct 里面的信息。在你的项目目录下创建一个叫做 product.js 的文件。
### 安装 NodeJS 应用
1. package.json
  ```
  "devDependencies": {
    ...
    ...
    "express": "4.15.4",
    "nodemon": "^1.11.0"
  }
  ```
  ```
  $ npm install
  ```
2. server.js
3. start nodemon
```
$ node_modules/.bin/nodemon server.js
```
### Solidity 事件
1. 在合约中声明事件
2. Trigger Event
2. Watch Event
### 存储商品
1. mongo
2. server.js
### 浏览商品
1. index.js
2. server.js