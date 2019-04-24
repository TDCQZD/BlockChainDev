# 源码解析
## 以太坊设计原理
* https://ethfans.org/posts/510
## 源码解析
- 账户
    - nonce
- 默克尔帕特里夏树(Merkle Patricia tree/trie)
    - 用于存储所有账户状态，以及每个区块中的交易和收据数据
- RLP(recursive length prefix)：递归长度前缀
    - RLP旨在成为高度简化的序列化格式，它唯一的目的是存储嵌套的字节数组
- 树（trie）的使用
    - 以太坊区块链中每个区块头都包含指向三个树的指针：状态树、交易树、收据树。
    - 状态树代表访问区块后的整个状态；
    - 交易树代表区块中所有交易，这些交易由index索引作为key；（例如，k0:第一个执行的交易，k1：第二个执行的交易）
    - 收据树代表每笔交易相应的收据。
- 虚拟机EVM
- Gas和费用
- 难度更新算法
- Uncle块（过时区块）的奖励
    - 在以太坊，过时分叉上7代内的亲属区块才能称作过时区块
    - GHOST的目的正是要解决挖矿过时造成的安全性降低的问题。
        - GHOST解决了在计算哪个链是最长的链的过程中，因产生过时区块而造成的网络安全性下降的问题。也就是说，不仅是父区块和更早的区块,同时Uncle区块⑥也被添加到计算哪个块具有最大的工作量证明中去
    - 解决第二个问题：中心化问题，我们采用不同的策略：对过时区块也提供区块奖励：挖到过时区块的奖励是该区块基础奖励的7/8；挖到包含过时区块的nephew区块将收到1/32的基础奖励作为赏金。但是，交易费并不奖励给Uncle区块或nephew区块。

go-ethereum项目的组织结构如下：
```
    accounts        实现了一个高等级的以太坊账户管理
    bmt             二进制的默克尔树的实现
    build           主要是编译和构建的一些脚本和配置
    cmd             命令行工具，又分了很多的命令行工具，下面一个一个介绍
        /abigen     Source code generator to convert Ethereum contract definitions into easy to use, compile-time type-safe Go packages
        /bootnode   启动一个仅仅实现网络发现的节点
        /evm        以太坊虚拟机的开发工具， 用来提供一个可配置的，受隔离的代码调试环境
        /faucet     
        /geth       以太坊命令行客户端，最重要的一个工具
        /p2psim     提供了一个工具来模拟http的API
        /puppeth    创建一个新的以太坊网络的向导
        /rlpdump    提供了一个RLP数据的格式化输出
        /swarm      swarm网络的接入点
        /util       提供了一些公共的工具
        /wnode      这是一个简单的Whisper节点。 它可以用作独立的引导节点。此外，可以用于不同的测试和诊断目的。
    common          提供了一些公共的工具类
    compression     Package rle implements the run-length encoding used for Ethereum data.
    consensus       提供了以太坊的一些共识算法，比如ethhash, clique(proof-of-authority)
    console         console类
    contracts   
    core            以太坊的核心数据结构和算法(虚拟机，状态，区块链，布隆过滤器)
    crypto          加密和hash算法，
    eth         实现了以太坊的协议
    ethclient       提供了以太坊的RPC客户端
    ethdb           eth的数据库(包括实际使用的leveldb和供测试使用的内存数据库)
    ethstats        提供网络状态的报告
    event           处理实时的事件
    les         实现了以太坊的轻量级协议子集
    light           实现为以太坊轻量级客户端提供按需检索的功能
    log         提供对人机都友好的日志信息
    metrics         提供磁盘计数器
    miner           提供以太坊的区块创建和挖矿
    mobile          移动端使用的一些warpper
    node            以太坊的多种类型的节点
    p2p         以太坊p2p网络协议
    rlp         以太坊序列化处理
    rpc         远程方法调用
    swarm           swarm网络处理
    tests           测试
    trie            以太坊重要的数据结构Package trie implements Merkle Patricia Tries.
    whisper         提供了whisper节点的协议。
```
## 参考资料
* https://github.com/ethereum/go-ethereum
* https://github.com/TDCQZD/go-ethereum-chinese
* https://www.chaindesk.cn/witbook/8
* https://blog.csdn.net/itcastcpp/article/category/7618299/21?
* [White-Paper] https://github.com/ethereum/wiki/wiki/White-Paper
* [白皮书 | 以太坊 (Ethereum ):下一代智能合约和去中心化应用平台] https://ethfans.org/posts/ethereum-whitepaper
* [Mastering Ethereum] https://github.com/ethereumbook/ethereumbook
* [精通以太坊(中文)] https://github.com/inoutcode/ethereum_book
