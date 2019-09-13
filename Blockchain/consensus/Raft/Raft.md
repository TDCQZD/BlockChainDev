# Raft
Raft 算法是Paxos 算法的一种简化实现。

包括三种角色：leader、candidate 和 follower，其基本过程为：

- Leader 选举：每个 candidate 随机经过一定时间都会提出选举方案，最近阶段中得票最多者被选为 leader；
- 同步 log：leader 会找到系统中 log 最新的记录，并强制所有的 follower 来刷新到这个记录；
注：此处 log 并非是指日志消息，而是各种事件的发生记录。


## go 实现 Raft
```
cd raft
go test
```
 
## Raft是什么
Raft提供了一种在计算系统集群中分布状态机的通用方法，确保集群中的每个节点都同意一系列相同的状态转换.

它有许多开源参考实现，具有Go, C++, java和Scala中的完整规范实现.

一个Raft集群包含若干个服务器节点，通常是5个，这允许整个系统容忍2个节点的失效，每个节点处于以下三种状态之—
- follower (跟随者）：所有结点都以follower的状态开始。如果没收到leader消息则会变成candidate状态
- candidate (候选人）：会向其他结点"拉选票"，如果得到大部分的票则成为leader,这个过程就叫做Leader选举(Leader Election) 
- leader (领导者）：所有对系统的修改都会先经过leader

##  Raft—致性算法
Raft 通过选出一个leader来简化日志副本的管理，例如，日志项(log entry)只允许从leader流向follower 

基于leader的方法，Raft算法可以分解成三个子问题
- Leader election (领导选举)：原来的leader挂掉后，必须选出一个新的leader 
- Log replication(日志复制)：leader从客户端接收日志，并复制到整个集群中
- Safety (安全性)：如果有任意的server将日志项回放到状态机中了，那么其他的server只会回放相同的日志项

##  Leader election (领导选举）
Raft使用一种心跳机制来触发领导人选举
 
- 当服务器程序启动时，节点都是follower(跟随者)身份

- 如果一个follower跟随者在一段时间里没有接收到任何消息，也就是选举超时，然后他就会认为系统中没有可用的领导者然后开始进行选举以选出新的领导者

- 要开始一次选举过程，follower会给当前term加1并且转换成candidate状态，然后它会并行的向集群中的其他服务器节点发送请求投票的RPC来给自己投票。候选人的状态维持直到发生以下任何一个条件发生的时候，比如他自己赢得了这次的选举

- 当一个节点赢得选举，他会成为leader,并且给所有节点发送这个信息，这样所有节点都会回退成follower 

其他的服务器成为领导者

- 如果在等待选举期间，candidate接收到其他server要成为leader的RPC,分两种情况处理

    - 如果leader的term大于或等于自身的term,那么改candidate会转成follower状态

    - 如果leader的term小于自身的term,那么会拒绝该leader,并继续保持candidate状态

一段时间之后没有任何一个获胜的人

- 有可能很多follower同时变成candidate,导致没有candidate能获得大多数的选举，从而导致无法选出来，如果没有特别处理，可能出导致无限地重复选主的情况

-  Raft采用随机定时器的方法来避免上述情况，每个candidate选择一个时间间隔内的随机值，例如150-300ms,采用这种机制，一般只有一个server会进入candidate状态，然后获得大多数server的选举

## Log replication (日志复制）
- 当选出leader后，它会开始接受客户端请求，每个请求会带有4指令，可以被回放到状态机中

-  leader把指令追加成一个log entry,然后通过AppendEntries RPC并行的发送给其他的server,当改entry被多数派server复制后，leader会把该entry回放到状态机中，然后把结果返回给客户端

- 当follower宕机或者运行较慢时，leader会无限地重发AppendEntries给这些follower,直到所有的follower都复制了该log entry 

-  raft的log replication要保证如果两个log entry有相同的index和term,那么它们存储相同的指令

-  leader在一特定的term和index下，只会创建一个log entry

