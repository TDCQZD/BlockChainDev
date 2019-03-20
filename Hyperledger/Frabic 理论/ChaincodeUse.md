# 实现对链码的安装、实例化及调用
## 1.确认网络处于开启状态
首先确认网络是否处于开启状态，利用 docker ps 命令查看容器是否处于活动状态，
```
$ sudo docker ps
```
> 命令执行后会发现有六个容器处于活动状态（分别为：`cli`、`peer1.org1.example.com`、`peer0.org1.example.com`、`peer1.org2.example.com`、`orderer.example.com`、`peer0.org2.example.com`），说明网络启动成功。


如果没有活动的容器，则先使用 docker-compose 命令启动网络然后进入CLI 容器中
```
$ sudo docker-compose -f docker-compose-cli.yaml up -d
$ sudo docker exec -it cli bash
```
如果当前已进入至 CLI 容器中，则上面的命令无需执行。如果之前使用 exit 命令退出了 cli 容器，请使用 sudo docker exec -it cli bash 命令重新进入 cli 容器。

检查当前节点（默认为peer0.example.com）已加入到哪些通道中：
```
$ peer channel list
```
执行成功后会在终端中输出：
```
Channels peers has joined: 
mychannel
```
根据如下的输出内容，说明当前节点已成功加入到一个名为 mychannel 的应用通道中。Peer加入应用通道后，可以执行链码调用的相关操作，进行测试。如果没有，则先将当前节点加入到已创建的应用通道中。

检查环境变量是否正确设置
```
$ echo $CHANNEL_NAME
```
设置环境变量，指定应用通道名称为 mychannel ，因为我们创建的应用通道及当前的 peer 节点加入的应用通道名称为 mychannel
```
$ export CHANNEL_NAME=mychannel
```
链码调用处理交易之前必须将其部署到 Peer 节点上，实现步骤如下：

将其安装在指定的网络节点上
安装完成后要对其进行实例化
然后才可以调用链码处理交易(查询或执行事务)

## 2.安装链码
安装链码使用 install 命令：
```
$ peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/chaincode_example02/go/
```
参数说明：

* -n： 指定要安装的链码的名称
* -v： 指定链码的版本
* -p： 指定要安装的链码的所在路径
命令执行完成看到如下输出说明指定的链码被成功安装至 peer 节点：
```
[chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
[chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
[chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" >
```
## 3.实例化链码
实例化链码使用 instantiate 命令：
```
$ peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
```
参数说明:

* -o： 指定Oderer服务节点地址
* --tls： 开启 TLS 验证
* --cafile： 指定 TLS_CA 证书的所在路径
* -n： 指定要实例化的链码名称，必须与安装时指定的链码名称相同
* -v： 指定要实例化的链码的版本号，必须与安装时指定的链码版本号相同
* -C： 指定通道名称
* -c： 实例化链码时指定的参数
* -P： 指定背书策略
实例化完成后，用户即可向网络中发起交易。

## 4.查询链码
查询链码使用 query 命令实现：
```
$ peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
```
参数说明：

* -n： 指定要调用的链码名称
* -C： 指定通道名称
* -c 指定调用链码时所需要的参数
执行成功输出结果：100

### 5.调用链码
1. 调用
调用链码使用 invoke 命令实现：
```
$ peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C $CHANNEL_NAME -n mycc -c '{"Args":["invoke","a","b","10"]}'
```
参数说明：

* -o： 指定orderer节点地址
* --tls： 开启TLS验证
* --cafile： 指定TLS_CA证书路径
* -n: 指定链码名称
* -C： 指定通道名称
* -c： 指定调用链码的所需参数
有如下输出则说明链码被调用成功且交易请求被成功处理：
```
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200
```
2. 查询a账户的金额
执行查询a账户的命令，并查看输出结果：
```
$ peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
```
执行成功输出结果: 90

## FAQ
### 链码是安装在一个节点中还是安装在多个节点中？有什么区别？

在实际生产环境中，必须在应用通道上每一个要运行 chaincode 的背书节点上安装 chaincode。其它未安装 chaincode 的节点不能执行 chaincode。但仍可以验证交易并提交到账本中。

背书节点需要由联盟的成员共同指定，然后在实例化链码时指定背书策略，但安装一定要在所有预先指定的背书 peer 中安装。

### 链码的执行查询与执行事务方式的流程相同吗？

不相同，如果执行的查询操作，则客户端接收到背书的交易提案响应后不会再将交易请求提交给 Orderer 服务节点。如果是执行事务操作，则会执行完整的交易流程。

### 背书策略具体指的是什么？

背书策略是在实例化链码时指定的由当前通道中的哪些节点成员进行背书签名的一种策略。

### 如果在实例化链码时没有指定背书策略会有节点进行背书吗？

如果在实例化链码时没有明确指定背书策略，那么默认的背书策略是 MSP 标识 DEFAULT 成员的签名。
处。