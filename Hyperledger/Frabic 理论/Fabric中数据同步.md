# Fabric中数据同步的实现
Hyperledger Fabric 是一个由N个节点组成的分布式网络，且 HyperLedger Fabric 通过把网络内的节点分解为执行交易（背书和提交）节点和交易排序节点，利用这些分解后的节点来优化区块链网络性能及安全性和可扩展性。但是分解之后网络需要一个安全、可靠、可扩展的数据分发协议来保证数据的完整性和一致性。为了满足这些要求，Hyperledger Fabric 中使用了 Gossip 数据分发协议。
## Hyperledger Fabric中的Gossip
Fabric 中 的各个 Peer 节点之间利用 Gossip 协议来完成区块广播以及状态同步的过程。Gossip 消息是连续的，通道上的每个 Peer 节点都不断地接收来自多个节点已完成一致性的区块数据。每条传输的 Gossip 消息都有相应的签名，从而由拜占庭参与者发送的伪造消息很容易地识别来，并且可以防止将消息分发给不在同一通道中的其它节点。受到延迟、网络分区或其他导致区块丢失的原因影响的节点，最终将通过联系已经拥有这些缺失区块的节点，与当前账本状态进行同步。

在 Hyperledger Fabric 网络中基于 Gossip 的数据传播协议在 Fabric 网络上执行三个主要功能：

1. 通过不断识别可用的成员节点并最终监测节点离线状态的方式，对节点的发现和通道中的成员进行管理。
2. 将分类帐本数据传播到通道上的所有节点。任何节点中如有缺失区块都可以通过从通道中其它节点复制正确的数据来标识缺失的区块并同步自身。
3. 在通道上的所有节点上同步分类帐状态。通过允许点对点状态传输更新账本数据，保证新连接的节点以最快的速度实现数据同步。
基于 gossip 的广播由节点接收来自通道内其他节点的消息，然后将这些消息转发给随机选择的且在同一通道内的若干个邻居节点，这种循环不断重复，使通道中所有的成员节点的账本和状态信息不断保持与当前的最新状态同步。对于新区块的传播，通道上的 Leader Peer 节点从 Ordering 服务中提取数据，并向随机选择的邻居节点发起 Gossip 传播。

> 随机选择的邻居节点数量可以通过配置文件进行配置声明。节点也可以使用拉取机制，而不是等待消息的传递。

![](./imgs/gossip.png)

正如上图所示，客户端应用程序将交易提案请求提交给背书节点（Endorse Peer），背书节点处理并背书签名后返回响应，然后提交给 Ordering 服务进行排序，排序服务达成共识后生成区块，通过 deliver（）广播给各个组织中通过选举方式选择的作为代表能够连接到排序服务的 Leader Peer 节点，Leader Peer 节点随机选择N个节点将接收到的区块进行分发。另外，为了保持数据同步，每个节点会在后台周期性地与其它随机的N个节点的数据进行比较，以保持区块数据状态的同步。

### Leader节点选举
在 Hyperledger Fabric 网络中，每一个组织都会通过领导选举机制选择一个节点（Leader Peer），该节点将保持与 Ordering 服务的连接，并在其所在组织的节点之间分发从 Ordering 服务节点接收到的新区块。利用领导人选举为系统提供了有效利用 Ordering 服务带宽的能力。在 Hyperledger Fabric 中实现领导人选举有两种方式：

- 静态选举：由系统管理员手动配置实现，指定组织中的一个 peer 节点作为领导节点代表组织与 Ordering 服务建立连接。
- 动态选举：通过执行领导人选举程序，动态从组织中选择一个 peer 节点成为领导者节点，从Ordering 服务中拉出区块，并将块分发给组织中的其他 peer 节点。

**静态选举**

使用静态领导选举可以通过在配置文件中指定相关的参数来实现。可以定义一个节点为 Leader Peer，也可定义多个节点或组织内所有节点都为 Leader Peer。

实现静态选举机制，需要在 core.yaml 中配置以下参数:
```
peer:
    gossip:
        useLeaderElection: false    # 是否指定使用选举方式产式Leader
        orgLeader: true    # 是否指定当前节点为Leader
```
或者可以使用环境变量来配置和覆盖相应的参数：
```
export CORE_PEER_GOSSIP_USELEADERELECTION=false
export CORE_PEER_GOSSIP_ORGLEADER=true
```
注意，如果两个值全部都指定为 false， 那么代表 peer 节点不会成为领导者。

**动态选举**

动态领导选举可以在各个组织内各自动态选举一个 Leader 节点，它将代表各个连接到 Ordering 服务并拉出新的区块。

当选的 Leader 节点必须向组织内的其他节点定期发送心跳信息，作为处于活跃的证据。如果一名或多名节点在指定的一段时间内得不到最新消息，网络将启动新一轮领导人选举程序，最终选出新的 Leader 节点。

启用动态选举机制，需要在 core.yaml 中配置以下参数:
```
peer:
    gossip:
        useLeaderElection: true     # 是否指定使用选举方式产式Leader
        orgLeader: false    # 是否指定当前节点为Leader
```
或者，可以使用环境变量来配置和覆盖相应参数：
```
export CORE_PEER_GOSSIP_USELEADERELECTION=true
export CORE_PEER_GOSSIP_ORGLEADER=false
```
core.yaml 以下配置内容指定了动态选举 Leader 的相关信息：
```
peer:
    gossip:
         election:   # 选举Leader配置     
            startupGracePeriod: 15s       # 最长等待时间 
            membershipSampleInterval: 1s  # 检查稳定性的间隔时间     
            leaderAliveThreshold: 10s     # 进行选举的间隔时间
            leaderElectionDuration: 5s    # 声明自己为Leader的等待时间
```
### 锚节点（Anchor Peer）
锚节点主要用于启动来自不同组织的节点之间的 Gossip 通信。锚节点作为同一通道上的另一组织的节点的入口点，可以与目标锚节点所在组织中的每个节点通信。跨组织的 Gossip 通信必须包含在通道的范围内。

由于跨组织的通信依赖于 Gossip，某一个组织的节点需要知道来自其它组织的节点的至少一个地址(从这个节点，可以找到该组织中的所有节点的信息)。所以添加到通道的每个组织应将其节点中的至少一个节点标识为锚节点（也可以有多个锚节点，以防止单点故障）。网络启动后锚节点地址存储在通道的配置块中。

可以通过在 configtx.yaml 配置文件指定锚节点：
```
---

Organizations:
    - &OrdererOrg
        Name: OrdererOrg
        ID: OrdererMSP
        MSPDir: crypto-config/ordererOrganizations/example.com/msp

    - &Org1
        Name: Org1MSP
        ID: Org1MSP
        MSPDir: crypto-config/peerOrganizations/org1.example.com/msp

        AnchorPeers:    # 指定当前组织的锚节点
            - Host: peer0.org1.example.com
              Port: 7051
    ......
```

## Fabric的数据同步实现
Hyperledger Fabric 是一个分布式区块链网络，所有的 peer 节点都会保存共享分类帐的副本（即所有事务的确切历史记录）。当新区块产生后必须通过分布式网络，使分类帐的副本在所有节点之间保持同步。

在较高的层次上，该过程如下所示：

- 新的交易被提交给 Ordering 服务进行排序。
- Ordering 服务在排序之后创建一个新区块（包含新的交易）。
- Ordering 服务将新产生的区块交给所有 Peer。
但在Hyperledger Fabric 网络中实际发生的情况是，Ordering 服务只向每个组织中的单个节点（Leader Peer）提供新的区块。通过 Gossip 的过程， Peer 节点自己完成了将新区块传播到其它 Peer 节点的工作：

- Peer 节点接收到新的消息。
- 该节点将消息发送到预先指定数量（随机选择的 Fabric中 默认为3个 Peer）的其他 Peer 节点。
- 接收到消息的每一个 Peer 节点再将消息转发给预定数量的其他 Peer 节点。
- 依此类推，直到所有的 Peer 节点都收到了新的消息。
上面的过程称之为广播，它是一种基于推送（Push-based）的方式，通过网络传输信息，Fabric 的 Gossip 系统使用它来向所有 Peer 节点分发消息。

Gossip 协议的关键组成部分是每个节点将消息随机选择并转发给网络中其它节点。这意味着每个节点都知道网络中的所有节点，因此可以在相应的 Peer 节点中进行选择。那么，某一个节点是如何知道组织内的所有节点呢？并且如果有 Peer 节点与网络断开连接并在后期重新连接，则它将错过广播过程。

在 Hyperledger Fabric 中，每个节点都会随机性的向预先定义数量的其它节点定期广播一条消息，指示它仍处于活动状态并连接到网络。每个节点都维护着自己的网络中所有节点的列表（处于活跃的节点和无响应的节点）。

- 当某一个节点 A 收到来自节点 B 的“活跃”消息时，它将节点 B 标记为“有效”（Peer B是网络中的一个有效节点）
- 如果过了一段时间，节点 A 没有收到来自节点 B 的“活跃”消息，Peer A 节点会定期尝试连接 Peer B 节点，确认是否真的无响应。如果无响应将节点 B 标记为“死亡”（Peer B不再是网络的有效节点）。
这种情况之下需要一个基于拉取（Pull-based）的实现机制来向其它 Peer 节点请求它丢失的数据。在Hyperledger Fabric中， Peer 节点之间定期相互交换成员资格数据（ Peer 节点列表，活动和死亡）和分类帐本数据（事务块）。在这种机制下， Peer 节点即使因为故障或其它原因导致错过了接收新区块的广播或因为其它原因产生了缺失区块，但仍然在加入网络之后可以与其它的 Peer 节点交换信息以保持数据同步。

![](./imgs/gossipchannel.png)


正如上图所示，Hyperledger Fabric使用对等体之间的 Gossip 作为容错和可扩展机制，以保持区块链分类账的所有副本同步，它减少了Orderer 节点上的负载。由于不需要固定连接来维护基于Gossip的数据传播，因此该流程可以可靠地为共享账本保证数据的一致性和完整性，包括对节点崩溃的容错。

另外，某些节点可以加入多个不同的通道，但是通过将基于节点通道订阅的机制作为消息分发策略，由于通道之间实现了相互隔离，一个通道上的节点不能在其他通道上发送或共享信息，所以节点无法将区块传播给不在通道中的节点。

> 点对点消息的安全性由节点的TLS层处理，不需要签名。节点通过其由CA分配的证书进行身份验证。节点在Gossip层的身份认证会通过TLS证书体现。账本中的区块由排序服务进行签名，然后传递给通道中的领导者节点。

> 身份验证过程由节点的成员管理服务的提供者（MSP）进行管理。当节点第一次连接到通道中的时候，TLS会话将与成员身份绑定。这本质上是通过网络和通道中的成员身份对连接的每个节点进行身份验证。

## FAQ
### 如何将多个 Peer 节点定义为 Leader 节点？

静态指定方式可以将多个 Peer 节点定义为 Leader 节点，将配置文件中需要指定为 Leader 节点的所属 Peer 配置的 environment 中的两项参数值设置如下：
```
environment:
    - CORE_PEER_GOSSIP_USELEADERELECTION=true
    - CORE_PEER_GOSSIP_ORGLEADER=false
```
但在实际的生产环境中，使用太多的 Leader 节点连接到 Ordering 服务可能会降低网络带宽利用率， 所以不推荐同一个组织中设置多个 Leader 节点。

### 组织内的其它 Peer 节点可以与 Ordering 服务直接通信吗？

组织内的节点除了 Leader 节点， 其它所有的 Peer 节点都不能够与 Ordering 服务直接通信。

