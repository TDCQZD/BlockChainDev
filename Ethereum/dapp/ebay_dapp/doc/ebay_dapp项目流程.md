# ebay_dapp项目流程
## 项目实现功能
1. 列出商品。商场应该能够让商家陈列商品。我们会实现让任何人免费陈列商品的功能。为了便于查询，我们会将数据同时存在链上和链下的数据库。

2. 将文件放到 IFPS： 我们会实现一个将图片和产品介绍（大文本）上传到 IPFS 的功能。

3. 浏览产品：我们会实现基于目录，拍卖时间等过滤和浏览商品的功能。

4. 拍卖：跟 eBay 一样，我们会实现 Vickery 拍卖对商品出价。与中心化应用不同，以太坊上的一切都是公开的，我们的实现将会有些不同。我们的实现将会类似于 ENS 的工作方式。

5. 托管合约（Escrow Contract）：一旦出价结束，商品有了赢家以后，我们会创建在买方，卖方和一个任意第三方的托管合约。

6. 2/3 签名：我们会加入防欺诈保护，方式为实现 2/3 多重签名，即三个参与者有两个同意才会将资金释放给卖方，或是将资金返还给买方。

## Dapp 的架构
1. Web 前端：web 前端由 HTML，CSS 和 JavaScript 组合而成（大量使用了 web3js）。用户将会通过这个前端应用于区块链，IPFS 和 NodeJS 服务器交互。

2. 区块链：这是应用的核心，所有的代码和交易都在链上。商店里的所有商品，用户的出价和托管合约都在链上。

3. MongoDB：尽管产品存储在区块链上，但是通过查询区块链来显示产品，应用各种过滤（比如只显示某一类的产品，显示即将过期的产品等等）。我们会用 MongoDB 数据库来存储商品信息，并通过查询 MongoDB 来显示产品。

4. NodeJS 服务器：这是后端服务器，前端通过它与区块链通信。我们会给前端暴露一些简单的 API 从数据库中查询和检索产品。

5. IPFS: 当一个用户在商店里上架一个商品，前端会将产品文件和介绍上传到 IPFS，并将所上传文件的哈希存到链上。

## 实现步骤

1. 我们首先会用 solidity 和 truffle 框架实现合约，将合约部署到 ganache 并通过 truffle 控制台与合约进行交互。

2. 然后我们会学习 IPFS，安装并通过命令行与它交互。

3. 后端实现完成后，我们会构建前端与合约和 IPFS 进行交互。我们也会在前端实现出价和显示拍卖的功能。

4. 我们会安装 MongoDB 并设计存储产品的数据结构。

5. 一旦数据库启动运行，我们会实现 NodeJS 服务端代码，以监听合约事件，并记录向控制台的请求。我们然后会实现向数据库中插入产品的代码。

6. 我们将会更新前端从数据库而不是从区块链查询产品。

7. 我们会实现托管合约以及对应的前端，参与者可以从来向买方/买房释放或撤回资金。

## 以太坊合约
EcommerceStore.sol
### Truffle项目
```
$ mkdir ebay_dapp
$ cd ebay_dapp
$ truffle unbox webpack
$ rm contracts/ConvertLib.sol contracts/MetaCoin.sol
```
### 存储产品和元数据的数据结构
1. struct Product: 当用户想要在商店列出一个商品时，他们必须要输入关于产品的所有细节。我们将所有的产品信息存储在一个 struct 里面。struct 里面的大部分元素都应当清晰明了。你应该能够注意到有两个元素 imageLink 和 descLink。除了在链上存储产品图片和大的描述文本，我们还会存储 IPFS 链接（下节会有更多介绍），当我们要渲染网页时，会从这些链接中获取这些细节。

2. enum: 很多编程语言都有枚举（enum）的概念。它是一个用户定义类型，可以被转换为整型。在我们的案例中，我们会将产品的条件和状态存储为枚举类型。所以，Open 的 ProductStatus 在链上存储为 0，已售出则为 1，如此类推。它也可以使得代码更加易读（相比于将 ProductStatus 声明为 0，1，2）

3. productIndex: 我们会给加入到商店的每个商品赋予一个 id。这就是一个计数器，每当一个商品加入到商店则加 1 。

4. productIdInStore: 这是一个 mapping，用于跟踪哪些商品在哪个商店。

5. stores mapping: 任何人都可以免费列出商店里的产品。我们通过 mapping 跟踪谁插入了商品。键位商家的账户地址，值为 productIndex 到 Product 结果的 mapping。
### 合约编译
1. 合约数据结构
2. 添加商品
3. 出价竞拍
4. 揭示出价


### 控制台交互
1. 开启dev 环境
```
truffle compile
node_modules/.bin/ganache-cli -h 0.0.0.0
truffle migrate / truffle migrate --reset
truffle console
```
2. 向区块链添加一个商品

3. 通过 product id 检索你插入的商品

4. 拍卖测试
 - 首先向区块链插入一个商品（拍卖结束时间从现在算起 200 秒）
 - 从不同账户出价
 - 等待直到拍卖结束后，揭示所有出价
 - 使用 getter 方法来查看是谁赢得了拍卖
## IPFS
```
npm install ipfs-api --save-dev
```
### 配置
```
$ tar xzvf go-ipfs_v0.4.10_linux-386.tar.gz (your file name might be slightly different)
$ cd go-ipfs
$ ./ipfs init
$ ./ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
$ ./ipfs daemon
```

### 读写文件
```
$ ./ipfs add iphone.png
$ added QmStqeYPDCTbgKGUwns2nZixC5dBDactoCe1FB8htpmrt1 iphone.png

```

## Web 产品
1. 产品首页：在上面看到区块链的所有产品。
2. 产品添加界面：用户用来添加产品到区块链的网页。
3. 产品详情界面：用户可以看到产品细节，上面的出价以及揭示他们的出价。
### 产品首页
- index.js :前端逻辑处理
- 种子区块链 seed.js
- HTML 设置 ：商店里的产品列表
### 产品添加界面
- list-item.html
### 产品详情界面
- product.html 的文件



## 托管服务
创建一个 Multisig Escrow（多重签名托管）合约，里面存放了了买方赢得拍卖的数量，买方，卖方和一个任意的第三方是参与者。托管的资金只能被释放给卖方，或是返回给买方，并且至少需要三个参与者中的两个同意才能执行。

### 托管合约

按照以下步骤自主实现合约。

1. 创建一个叫做 Escrow 的合约，参数为买方，卖方，任意第三者和产品 id。买方，卖方和第三方实际上都是以太坊地址。
2. 我们必须跟踪所有的参与者，谁同意释放资金给卖家，谁同意返回资金给买家。所以，分别创建一个地址到布尔型的 mapping ，叫做 releaseAmount，另一个为 refundAmount 的 mapping。
3. 我们无法方便地查询上述 mapping 有多少个 key，所以并没有一个很好的方式查看 3 个参与者有多少人投票了释放资金。因此，声明两个变量 releaseCount 和 refundCount。如果 releaseCount 达到 2，我们就释放资金。类似地，如果 refundCount 的值达到 2，我们将资金返回给买家。
4. 创建一个构造函数，参数为所有的参与者和产品 id，并将它们赋值给我们已经声明的变量。记得将购买函数标记为 payable。一个 payable 的构造函数表明，当它初始化时，你可以向合约发送资金。在我们的案例中，托管合约创建后，赢家出价的资金就会发送给它。
5. 实现一个释放资金给卖方的函数。无论是谁调用该函数，它都应该更新 releaseAmount mapping，同时将 release count 加 1。如果 release count 计数达到 2，就是用 solidity 的 transfer 方法将合约里托管的资金发送给卖方。
6.  与 release amount 函数类似，实现将资金撤回给买方的函数，它会更新 refundAmount mapping 并将 refundCount 加 1.如果 refundCount 达到 2，将资金转移给买方。
7. 一旦合约释放完资金，应该禁用所有的函数调用。所以，声明一个叫做 fundsDisbursed 的字段，当资金释放给卖方或是返还给买方时，将其设置为 true。

### 宣布赢家

一旦拍卖揭示阶段结束，我们会关闭拍卖并宣布赢家。这里是拍卖结束时的操作。

1. 拍卖由仲裁人结束。当结束时，我们创建有仲裁人，买方和卖方的托管合约（上一节我们已经实现了该合约），并将资金转移到合约。
2. 记住我们只能向买方收取第二高的出价费用。所以，我们需要将差额归还给赢家。

**向 index.js 添加一个结束拍卖的功能。并且检查产品状态，显示结束拍卖的按钮。**

###  释放资金
1. 修改EcommerceStore.sol
- 在 EcommerceStore 合约中实现跳过函数的功能，EcommerceStore 合约会调用托管合约里面的 release 和 refund 函数。我们也定义几个获取托管地址和细节的帮助函数。
2. 修改index.js

## 链下产品
在链下用数据库备份商品，用它来查询商品。因为主备份仍然是在链上，任何人都可以验证产品并没有被数据库所篡改。即使数据库挂掉了，产品依然在链上，依然可以从链上获取产品。

当添加一个产品到区块链上，我们将会触发一个事件（在 8.5 节你将会学习事件的更多内容）。我们的后端服务器会监听这些事件，会包含所有细节并将其插入数据库。当我们构建前端时，我们会查询数据库而不是区块蓝显示所有产品，并对其过滤。

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
1. 在你的项目目录下创建一个叫做 product.js 的文件。
### 安装 NodeJS 应用
我们会使用 Expressjs，一个简单，简约的 web 框架来处理 web 请求。通过使用 Express，只需要几行 JavaScript 代码就可以暴露 API endpoint。开发 NodeJS 应用时其中一个恼人的问题就是，代码变动时，你需要重启应用才能看到代码变化。为了避免每次改动后必须重启才能看到变化，我们会使用一个叫做 nodemon 的库。nodemon 会监控文件内容，当文件发生改动时就会重启服务器。将 expressjs 和 nodemon 加入 package.json 并安装。
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
```
var express = require('express');
var app = express();

app.listen(3000, function() {
 console.log('Ebay Ethereum server listening on port 3000!');
});

app.get('/', function(req, res) {
 res.send("Hello, World!");
});
```
3. start nodemon
```
$ node_modules/.bin/nodemon server.js
```
### Solidity 事件
1. 在合约中声明事件，如下所示：
```
 event NewProduct(uint _productId, string _name, string _category, string _imageLink, string _descLink,
  uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _productCondition);
```
2. Trigger Event

在合约代码中，用以下的方式触发一个事件：
```
  emit NewProduct(productIndex, _name, _category, _imageLink, _descLink, _auctionStartTime, _auctionEndTime, _startPrice, _productCondition);
```
2. Watch Event

这样我们就可以在 js 中监听事件，并进行相应的处理了。在我们的例子中，会读取事件中的信息，并存入数据库中。
```
 EcommerceStore.deployed().then(function(i) {
  productEvent = i.NewProduct({fromBlock: 0, toBlock: 'latest'});
  //change fromBlock to something recent on Ropsten
  productEvent.watch(function(err, result) {
   if (err) {
    console.log(err)
    return;
   }
   saveProduct(result.args);
  });
```
### 存储商品
有了刚才的铺垫，让我们更新一个合约，当一个产品被添加到区块链时，触发一个事件，将代码加入到服务端监听这些事件，并将产品插入到数据库中。

### 浏览商品
更新 index.js，使其通过查询数据库而不是区块链来渲染 index.html 中的商品。

## 部署
到目前为止，我们已经在 ganache 上实现并测试了 dapp。此刻，如果已经实现想要的所有功能，你可以将 dapp 部署到一个测试网（Ropsten, Rinkeby 或者 Kovan）。按照下列步骤部署并设置你的 dapp。

1. 启动你的以太坊客户端（geth，parity 等等）并保证完全同步。
2. 移除 build/ 目录 ganache 的相关内容，再次运行 truffle migrate。

如果你想要将应用托管在一个 web 服务器以便于全世界的人都可以接入，按照以下步骤。下面假设你的用户会使用 metamask 与你的 dapp 进行交互：

1. 不必运行你自己的 IPFS 节点，你可以使用像 Infura 这样的免费托管服务。在你的 index.js 中，将 IPFS 的配置从 localhost 替换为 Infura。
```
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'http'})
```
2. 可能会有一些没有 metamask 的用户访问你的网站。这时不要什么都不显示，至少将产品显示出来。为此，我们再次使用 infura 托管的以太坊节点，而不是使用我们自己的节点。为此，在 Infura 上免费注册。注册好后，你应该会有一个 API key。用这个 API key 更新 index.js 里面的 web3 provider，将其从 localhost 更新为 Infura 的服务器，就像下面这样
```
window.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/API_KEY"));
```
3. 然后你必须打包 JavaScript 和 HTML 文件，以便于能够部署到 web 服务器。为此，在项目目录下运行 webpack 即可，然后它会将所有的 js 和 HTML 文件输出到 build 目录。
4. 将 js 和 HTML 文件拷贝到 web 服务器上的 web 目录，然后其他人就可以访问你的 dapp 了！



# 启动项目
```
ipfs daemon # 开启ipfs
npm run dev # 前端
truffle compile # 
```