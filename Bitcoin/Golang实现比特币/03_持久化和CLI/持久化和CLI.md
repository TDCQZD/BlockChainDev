# Golang实现比特币——持久化和CLI

到目前为止，我们已经构建了一个有工作量证明机制的区块链。但是它仍然缺少了一些重要的特性，如数据持久化。在本文的内容中，我们会将区块链数据持久化到一个数据库中，然后会提供一个简单的命令行接口\(CLI\)，用来完成一些与区块链的交互操作。

本质上，区块链是一个分布式数据库，不过，我们暂时先忽略 “分布式” 这个部分，仅专注于 “**存储**” 这一点。

## 一、选择数据库

到目前为止，我们的区块链实现里面并没有用到数据库，而是在每次运行程序时，简单地将区块链存储在内存中。那么一旦程序退出，所有的内容就都消失了。我们没有办法再次使用这条链，也没有办法与其他人共享，所以我们需要把它存储到磁盘上。

那么，我们要用哪个数据库呢？实际上，任何一个数据库都可以。在[比特币原始论文](https://bitcoin.org/bitcoin.pdf)中，并没有提到要使用哪一个具体的数据库，它完全取决于开发者如何选择。 [Bitcoin Core](https://github.com/bitcoin/bitcoin)，最初由中本聪发布，现在是比特币的一个参考实现，它使用的是  [LevelDB](https://github.com/google/leveldb)。而我们将要使用的是`BoltDB`。

### 1、 BoltDB

因为它：

1. 非常简洁
2. 用 Go 实现
3. 不需要运行一个服务器
4. 能够允许我们构造想要的数据结构

`BoltDB GitHub`上的[README](https://github.com/boltdb/bolt)是这么说的：

> Bolt 是一个纯键值存储的 Go 数据库，启发自 Howard Chu 的 LMDB. 它旨在为那些无须一个像 Postgres 和 MySQL 这样有着完整数据库服务器的项目，提供一个简单，快速和可靠的数据库。
>
> 由于 Bolt 意在用于提供一些底层功能，简洁便成为其关键所在。它的 API 并不多，并且仅关注值的获取和设置。仅此而已。

听起来跟我们的需求完美契合！来快速入门：

`Bolt`使用键值存储，这意味着它没有像`SQL RDBMS （MySQL，PostgreSQL`等等）的表，没有行和列。相反，数据被存储为键值对（`key-value pair`，就像 Golang 的 map）。键值对被存储在 `bucket`中，这是为了将相似的键值对进行分组（类似 `RDBMS`中的表格）。因此，为了获取一个值，你需要知道一个 bucket 和一个键（`key`）。

需要注意的一个事情是，Bolt 数据库没有数据类型：键和值都是字节数组（byte array）。鉴于需要在里面存储 Go 的结构（准确来说，也就是存储**Block（块）**），我们需要对它们进行序列化，也就说，实现一个从 Go struct 转换到一个 byte array 的机制，同时还可以从一个 byte array 再转换回 Go struct。虽然我们将会使用  [encoding/gob](https://golang.org/pkg/encoding/gob/)  来完成这一目标，但实际上也可以选择使用`JSON,XML,Protocol Buffers`等等。之所以选择使用`encoding/gob`, 是因为它很简单，而且是 Go 标准库的一部分。

注意：虽然 `BoltDB`的作者出于个人原因已经不在对其维护（见[README](https://github.com/boltdb/bolt/commit/fa5367d20c994db73282594be0146ab221657943)）, 不过关系不大，它已经足够稳定了，况且也有活跃的 fork:[coreos/bblot](https://github.com/coreos/bbolt)。

### 2、 数据库结构

在开始实现持久化的逻辑之前，我们首先需要决定到底要如何在数据库中进行存储。为此，我们可以参考 Bitcoin Core 的做法：

简单来说，Bitcoin Core 使用两个 “bucket” 来存储数据：

* 其中一个 `bucket `是 `blocks`，它存储了描述一条链中所有块的元数据

* 另一个 `bucket `是 `chainstate`，存储了一条链的状态，也就是当前所有的未花费的交易输出和一些元数据

此外，出于性能的考虑，Bitcoin Core 将每个区块（`block`）存储为磁盘上的不同文件。如此一来，就不需要仅仅为了读取一个单一的块而将所有（或者部分）的块都加载到内存中。但是，为了简单起见，我们并不会实现这一点。

在 `blocks `中，`key -> value `为：

| key | value |
| :--- | :--- |
| `b`+ 32 字节的 block hash | block index record |
| `f`+ 4 字节的 file number | file information record |
| `l`+ 4 字节的 file number | the last block file number used |
| `R`+ 1 字节的 boolean | 是否正在 reindex |
| `F`+ 1 字节的 flag name length + flag name string | 1 byte boolean: various flags that can be on or off |
| `t`+ 32 字节的 transaction hash | transaction index record |

在 `chainstate`，`key -> value `为：

| key | value |
| :--- | :--- |
| `c`+ 32 字节的 transaction hash | unspent transaction output record for that transaction |
| `B` | 32 字节的 block hash: the block hash up to which the database represents the unspent transaction outputs |

详情可见 [这里](https://en.bitcoin.it/wiki/Bitcoin_Core_0.11_%28ch_2%29:_Data_Storage)。

因为目前还没有交易，所以我们只需要` blocks bucket`。另外，正如上面提到的，我们会将整个数据库存储为单个文件，而不是将区块存储在不同的文件中。所以，我们也不会需要文件编号（`file number`）相关的东西。最终，我们会用到的键值对有：

1. 32 字节的` block-hash -> block `结构
2. `l` -&gt; 链中最后一个块的 `hash`

这就是实现持久化机制所有需要了解的内容了。

## 二、代码实现持久化

### 1、 区块序列化

在 `BoltDB `中，值只能是 `[]byte `类型，但是我们想要存储 `Block `结构。所以，我们需要使用 [encoding/gob](https://golang.org/pkg/encoding/gob/) 来对这些结构进行序列化。

实现 `Block `的 `Serialize `方法：

```
func (block *Block) SerializeBlock() []byte {
    var result bytes.Buffer
    encoder := gob.NewEncoder(&result)
    err := encoder.Encode(block)
    if err != nil {
        log.Panic(err)
    }

    return result.Bytes()
}
```

首先，我们定义一个 `buffer `存储序列化之后的数据。

然后，我们初始化一个` gob encoder `并对 `block `进行编码，结果作为一个字节数组返回。

同时我们还需要一个反序列化的函数获取区块数据，它会接受一个字节数组作为输入，并返回一个 `Block`.

注意它不是一个方法（`method`），而是一个单独的函数（`function`）：

```
func DeserializeBlock(data []byte) *Block {
    var block Block
    decoder := gob.NewDecoder(bytes.NewReader(data))
    err := decoder.Decode(&block)
    if err != nil {
        log.Panic(err)
    }

    return &block
}
```

### 2、持久化

之前`NewBlockchain`函数逻辑是创建一个新的 `Blockchain `实例，并向其中加入创世块。区块链数据持久化时需要修改`NewBlockchain`逻辑。

1. 打开一个数据库文件
2. 检查文件里面是否已经存储了一个区块链
3. 如果已经存储了一个区块链：
   1. 创建一个新的`Blockchain`实例
   2. 设置`Blockchain`实例的 tip 为数据库中存储的最后一个块的哈希
4. 如果没有区块链：
   1. 创建创世块
   2. 存储到数据库
   3. 将创世块哈希保存为最后一个块的哈希
   4. 创建一个新的`Blockchain`实例，初始时 `tip `指向创世块（`tip `有尾部，尖端的意思，在这里 `tip `存储的是最后一个块的哈希）.

**2.1 Blockchain结构体**

从现在开始，我们会将区块存储在数据库里面，而不是像之前把区块存放在数组中那么简单。

首先修改区块链`Blockchain`结构体：

```
type Blockchain struct {
    tip []byte
    db  *bolt.DB
}
```

现在，我们不在`Blockchain`结构体里面存储所有的区块了，而是仅存储区块链的 `tip`，表示数据库中存储的最后一个块的哈希。

另外，我们需要存储一个数据库连接。因为我们想要一旦打开它的话，就让它一直运行，直到程序运行结束。

**2.2 创建带创世区块的区块链并返回**

```
func NewBlockchain() *Blockchain {
    var tip []byte
    db, err := bolt.Open(dbFile, 0600, nil)

    err = db.Update(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))

        if b == nil {
            genesis := NewGenesisBlock()
            b, err := tx.CreateBucket([]byte(blocksBucket))
            err = b.Put(genesis.Hash, genesis.Serialize())
            err = b.Put([]byte("l"), genesis.Hash)
            tip = genesis.Hash
        } else {
            tip = b.Get([]byte("l"))
        }

        return nil
    })

    bc := Blockchain{tip, db}

    return &bc
}
```

代码详解如下：

```
db, err := bolt.Open(dbFile, 0600, nil)
```

这是打开一个 `BoltDB `文件的标准做法。注意，即使不存在这样的文件，它也不会返回错误。

```
err = db.Update(func(tx *bolt.Tx) error {
...
})
```

在 BoltDB 中，数据库操作通过一个事务（`transaction`）进行操作。有两种类型的事务：只读（`read-only`）和读写（`read-write`）。这里，打开的是一个读写事务（`db.Update(...)`），因为我们可能会向数据库中添加创世块。

```
b := tx.Bucket([]byte(blocksBucket))

if b == nil {
    genesis := NewGenesisBlock()
    b, err := tx.CreateBucket([]byte(blocksBucket))
    err = b.Put(genesis.Hash, genesis.Serialize())
    err = b.Put([]byte("l"), genesis.Hash)
    tip = genesis.Hash
} else {
    tip = b.Get([]byte("l"))
}
```

这里是函数的核心:添加创世区块。在这里，我们先获取了存储区块的 `bucket`：如果存在，就从中读取 `l`键；如果不存在，就生成创世块，创建 `bucket`，并将区块保存到里面，然后更新 l 键以存储链中最后一个块的哈希。

最后创建区块链并返回：

```
bc := Blockchain{tip, db}
return bc
```

**2.3 区块链添加新区块**

```
func (bc *Blockchain) MineBlock(data string) {
    var lastHash []byte

    err := bc.db.View(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))
        lastHash = b.Get([]byte("l"))

        return nil
    })

    newBlock := NewBlock(data, lastHash)

    err = bc.db.Update(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))
        err := b.Put(newBlock.Hash, newBlock.Serialize())
        err = b.Put([]byte("l"), newBlock.Hash)
        bc.tip = newBlock.Hash

        return nil
    })
}
```

代码详解如下：

```
err := bc.db.View(func(tx *bolt.Tx) error {
    b := tx.Bucket([]byte(blocksBucket))
    lastHash = b.Get([]byte("l"))

    return nil
})
```

这是 `BoltDB `事务的另一个类型（只读）。在这里，我们会从数据库中获取最后一个块的哈希，然后用它来挖出一个新的块的哈希：

```
newBlock := NewBlock(data, lastHash)
b := tx.Bucket([]byte(blocksBucket))
err := b.Put(newBlock.Hash, newBlock.Serialize())
err = b.Put([]byte("l"), newBlock.Hash)
bc.tip = newBlock.Hash
```

### 3、遍历区块链

现在，产生的所有块都会被保存到一个数据库里面，所以我们可以重新打开一个链，然后向里面加入新块。那如何像之前那样打印出区块链中区块信息？

**3.1 区块链迭代器（**`BlockchainIterator`**）**

`BoltDB `允许对一个 `bucket `里面的所有 `key `进行迭代，但是所有的 `key `都以字节序进行存储，而且我们想要以区块能够进入区块链中的顺序进行打印。此外，因为我们不想将所有的块都加载到内存中（因为我们的区块链数据库可能很大！或者现在可以假装它可能很大），我们将会一个一个地读取它们。故而，我们需要一个区块链迭代器（`BlockchainIterator`）：

```
type BlockchainIterator struct {
    currentHash []byte
    db          *bolt.DB
}
```

每当要对链中的块进行迭代时，我们就会创建一个迭代器，里面存储了当前迭代的块哈希（`currentHash`）和数据库的连接（`db`）。通过 `db`，迭代器逻辑上被附属到一个区块链上（这里的区块链指的是存储了一个数据库连接的 `Blockchain `实例），并且通过 `Blockchain `方法进行创建：

```
func (bc *Blockchain) Iterator() *BlockchainIterator {
    bci := &BlockchainIterator{bc.tip, bc.db}

    return bci
}
```

注意，迭代器的初始状态为链中的 tip，因此区块将从尾到头（创世块为头），也就是从最新的到最旧的进行获取。实际上，选择一个 tip 就是意味着给一条链“投票”。一条链可能有多个分支，最长的那条链会被认为是主分支。在获得一个 `tip `（可以是链中的任意一个块）之后，我们就可以重新构造整条链，找到它的长度和需要构建它的工作。这同样也意味着，一个 `tip `也就是区块链的一种标识符。

**3.2  获取区块信息**

`BlockchainIterator `只有一个方法：返回链中的下一个块。

```
func (i *BlockchainIterator) Next() *Block {
    var block *Block

    err := i.db.View(func(tx *bolt.Tx) error {
        b := tx.Bucket([]byte(blocksBucket))
        encodedBlock := b.Get(i.currentHash)
        block = DeserializeBlock(encodedBlock)

        return nil
    })

    i.currentHash = block.PrevBlockHash

    return block
}
```

到此，区块链数据持久化完成。

## 三、代码实现**CLI**

到目前为止，我们只是在 `main `函数中简单执行了 `NewBlockchain 和 bc.MineBlock`。并没有提供一个与程序交互的接口。

### 1、CLI结构

所有命令行相关的操作都会通过 CLI 结构进行处理：

```
type CLI struct {
    bc *Blockchain
}
```

### 2、“入口” 函数 \(Run 函数\)解析命令行参数和处理命令

我们会使用标准库里面的[flag](https://golang.org/pkg/flag/)包来解析命令行参数：

```
func (cli *CLI) Run() {
    cli.validateArgs()

    addBlockCmd := flag.NewFlagSet("addblock", flag.ExitOnError)
    printChainCmd := flag.NewFlagSet("printchain", flag.ExitOnError)

    addBlockData := addBlockCmd.String("data", "", "Block data")

    switch os.Args[1] {
    case "addblock":
        err := addBlockCmd.Parse(os.Args[2:])
    case "printchain":
        err := printChainCmd.Parse(os.Args[2:])
    default:
        cli.printUsage()
        os.Exit(1)
    }

    if addBlockCmd.Parsed() {
        if *addBlockData == "" {
            addBlockCmd.Usage()
            os.Exit(1)
        }
        cli.addBlock(*addBlockData)
    }

    if printChainCmd.Parsed() {
        cli.printChain()
    }
}
```

代码详解：

```
func (cli *CLI) validateArgs() {
    if len(os.Args) < 2 {
        cli.printUsage()
        os.Exit(1)
    }
}
```

首先效验命令行参数

```
addBlockCmd := flag.NewFlagSet("addblock", flag.ExitOnError)
printChainCmd := flag.NewFlagSet("printchain", flag.ExitOnError)
addBlockData := addBlockCmd.String("data", "", "Block data")
```

然后我们创建两个子命令: `addblock `和 `printchain`, 然后给 `addblock `添加 `-data` 标志。`printchain `没有任何标志。

```
switch os.Args[1] {
case "addblock":
    err := addBlockCmd.Parse(os.Args[2:])
case "printchain":
    err := printChainCmd.Parse(os.Args[2:])
default:
    cli.printUsage()
    os.Exit(1)
}
```

再然后，我们检查用户提供的命令，解析相关的 `flag `子命令：

```
if addBlockCmd.Parsed() {
    if *addBlockData == "" {
        addBlockCmd.Usage()
        os.Exit(1)
    }
    cli.addBlock(*addBlockData)
}

if printChainCmd.Parsed() {
    cli.printChain()
}
```

最后检查解析是哪一个子命令，并调用相关函数：

```
func (cli *CLI) addBlock(data string) {
    cli.bc.MineBlock(data)
    fmt.Println("Success!")
}

func (cli *CLI) printChain() {
    bci := cli.bc.Iterator()

    for {
        block := bci.Next()

        fmt.Printf("Prev. hash: %x\n", block.PrevBlockHash)
        fmt.Printf("Data: %s\n", block.Data)
        fmt.Printf("Hash: %x\n", block.Hash)
        pow := NewProofOfWork(block)
        fmt.Printf("PoW: %s\n", strconv.FormatBool(pow.Validate()))
        fmt.Println()

        if len(block.PrevBlockHash) == 0 {
            break
        }
    }
}
```

这部分内容跟之前的很像，唯一的区别是我们现在使用的是 `BlockchainIterator`对区块链中的区块进行迭代。

### 3、测试

修改程序入口函数main:

```
func main() {
    bc := NewBlockchain()
    defer bc.db.Close()

    cli := CLI{bc}
    cli.Run()
}
```

注意，此处无论提供什么命令行参数，都会创建一个新的链。注意与后面文章的区别。

测试结果如下：

```
$main.exe
Usage:
  addblock -data BLOCK_DATA - add a block to the blockchain
  printchain - print all the blocks of the blockchain


$main.exe printchain
No existing blockchain found. Creating a new one...
Mining the block containing "Genesis Block"
000b1c6072d8402a7bdf7807c16659c2760e0643144ae5bc463646468d1548a3

PrevBlock.Hash:
Data: Genesis Block
Hash: 000b1c6072d8402a7bdf7807c16659c2760e0643144ae5bc463646468d1548a3
PoW: true


$main.exe addblock -data "Send 1 BTC to Ivan"
Mining the block containing "Send 1 BTC to Ivan"
00067864a2946ba26b3c598545dabdbe714b94723af2810f151658a68121a1b4

AddBlock Success!

$main.exe addblock -data "Send 3 BTC to Ivan"
Mining the block containing "Send 3 BTC to Ivan"
000623ce61473fbb3d090566f5ce74c6ea78ce036917548f39385facb3c4e843

AddBlock Success!

$main.exe printchain
PrevBlock.Hash:00067864a2946ba26b3c598545dabdbe714b94723af2810f151658a68121a1b4
Data: send 3 BTC to Ivan
Hash: 000623ce61473fbb3d090566f5ce74c6ea78ce036917548f39385facb3c4e843
PoW: true

PrevBlock.Hash:000b1c6072d8402a7bdf7807c16659c2760e0643144ae5bc463646468d1548a3
Data: send 1 BTC to Ivan
Hash: 00067864a2946ba26b3c598545dabdbe714b94723af2810f151658a68121a1b4
PoW: true

PrevBlock.Hash:
Data: Genesis Block
Hash: 000b1c6072d8402a7bdf7807c16659c2760e0643144ae5bc463646468d1548a3
PoW: true
```

## 四、总结

通过本文的学习，我们实现了区块链数据的持久化，并实现通过命令行接口，完成一些与区块链的交互操作。只要再实现交易、钱包和P2P网络,简易版的区块链就完整了。我们会在接下来的文章中陆续实现未完成的功能。

## 参考：

\[1\][Full source codes](https://github.com/Jeiwan/blockchain_go/tree/part_3)

\[2\][Bitcoin Core Data Storage](https://en.bitcoin.it/wiki/Bitcoin_Core_0.11_%28ch_2%29:_Data_Storage)

\[3\][boltdb](https://github.com/boltdb/bolt)

\[4\][encoding/gob](https://golang.org/pkg/encoding/gob/)

\[5\][flag](https://golang.org/pkg/flag/)

\[6\][part\_3](https://github.com/Jeiwan/blockchain_go/tree/part_3)

\[7\][Building Blockchain in Go. Part 3: Persistence and CLI](https://jeiwan.cc/posts/building-blockchain-in-go-part-3/)

## 



