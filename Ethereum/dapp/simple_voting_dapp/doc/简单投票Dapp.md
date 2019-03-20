# 简单投票DApp
简单投票DApp是一个基于以太坊私链的投票应用Dapp.虽然简单，但是包含Dapp开发的完整工作流程。

**实现的功能如下：**
1. 创建Solidity合约
2. 合约编译
3. 部署合约
4. 合约交互
    - 控制台交互
    - 页面交互

**构建这个应用的主要步骤如下：**
1.	我们首先安装一个叫做 ganache的模拟区块链，能够让我们的程序在开发环境中运行。
2.	写一个合约并部署到 ganache 上。
3.	然后我们会通过命令行和网页与 ganache 进行交互。

ganache配置详见ganache-cli.md

**RPC 调用**
我们与区块链进行通信的方式是通过 RPC（Remote Procedure Call）。web3js 是一个 JavaScript 库，它抽象出了所有的 RPC 调用，以便于你可以通过 JavaScript 与区块链进行交互。另一个好处是，web3js 能够让你使用你最喜欢的 JavaScript 框架构建非常棒的 web 应用。
## 开发环境配置

```
mkdir simple_voting_dapp
cd simple_voting_dapp
npm init
npm install ganache-cli --save-dev
npm install solc --save-dev
npm install web3@0.20.1 --save-dev
```
**普通启动**

``` 
node_modules/.bin/ganache-cli
```

**指定IP 启动ganache**

```
node_modules/.bin/ganache-cli -h 0.0.0.0
```

## Solidity合约

我们会写一个叫做 Voting 的合约，这个合约有以下内容：
- 一个构造函数，用来初始化一些候选者。
- 一个用来投票的方法（对投票数加 1）
- 一个返回候选者所获得的总票数的方法

当你把合约部署到区块链的时候，就会调用构造函数，并只调用一次。与 web 世界里每次部署代码都会覆盖旧代码不同，在区块链上部署的合约是不可改变的，也就是说，如果你更新合约并再次部署，旧的合约仍然会在区块链上存在，并且数据仍在。新的部署将会创建合约的一个新的实例。

## 编译合约

 ``` 编译合约
> node
> var Web3 = require('web3')
> var web3 = new Web3(new Web3.providers.HttpProvider("http://39.108.111.144:8545"))
> var solc = require('solc');
> var sourceCode = fs.readFileSync('./contracts/voting.sol').toString();
> var compiledCode = solc.compile(sourceCode);

```
> 说明：39.108.111.144 ：是云服务器IP,如果是本地，可以使用127.0.0.1(localhost)

首先，在终端中运行 `node` 进入 `node` 控制台，初始化 `web3` 对象，并向区块链查询获取所有的账户。
确保与此同时 `ganache` 已经在另一个窗口中运行。

为了编译合约，先从 `Voting.sol` 中加载代码并绑定到一个 `var` 类型的变量(`sourceCode`)，然后对合约进行编译。

当成功地编译好合约，打印 `compiledCode` 对象（直接在 `node` 控制台输入 `compiledCode` 就可以看到内容），你会注意到有两个重要的字段，它们很重要，你必须要理解：
1.	compiledCode.contracts[':Voting'].bytecode: 这就是 Voting.sol 编译好后的字节码。也是要部署到区块链上的代码。
2.	compiledCode.contracts[':Voting'].interface: 这是一个合约的接口或者说模板（叫做 abi 定义），它告诉了用户在这个合约里有哪些方法。在未来无论何时你想要跟任意一个合约进行交互，你都会需要这个 abi 定义。你可以在这里 看到 ABI 的更多内容。

在以后的项目中，我们将会使用 `truffle` 框架来管理编译和与区块链的交互。但是，在使用任何框架之前，深入了解它的工作方式还是大有裨益的，因为框架会将这些内容抽象出去。

## 部署合约
现在将合约部署到区块链上。为此，你必须先通过传入 `abi` 定义来创建一个合约对象 `VotingContract`。然后用这个对象在链上部署并初始化合约。
```
> var abi = JSON.parse(compiledCode.contracts[':Voting'].interface);
> var byteCode = compiledCode.contracts[':Voting'].bytecode;
> var VotingContract = web3.eth.contract(abi);
> var deployTxObj = {data: byteCode, from: web3.eth.accounts[0], gas: 3000000};
> var contractInstance = VotingContract.new(['Alice','Bob','Cary'],deployTxObj);
> contractInstance.address
```
`VotingContract.new()` 将合约部署到区块链。

第一个参数是一个候选者数组，候选者们会竞争选举，这很容易理解。让我们来看一下第二个参数里面都是些什么：

1.	data: 这是我们编译后部署到区块链上的字节码。

2.	from: 区块链必须跟踪是谁部署了这个合约。在这种情况下，我们仅仅是从调用 web3.eth.accounts 返回的第一个账户，作为部署这个合约的账户。记住，web3.eth.accounts 返回一个 ganache 所创建10 个测试账号的数组。在交易之前，你必须拥有这个账户，并对其解锁。创建一个账户时，你会被要求输入一个密码，这就是你用来证明你对账户所有权的东西。在下一节，我们将会进行详细介绍。为了方便起见，ganache 默认会解锁 10 个账户。

3.	gas: 与区块链进行交互需要花费金钱。这笔钱用来付给矿工，因为他们帮你把代码包含了在区块链里面。你必须指定你愿意花费多少钱让你的代码包含在区块链中，也就是设定 “gas” 的值。你的 “from” 账户里面的 ETH 余额将会被用来购买 gas。gas 的价格由网络设定。

我们已经部署了合约，并有了一个合约实例（变量 `contractInstance`），我们可以用这个实例与合约进行交互。

在区块链上有上千个合约。那么，如何识别你的合约已经上链了呢？

答案是找到已部署合约的地址：`deployedContract.address` 当你需要跟合约进行交互时，就需要这个部署地址和我们之前谈到的 abi 定义。

## 控制台交互


```
> contractInstance.voteForCandidate("Alice",{from: web3.eth.accounts[0]});
'0x1b4405f55bf0f0c7d11dfd07110787df296a7ac70bd0e6911951d1ad6a99e19e'
> 


> contractInstance.totalVotesFor("Alice");
BigNumber { s: 1, e: 0, c: [ 1 ] }
> contractInstance.totalVotesFor("Alice").toString();
'1'
>


> contractInstance.totalVotesFor.call("Bob").toString();
'0'
> contractInstance.voteForCandidate.sendTransaction("Cary",{from: web3.eth.accounts[0]}); 
'0x26f0b4f71509935be533782259b31721e945a0ff41140e6b02314ed600f3ed59'
> contractInstance.totalVotesFor.call("Cary").toString();
'1'
```
`{ [String: '0'] s: 1, e: 0, c: [ 0 ] } `是数字 0 的科学计数法表示. 这里返回的值是一个bigNumber对象，可以用它的的.toNumber()方法来显示数字：

```
> contractInstance.totalVotesFor.call('Alice').toNumber()
> web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]).toNumber(),'ether') 
```
- BigNumber的值以符号，指数和系数的形式,以十进制浮点格式进行存储。
- s 是sign 符号，也就是正负；
- e 是exponent 指数，表示最高位后有几个零；
- c 是coefficient 系数，也就是实际的有效数字；bignumber构造函数的入参位数限制为14位，所以系数表示是从后向前截取的一个数组，14位截取一次。

**为候选者投票并查看投票数**

在你的 node 控制台里调用 voteForCandidate 和 totalVotesFor 方法并查看结果。

每为一位候选者投一次票，你就会得到一个交易 id: 
比如：
`0xdedc7ae544c3dde74ab5a0b07422c5a51b5240603d31074f5b75c0ebc786bf53`。这个交易 id 是交易发生的凭据，你可以在将来的任何时候引用这笔交易。这笔交易是不可改变的。

对于以太坊这样的区块链，不可改变是其主要特性之一。之后我们将会继续利用这一特性构建应用。


 ## 网页交互
至此，大部分的工作都已完成，我们还需要做的事情就是创建一个简单的 html，里面有候选者姓名并调用投票命令（我们已经在 nodejs 控制台里试过）。你可以在下面找到 html 代码和 js 代码。将它们放到项目目录，并在浏览器中打开 index.html。
 1. index.html
    见app/index.html
 2. index.js
    见app/index.js

 3. server.js
   见app/server.js
  

**solc编译合约**

使用solc 编译合约，生成voting_sol_Voting.abi 和 voting_sol_Voting.bin，便于在index.js中使用。

```
solcjs --bin voting.sol
solcjs --abi voting.sol 
```

**静态界面**
![](./voting_1.png)
**nodejs启动服务**
```
node server.js
```
浏览器输入地址`http://39.108.111.144:8080/index.html`,出现如下界面
![](./voting_2.png)
## 总结
如果你可以看到页面，为候选者投票，然后看到投票数增加，那就已经成功创建了第一个合约，恭喜！所有投票都会保存到区块链上，并且是不可改变的。任何人都可以独立验证每个候选者获得了多少投票。

当然，我们所有的事情都是在一个模拟的区块链上（ganache）完成，在接下来的文章中，我会将这个合约部署到真正的公链上。

总结一下，下面是你到目前为止已经完成的事情：
1.	通过安装 node, npm 和 ganache，你已经配置好了开发环境。
2.	你编码了一个简单的投票合约，编译并部署到区块链上。
3.	你通过 nodejs 控制台与网页与合约进行了交互。	
