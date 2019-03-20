# Migration

## migration 的概念

理解 migrations（迁移）目录的内容非常重要。这些迁移文件用于将合约部署到区块链上。如果你还记得的话，我们在之前的项目中通过在 node 控制台中调用 VotingContract.new 将投票合约部署到区块链上。以后，我们再也不需要这么做了，truffle 将会部署和跟踪所有的部署。

Migrations（迁移）是JavaScript文件，这些文件负责暂存我们的部署任务，并且假定部署需求会随着时间推移而改变。随着项目的发展，我们应该创建新的迁移脚本，来改变链上的合约状态。所有运行过的migration历史记录，都会通过特殊的迁移合约记录在链上。

第一个迁移 1_initial_migration.js 向区块链部署了一个叫做 Migrations 的合约，并用于存储你已经部署的最新合约。每次你运行 migration 时，truffle 会向区块链查询获取最新已部署好的合约，然后部署尚未部署的任何合约。然后它会更新 Migrations 合约中的 last_completed_migration 字段指向最新部署的合约。你可以简单地把它当成是一个数据库表，里面有一列 last_completed_migration ，该列总是保持最新状态。

migration文件的命名有特殊要求：前缀是一个数字（必需），用来标记迁移是否运行成功；后缀是一个描述词汇，只是单纯为了提高可读性，方便理解。
在脚本的开始，我们用 artifacts.require() 方法告诉truffle想要进行部署迁移的合约，这跟node里的require很类似。不过需要注意，最新的官方文档告诫，应该传入定义的合约名称，而不要给文件名称——因为一个.sol文件中可能包含了多个contract。

migration js里的exports的函数，需要接收一个deployer对象作为第一个参数。这个对象在部署发布的过程中，主要是用来提供清晰的语法支持，同时提供一些通用的合约部署职责，比如保存部署的文件以备稍后使用。deployer对象是用来暂存(stage)部署任务的主要操作接口。

像所有其它在Truffle中的代码一样，Truffle提供了我们自己代码的合约抽象层(contract abstractions)，并且进行了初始化，以方便你可以便利的与以太坊的网络交互。这些抽象接口都是部署流程的一部分。
