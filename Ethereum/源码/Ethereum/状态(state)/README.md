# 状态 status
账户状态有四个组成部分，不论账户类型是什么，都存在这四个组成部分：
- nonce：如果账户是一个外部拥有账户，nonce代表从此账户地址发送的交易序号。如果账户是一个合约账户，nonce代表此账户创建的合约序号
- balance： 此地址拥有Wei的数量。1Ether=10^18Wei
- storageRoot： Merkle Patricia树的根节点Hash值。Merkle树会将此账户存储内容的Hash值进行编码，默认是空值
- codeHash：此账户EVM代码的hash值。对于合约账户，就是被Hash的代码并作为codeHash保存。对于外部拥有账户，codeHash域是一个空字符串的Hash值
```
type ChainStateReader interface {
	BalanceAt(ctx context.Context, account common.Address, blockNumber *big.Int) (*big.Int, error)
	StorageAt(ctx context.Context, account common.Address, key common.Hash, blockNumber *big.Int) ([]byte, error)
	CodeAt(ctx context.Context, account common.Address, blockNumber *big.Int) ([]byte, error)
	NonceAt(ctx context.Context, account common.Address, blockNumber *big.Int) (uint64, error)
}
```
## 世界状态
以太坊的全局状态就是由账户地址和账户状态的一个映射组成。这个映射被保存在一个叫做Merkle Patricia树的数据结构中。

Merkle Tree（也被叫做Merkle trie）是一种由一系列节点组成的二叉树，这些节点包括：

- 在树底的包含了源数据的大量叶子节点
- 一系列的中间的节点，这些节点是两个子节点的Hash值
- 一个根节点，同样是两个子节点的Hash值，代表着整棵树

区块头保存了三个不同Merkle trie结构的根节点的Hash，包括：

- 状态树
- 交易树
- 收据树
## 
## 