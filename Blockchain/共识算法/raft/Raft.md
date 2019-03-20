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
 