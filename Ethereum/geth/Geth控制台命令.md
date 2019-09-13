# Geth控制台命令

eth Console是一个交互式的 JavaScript 执行环境，里面内置了一些用来操作以太坊的 JavaScript 对象，我们可以直接调用这些对象来获取区块链上的相关信息。这些对象主要包括：
- eth：主要包含对区块链进行访问和交互相关的方法；
- net：主要包含查看p2p网络状态的方法；
- admin：主要包含与管理节点相关的方法；
- miner：主要包含挖矿相关的一些方法；
- personal：包含账户管理的方法；
- txpool：包含查看交易内存池的方法；
- web3：包含以上所有对象，还包含一些通用方法。
常用命令有：
```
personal.newAccount()：创建账户；
personal.unlockAccount()：解锁账户；
eth.accounts：列出系统中的账户；
eth.getBalance()：查看账户余额，返回值的单位是 Wei；
eth.blockNumber：列出当前区块高度；
eth.getTransaction()：获取交易信息；
eth.getBlock()：获取区块信息；
miner.start()：开始挖矿；
miner.stop()：停止挖矿；
web3.fromWei()：Wei 换算成以太币；
web3.toWei()：以太币换算成 Wei；
txpool.status：交易池中的状态；
```