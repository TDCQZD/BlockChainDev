# 创建应用通道
## 如何创建应用通道
在创建及使用应用通道之前，我们先理解一下 channel（通道） 的概念及其作用：

概念：将一个大的网络分割成为不同的私有"子网"。

作用：通道提供一种通讯机制，能够将 Peer 和 Orderer 连接在一起，形成一个具有保密性的通讯链路（虚拟）， 实现数据隔离。

要加入通道的每个节点都必须拥有自己的通过成员服务提供商（MSP）获得的身份标识。

## 如何创建应用通道

### 1. 进入 Docker cli 容器

执行如下命令进入到 CLI 容器中(后继操作都在容器中执行)
```
$ sudo docker exec -it cli bash
```
如果成功, 命令提示符会变为如下内容（代表成功进入 CLI 容器）:
```
root@b240e1643244:/opt/gopath/src/github.com/hyperledger/fabric/peer#`
```
> 其中 @ 符号后面的内容根据不同的设备会显示不同的内容。

### 2. 创建应用通道

1. 检查环境变量是否正确设置
```
$ echo $CHANNEL_NAME
```
2. 设置环境变量
```
$ export CHANNEL_NAME=mychannel
```
3. 创建通道
```
$ peer channel create -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```
该命令执行后，会自动在本地生成一个与应用通道名称同名的初始区块 mychannel.block, 网络节点只有拥有该文件才可以加入创建的应用通道中

命令执行后输出如下：
```
[channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 002 Got status: &{NOT_FOUND}
[channelCmd] InitCmdFactory -> INFO 003 Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 004 Received block: 0
```
参数说明:

* -o： 指定 orderer 节点的地址
* -c： 指定要创建的应用通道的名称(必须与在创建应用通道交易配置文件时的通道名称一致)
* -f： 指定创建应用通道时所使用的应用通道交易配置文件
* --tls： 开启 TLS 验证
* --cafile： 指定 TLS_CA 证书的所在路径
使用 ll 命令查看:
```
$ ll
total 36
drwxr-xr-x 5 root root  4096 Apr 29 03:34 ./
drwxr-xr-x 3 root root  4096 Apr 29 02:48 ../
drwxr-xr-x 2 root root  4096 Apr 29 02:47 channel-artifacts/
drwxr-xr-x 4 root root  4096 Apr 29 02:35 crypto/
-rw-r--r-- 1 root root 15660 Apr 29 03:34 mychannel.block
drwxr-xr-x 2 root root  4096 Apr 29 02:13 scripts/
```

## 3.节点怎么加入应用通道
应用通道所包含组织的成员节点可以加入通道中
```
$ peer channel join -b mychannel.block
```
join命令： 将本 Peer 节点加入到应用通道中

参数说明：

* -b: 指定当前节点要加入/联接至哪个应用通道
命令执行后输出内容如下：
```
[channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
[channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel
```
## 4. 更新锚节点
使用 Org1 的管理员身份更新锚节点配置
```
$ peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org1MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```
使用 Org2 的管理员身份更新锚节点配置
```
$ CORE_PEER_LOCALMSPID="Org2MSP"
$ CORE_PEER_ADDRESS=peer0.org2.example.com:7051 
$ CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
$ CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt 

$ peer channel update -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/Org2MSPanchors.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```
手动配置网络并启动完成，之后我们可以进入 Chaincode 环节。

如果您能顺利完成走到这一步，那么您可以小小的庆祝一下了。

## FAQ
### 创建应用通道失败怎么办？

在执行创建应用通道命令后可能会遇到如下几种错误：

1. Error on outputChannelCreateTx: config update generation failure: could not parse application to application group: 
setting up the MSP manager failed: the supplied identity is not valid: x509:
certificate signed by unknown authority (possibly because of "x509: ECDSA verification failure" 
while trying to verify candidate authority certificate "ca.org1.example.com")
如果遇到此错误，说明生成的证书有问题（要么没有生成，要么生成的证书不符合x509标准），请重新生成。

2. Error:got unexpected status: FORBIDDEN -- Failed to reach implicit threshold of 1 sub-policies, required 1 remaining: permission denied
从错误中可以看到是因为权限而造成，请检查生成的文件对应的所属访问权限。

3. hdr.format undefined (type *tar.header has no field or method format) ......
如果遇到此错误，则检查go语言的版本是否符合官方指定的 Hyperledger Fabric 版本要求。

4. Error: got unexpected status: BAD_REQUEST -- error authorizing update: error validating ReadSet: readset expected key [Group]  /Channel/Application at version 0, but got version 1
出现如上错误，说明指定的通道名称已经在当前处于运行状态的 Fabric 网络中存在。

## 节点为什么要创建并加入应用通道中？

创建应用通道交易配置文件，可以指定创建的应用通道中可以有哪些组织加入及指定相应的权限；网络上的每个交易都需要在一个指定的通道中执行，在通道中交易必须通过通道的认证和授权。要加入一个通道的每个节点都必须有自己的通过成员服务提供商（MSP）获得的身份标识，用于鉴定每个节点在通道中的是什么节点和服务。

​
