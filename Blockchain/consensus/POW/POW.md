# POW
## 简介
区块链的一个关键点就是，一个人必须经过一系列困难的工作，才能将数据放入到区块链中。正是由于这种困难的工作，才保证了区块链的安全和一致。此外，完成这个工作的人，也会获得相应奖励（这也就是通过挖矿获得币）。

在区块链中，是通过网络中的参与者（矿工）不断的工作来支撑起了整个网络。矿工不断地向区块链中加入新块，然后获得相应的奖励。在这种机制的作用下，新生成的区块能够被安全地加入到区块链中，它维护了整个区块链数据库的稳定性。值得注意的是，完成了这个工作的人必须要证明这一点，即他必须要证明他的确完成了这些工作。

整个 “努力工作并进行证明” 的机制，就叫做工作量证明（proof-of-work）。要想完成工作非常地不容易，因为这需要大量的计算能力：即便是高性能计算机，也无法在短时间内快速完成。另外，这个工作的困难度会随着时间不断增长，以保持每 10 分钟出 1 个新块的速度。在比特币中，这个工作就是找到一个块的哈希，同时这个哈希满足了一些必要条件。这个哈希，也就充当了证明的角色。因此，寻求证明（寻找有效哈希），就是矿工实际要做的事情。



## Hashcash
比特币使用 Hashcash ，一个最初用来防止垃圾邮件的工作量证明算法。它可以被分解为以下步骤：

1. 取一些公开的数据（比如，如果是 email 的话，它可以是接收者的邮件地址；在比特币中，它是区块头）
2. 给这个公开数据添加一个计数器。计数器默认从 0 开始
3. 将 data(数据) 和 counter(计数器) 组合到一起，获得一个哈希
4. 检查哈希是否符合一定的条件：
    - 如果符合条件，结束
    - 如果不符合，增加计数器，重复步骤 3-4

因此，这是一个暴力算法：改变计数器，计算新的哈希，检查，增加计数器，计算哈希，检查，如此往复。这也是为什么说它的计算成本很高，因为这一步需要如此反复不断地计算和检查。

在原始的 Hashcash 实现中，它的要求是 “一个哈希的前 20 位必须是 0”。在比特币中，这个要求会随着时间而不断变化。因为按照设计，必须保证每 10 分钟生成一个块，而不论计算能力会随着时间增长，或者是会有越来越多的矿工进入网络，所以需要动态调整这个必要条件。

## POW
Proof-of-Work简称PoW,即为工作量证明

通过计算一个数值，使得拼接上交易数据后内容的值满足规定的上限，在节点成功找到满足的Hash值之后，会马上对全网进行广播打包区块，网络的节点收到广播打包区块，会立刻对其进行验证

网络中只有最快解谜的区块，才会添加到账本中，其他的节点同步，
这样就保证了整个账本的唯一性。

假如节点有任何的作弊行为，都会导致网络的节点验证不通过，直接丢弃
其打包的区块，这个区块就无法记录到总账本中，作弊的节点耗费的成本就白费了，因此在巨大的挖矿成本下，也使得矿工自觉自愿的遵守比特币系统的共识协议，也就确保了整个系统的安全
### 挖矿过程
- PoW挖矿
- 将区块添加到链表中
- 数据持久化存储（levelDB)
- 在广域网中做广播（UDP)