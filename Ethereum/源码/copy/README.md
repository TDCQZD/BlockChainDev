# 源码解析
## 以太坊系统主要组成部分：
- 账户(accounts)
- 状态(state)
- Gas和费用(gas and fees)
- 交易(transactions)
- 区块(blocks)
- 交易执行(transaction execution)
- 挖矿(mining)
- 工作量证明(proof of work)
## 源码目录
```
├─accounts                      实现了一个高等级的以太坊账户管理
│  ├─abi
│  │  └─bind
│  │      └─backends
│  ├─external
│  ├─keystore
│  │  └─testdata
│  │      ├─dupes
│  │      ├─keystore
│  │      │  └─foo
│  │      └─v1
│  │          └─cb61d5a9c4896fb9658090b597ef0e7be6f7b67e
│  ├─scwallet
│  └─usbwallet
│      └─trezor
├─build                     主要是编译和构建的一些脚本和配置
│  └─deb
│      ├─ethereum
│      └─ethereum-swarm
├─cmd
│  ├─abigen                 源代码生成器将以太坊合约定义转换为易于使用，编译时类型安全的Go包
│  ├─bootnode               启动一个仅仅实现网络发现的节点
│  ├─clef
│  │  ├─docs
│  │  │  └─qubes
│  │  └─tests
│  ├─ethkey
│  ├─evm                    以太坊虚拟机的开发工具， 用来提供一个可配置的，受隔离的代码调试环境
│  │  └─internal
│  │      └─compiler
│  ├─faucet
│  ├─geth                   以太坊命令行客户端，最重要的一个工具
│  │  └─testdata
│  ├─p2psim                 提供了一个工具来模拟http的API
│  ├─puppeth                创建一个新的以太坊网络的向导
│  │  └─testdata
│  ├─rlpdump                提供了一个RLP数据的格式化输出
│  ├─swarm                  swarm网络的接入点
│  │  ├─global-store
│  │  ├─mimegen
│  │  ├─swarm-smoke
│  │  └─swarm-snapshot
│  ├─utils                  提供了一些公共的工具
│  └─wnode                  这是一个简单的Whisper节点。 它可以用作独立的引导节点。此外，可以用于不同的测试和诊断目的。
├─common                    提供了一些公共的工具类
│  ├─bitutil
│  ├─compiler
│  ├─fdlimit
│  ├─hexutil
│  ├─math
│  ├─mclock
│  └─prque
├─consensus                 提供了以太坊的一些共识算法，比如ethhash, clique(proof-of-authority)
│  ├─clique
│  ├─ethash
│  └─misc
├─console
│  └─testdata
├─contracts
│  ├─chequebook
│  │  └─contract
│  └─ens
│      ├─contract
│      └─fallback_contract
├─core                      以太坊的核心数据结构和算法(虚拟机，状态，区块链，布隆过滤器)
│  ├─asm
│  ├─bloombits
│  ├─rawdb
│  ├─state
│  ├─types
│  └─vm
│      ├─runtime
│      └─testdata
├─crypto                   加密和hash算法，
│  ├─bn256
│  │  ├─cloudflare
│  │  └─google
│  ├─ecies
│  └─secp256k1
│      └─libsecp256k1
│          ├─build-aux
│          │  └─m4
│          ├─contrib
│          ├─include
│          ├─obj
│          ├─sage
│          └─src
│              ├─asm
│              ├─java
│              │  └─org
│              │      └─bitcoin
│              └─modules
│                  ├─ecdh
│                  └─recovery
├─dashboard
│  └─assets
│      ├─components
│      └─types
├─docs
│  └─audits
├─eth                           实现了以太坊的协议
│  ├─downloader
│  ├─fetcher
│  ├─filters
│  ├─gasprice
│  └─tracers
│      ├─internal
│      │  └─tracers
│      └─testdata
├─ethclient                     提供了以太坊的RPC客户端
├─ethdb                         eth的数据库(包括实际使用的leveldb和供测试使用的内存数据库)
│  ├─leveldb
│  └─memorydb
├─ethstats                      提供网络状态的报告
├─event                         处理实时的事件
├─graphql
├─internal
│  ├─build
│  ├─cmdtest
│  ├─debug
│  ├─ethapi
│  ├─guide
│  ├─jsre
│  │  └─deps
│  └─web3ext
├─les                           实现了以太坊的轻量级协议子集
│  └─flowcontrol
├─light                         实现为以太坊轻量级客户端提供按需检索的功能
├─log                           提供对人机都友好的日志信息
├─metrics                       提供磁盘计数器
│  ├─exp
│  ├─influxdb
│  ├─librato
│  └─prometheus
├─miner                         提供以太坊的区块创建和挖矿
├─mobile                        移动端使用的一些warpper
├─node                          以太坊的多种类型的节点
├─p2p                           以太坊p2p网络协议
│  ├─discover
│  ├─discv5
│  ├─enode
│  ├─enr
│  ├─nat
│  ├─netutil
│  ├─protocols
│  ├─simulations
│  │  ├─adapters
│  │  ├─examples
│  │  └─pipes
│  └─testing
├─params
├─rlp                           以太坊序列化处理
├─rpc                           远程方法调用
│  └─testdata
├─signer
│  ├─core
│  ├─fourbyte
│  ├─rules
│  │  └─deps
│  └─storage
├─swarm                         swarm网络处理
│  ├─api
│  │  ├─client
│  │  ├─http
│  │  └─testdata
│  │      └─test0
│  │          └─img
│  ├─bmt
│  ├─chunk
│  ├─dev
│  │  └─scripts
│  ├─docker
│  ├─fuse
│  ├─log
│  ├─metrics
│  ├─network
│  │  ├─bitvector
│  │  ├─priorityqueue
│  │  ├─simulation
│  │  ├─simulations
│  │  │  └─discovery
│  │  └─stream
│  │      ├─intervals
│  │      └─testing
│  ├─pot
│  ├─pss
│  │  ├─client
│  │  ├─notify
│  │  └─testdata
│  ├─sctx
│  ├─services
│  │  └─swap
│  │      └─swap
│  ├─shed
│  ├─spancontext
│  ├─state
│  ├─storage
│  │  ├─encryption
│  │  ├─feed
│  │  │  └─lookup
│  │  ├─localstore
│  │  └─mock
│  │      ├─db
│  │      ├─explorer
│  │      ├─mem
│  │      ├─rpc
│  │      └─test
│  ├─swap
│  ├─testutil
│  ├─tracing
│  └─version
├─tests
│  └─testdata
├─trie                          以太坊重要的数据结构MPT
├─vendor
│  ├─bazil.org
│  │  └─fuse
│  │      ├─fs
│  │      └─fuseutil
│  ├─github.com
│  │  ├─allegro
│  │  │  └─bigcache
│  │  │      └─queue
│  │  ├─apilayer
│  │  │  └─freegeoip
│  │  ├─aristanetworks
│  │  │  └─goarista
│  │  │      └─monotime
│  │  ├─Azure
│  │  │  ├─azure-pipeline-go
│  │  │  │  └─pipeline
│  │  │  ├─azure-sdk-for-go
│  │  │  └─azure-storage-blob-go
│  │  │      └─2018-03-28
│  │  │          └─azblob
│  │  ├─btcsuite
│  │  │  └─btcd
│  │  │      └─btcec
│  │  ├─cespare
│  │  │  └─cp
│  │  ├─codahale
│  │  │  └─hdrhistogram
│  │  ├─davecgh
│  │  │  └─go-spew
│  │  │      └─spew
│  │  ├─deckarep
│  │  │  └─golang-set
│  │  ├─docker
│  │  │  └─docker
│  │  │      └─pkg
│  │  │          └─reexec
│  │  ├─edsrzf
│  │  │  └─mmap-go
│  │  ├─elastic
│  │  │  └─gosigar
│  │  │      └─sys
│  │  │          └─windows
│  │  ├─ethereum
│  │  │  └─ethash
│  │  │      └─src
│  │  │          └─libethash
│  │  ├─fatih
│  │  │  └─color
│  │  ├─fjl
│  │  │  └─memsize
│  │  │      └─memsizeui
│  │  ├─gballet
│  │  │  └─go-libpcsclite
│  │  ├─go-ole
│  │  │  └─go-ole
│  │  │      └─oleutil
│  │  ├─go-stack
│  │  │  └─stack
│  │  ├─golang
│  │  │  ├─protobuf
│  │  │  │  ├─proto
│  │  │  │  └─protoc-gen-go
│  │  │  │      └─descriptor
│  │  │  └─snappy
│  │  ├─graph-gophers
│  │  │  └─graphql-go
│  │  │      ├─errors
│  │  │      ├─internal
│  │  │      │  ├─common
│  │  │      │  ├─exec
│  │  │      │  │  ├─packer
│  │  │      │  │  ├─resolvable
│  │  │      │  │  └─selected
│  │  │      │  ├─query
│  │  │      │  ├─schema
│  │  │      │  └─validation
│  │  │      ├─introspection
│  │  │      ├─log
│  │  │      ├─relay
│  │  │      └─trace
│  │  ├─hashicorp
│  │  │  └─golang-lru
│  │  │      └─simplelru
│  │  ├─howeyc
│  │  │  └─fsnotify
│  │  ├─huin
│  │  │  └─goupnp
│  │  │      ├─dcps
│  │  │      │  ├─internetgateway1
│  │  │      │  └─internetgateway2
│  │  │      ├─httpu
│  │  │      ├─scpd
│  │  │      ├─soap
│  │  │      └─ssdp
│  │  ├─influxdata
│  │  │  └─influxdb
│  │  │      ├─client
│  │  │      ├─models
│  │  │      └─pkg
│  │  │          └─escape
│  │  ├─jackpal
│  │  │  └─go-nat-pmp
│  │  ├─julienschmidt
│  │  │  └─httprouter
│  │  ├─karalabe
│  │  │  └─hid
│  │  │      ├─hidapi
│  │  │      │  ├─hidapi
│  │  │      │  ├─libusb
│  │  │      │  ├─mac
│  │  │      │  └─windows
│  │  │      └─libusb
│  │  │          └─libusb
│  │  │              └─os
│  │  ├─mattn
│  │  │  ├─go-colorable
│  │  │  ├─go-isatty
│  │  │  └─go-runewidth
│  │  ├─mohae
│  │  │  └─deepcopy
│  │  ├─naoina
│  │  │  ├─go-stringutil
│  │  │  └─toml
│  │  │      └─ast
│  │  ├─olekukonko
│  │  │  └─tablewriter
│  │  ├─opentracing
│  │  │  └─opentracing-go
│  │  │      ├─ext
│  │  │      └─log
│  │  ├─oschwald
│  │  │  └─maxminddb-golang
│  │  ├─pborman
│  │  │  └─uuid
│  │  ├─peterh
│  │  │  └─liner
│  │  ├─pkg
│  │  │  └─errors
│  │  ├─pmezard
│  │  │  └─go-difflib
│  │  │      └─difflib
│  │  ├─prometheus
│  │  │  └─tsdb
│  │  │      └─fileutil
│  │  ├─rjeczalik
│  │  │  └─notify
│  │  ├─robertkrimen
│  │  │  └─otto
│  │  │      ├─ast
│  │  │      ├─dbg
│  │  │      ├─file
│  │  │      ├─parser
│  │  │      ├─registry
│  │  │      └─token
│  │  ├─rs
│  │  │  ├─cors
│  │  │  └─xhandler
│  │  ├─StackExchange
│  │  │  └─wmi
│  │  ├─status-im
│  │  │  └─keycard-go
│  │  │      └─derivationpath
│  │  ├─stretchr
│  │  │  └─testify
│  │  │      ├─assert
│  │  │      └─require
│  │  ├─syndtr
│  │  │  └─goleveldb
│  │  │      └─leveldb
│  │  │          ├─cache
│  │  │          ├─comparer
│  │  │          ├─errors
│  │  │          ├─filter
│  │  │          ├─iterator
│  │  │          ├─journal
│  │  │          ├─memdb
│  │  │          ├─opt
│  │  │          ├─storage
│  │  │          ├─table
│  │  │          └─util
│  │  ├─tyler-smith
│  │  │  └─go-bip39
│  │  │      └─wordlists
│  │  ├─uber
│  │  │  ├─jaeger-client-go
│  │  │  │  ├─config
│  │  │  │  ├─internal
│  │  │  │  │  ├─baggage
│  │  │  │  │  │  └─remote
│  │  │  │  │  ├─spanlog
│  │  │  │  │  └─throttler
│  │  │  │  │      └─remote
│  │  │  │  ├─log
│  │  │  │  ├─rpcmetrics
│  │  │  │  ├─thrift
│  │  │  │  ├─thrift-gen
│  │  │  │  │  ├─agent
│  │  │  │  │  ├─baggage
│  │  │  │  │  ├─jaeger
│  │  │  │  │  ├─sampling
│  │  │  │  │  └─zipkincore
│  │  │  │  └─utils
│  │  │  └─jaeger-lib
│  │  │      └─metrics
│  │  └─wsddn
│  │      └─go-ecdh
│  ├─golang.org
│  │  └─x
│  │      ├─crypto
│  │      │  ├─cast5
│  │      │  ├─curve25519
│  │      │  ├─ed25519
│  │      │  │  └─internal
│  │      │  │      └─edwards25519
│  │      │  ├─internal
│  │      │  │  ├─chacha20
│  │      │  │  └─subtle
│  │      │  ├─openpgp
│  │      │  │  ├─armor
│  │      │  │  ├─elgamal
│  │      │  │  ├─errors
│  │      │  │  ├─packet
│  │      │  │  └─s2k
│  │      │  ├─pbkdf2
│  │      │  ├─poly1305
│  │      │  ├─ripemd160
│  │      │  ├─scrypt
│  │      │  ├─sha3
│  │      │  └─ssh
│  │      │      └─terminal
│  │      ├─net
│  │      │  ├─context
│  │      │  ├─html
│  │      │  │  ├─atom
│  │      │  │  └─charset
│  │      │  └─websocket
│  │      ├─sync
│  │      │  └─syncmap
│  │      ├─sys
│  │      │  ├─cpu
│  │      │  ├─unix
│  │      │  └─windows
│  │      └─text
│  │          ├─encoding
│  │          │  ├─charmap
│  │          │  ├─htmlindex
│  │          │  ├─internal
│  │          │  │  └─identifier
│  │          │  ├─japanese
│  │          │  ├─korean
│  │          │  ├─simplifiedchinese
│  │          │  ├─traditionalchinese
│  │          │  └─unicode
│  │          ├─internal
│  │          │  ├─language
│  │          │  │  └─compact
│  │          │  ├─tag
│  │          │  └─utf8internal
│  │          ├─language
│  │          ├─runes
│  │          ├─transform
│  │          └─unicode
│  │              └─norm
│  └─gopkg.in
│      ├─check.v1
│      ├─natefinch
│      │  └─npipe.v2
│      ├─olebedev
│      │  └─go-duktape.v3
│      ├─sourcemap.v1
│      │  └─base64vlq
│      └─urfave
│          └─cli.v1
└─whisper                                       提供了whisper节点的协议。
    ├─mailserver
    ├─shhclient
    └─whisperv6
```
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


## 参考资料
* https://github.com/ethereum/go-ethereum
* https://github.com/TDCQZD/go-ethereum-chinese
* https://www.chaindesk.cn/witbook/8
* https://blog.csdn.net/itcastcpp/article/category/7618299/21?
* [White-Paper] https://github.com/ethereum/wiki/wiki/White-Paper
* [白皮书 | 以太坊 (Ethereum ):下一代智能合约和去中心化应用平台] https://ethfans.org/posts/ethereum-whitepaper
* [Mastering Ethereum] https://github.com/ethereumbook/ethereumbook
* [精通以太坊(中文)] https://github.com/inoutcode/ethereum_book
