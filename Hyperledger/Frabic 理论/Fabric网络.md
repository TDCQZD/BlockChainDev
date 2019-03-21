# 测试Fabric网络环境
Hyperledger Fabric 网络环境的构成较为复杂，由N个节点组成一个分布式网络，每个节点都有自己的实体身份标识；而且 Hyperledger Fabric 还可以通过 channel（通道） 将一个网络分割成为不同的私有子网，从而实现不同账本数据的隔离性。所以，我们在使用 Hyperledger Fabric 之前，必须先搭建所需的网络环境。

搭建 Hyperledger Fabric 网络环境可以有两种方式实现：

- 使用自动化脚本实现

    使用一个名为自动化脚本 byfn.sh 的脚本文件自动构建一个简易的 Hyperledger Fabric 网络环境并引导启动，且自动生成相应的一些配置文件，一般作为测试环境使用，本节内容主要就是讲解此方式。

- 手动实现

    为了适应不同的且较为复杂的场景，自动化脚本方式就有些力不从心，这时，必须由开发/运维人员根据不同的情况，手动输入相关命令构建一个相当复杂的网络环境。

## 构建Fabric环境
### byfn.sh都有哪些命令
进入fabric-samples目录中的 first-networkd 子目录
```
$ cd fabric-samples/first-network
```
在first-network目录下有一个自动化脚本 byfn.sh，可以查看相应命令：
```
$ ./byfn.sh --help
```
```
Usage: 
  byfn.sh <mode> [-c <channel name>] [-t <timeout>] [-d <delay>] [-f <docker-compose-file>] [-s <dbtype>] [-l <language>] [-o <consensus-type>] [-i <imagetag>] [-v]
    <mode> - one of 'up', 'down', 'restart', 'generate' or 'upgrade'
      - 'up' - bring up the network with docker-compose up
      - 'down' - clear the network with docker-compose down
      - 'restart' - restart the network
      - 'generate' - generate required certificates and genesis block
      - 'upgrade'  - upgrade the network from version 1.3.x to 1.4.0
    -c <channel name> - channel name to use (defaults to "mychannel")
    -t <timeout> - CLI timeout duration in seconds (defaults to 10)
    -d <delay> - delay duration in seconds (defaults to 3)
    -f <docker-compose-file> - specify which docker-compose file use (defaults to docker-compose-cli.yaml)
    -s <dbtype> - the database backend to use: goleveldb (default) or couchdb
    -l <language> - the chaincode language: golang (default) or node
    -o <consensus-type> - the consensus-type of the ordering service: solo (default) or kafka
    -i <imagetag> - the tag to be used to launch the network (defaults to "latest")
    -v - verbose mode
  byfn.sh -h (print this message)

Typically, one would first generate the required certificates and 
genesis block, then bring up the network. e.g.:

	byfn.sh generate -c mychannel
	byfn.sh up -c mychannel -s couchdb
        byfn.sh up -c mychannel -s couchdb -i 1.4.0
	byfn.sh up -l node
	byfn.sh down -c mychannel
        byfn.sh upgrade -c mychannel

Taking all defaults:
	byfn.sh generate
	byfn.sh up
	byfn.sh down

```
部分输出内容如下：
```
up：启动
down：清除网络
restart：重新启动
generate：生成证书及创世区块
upgrade：将网络从1.1.x升级到1.2.x

-c：用于指定channelName，默认值"mychannel"
-t：CLI timeout时间，默认值10
-d：延迟启动，默认值3
-f：使用指定的网络拓扑结构文件，默认使用docker-compose-cli.yaml
-s：指定使用的数据库，可选 goleveldb/couchdb
-l：指定chaincode使用的语言，可选golang/node
-i：指定镜像tag，默认 "latest"
详细参数可通过./byfn.sh help查看
```

## 构建你的第一个Fabric网络

1. 生成证书和密钥

byfn.sh 自动化脚本文件为各种 fabric 网络实体生成所有证书和密钥，并且可以实现引导服务启动及配置通道所需的一系列配置文件：
```
$ sudo ./byfn.sh  generate
```
命令成功执行后会生成1个orderer + 4个peer + 1个CLI的网络结构，4个peer包含在2个org中。

在提示中输入 y，之后 终端输出日志内容如下：
```
Generating certs and genesis block for channel 'mychannel' with CLI timeout of '10' seconds and CLI delay of '3' seconds
Continue? [Y/n] y
proceeding ...
/home/kevin/hyfa/fabric-samples/first-network/../bin/cryptogen

##########################################################
##### Generate certificates using cryptogen tool #########
##########################################################
+ cryptogen generate --config=./crypto-config.yaml
org1.example.com
org2.example.com
+ res=0
+ set +x

/home/kevin/hyfa/fabric-samples/first-network/../bin/configtxgen
##########################################################
#########  Generating Orderer Genesis block ##############
##########################################################
+ configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
2018-08-28 10:33:52.689 CST [common/tools/configtxgen] main -> WARN 001 Omitting the channel ID for configtxgen is deprecated.  Explicitly passing the channel ID will be required in the future, defaulting to 'testchainid'.
2018-08-28 10:33:52.691 CST [common/tools/configtxgen] main -> INFO 002 Loading configuration
2018-08-28 10:33:52.700 CST [common/tools/configtxgen/encoder] NewChannelGroup -> WARN 003 Default policy emission is deprecated, please include policy specificiations for the channel group in configtx.yaml
2018-08-28 10:33:52.700 CST [common/tools/configtxgen/encoder] NewOrdererGroup -> WARN 004 Default policy emission is deprecated, please include policy specificiations for the orderer group in configtx.yaml
2018-08-28 10:33:52.701 CST [common/tools/configtxgen/encoder] NewOrdererOrgGroup -> WARN 005 Default policy emission is deprecated, please include policy specificiations for the orderer org group OrdererOrg in configtx.yaml
2018-08-28 10:33:52.702 CST [msp] getMspConfig -> INFO 006 Loading NodeOUs
2018-08-28 10:33:52.703 CST [common/tools/configtxgen/encoder] NewOrdererOrgGroup -> WARN 007 Default policy emission is deprecated, please include policy specificiations for the orderer org group Org1MSP in configtx.yaml
2018-08-28 10:33:52.703 CST [msp] getMspConfig -> INFO 008 Loading NodeOUs
2018-08-28 10:33:52.703 CST [common/tools/configtxgen/encoder] NewOrdererOrgGroup -> WARN 009 Default policy emission is deprecated, please include policy specificiations for the orderer org group Org2MSP in configtx.yaml
2018-08-28 10:33:52.704 CST [common/tools/configtxgen] doOutputBlock -> INFO 00a Generating genesis block
2018-08-28 10:33:52.720 CST [common/tools/configtxgen] doOutputBlock -> INFO 00b Writing genesis block
+ res=0
+ set +x

#################################################################
### Generating channel configuration transaction 'channel.tx' ###
#################################################################
+ configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID mychannel
2018-08-28 10:33:52.754 CST [common/tools/configtxgen] main -> INFO 001 Loading configuration
2018-08-28 10:33:52.762 CST [common/tools/configtxgen] doOutputChannelCreateTx -> INFO 002 Generating new channel configtx
2018-08-28 10:33:52.763 CST [common/tools/configtxgen/encoder] NewApplicationGroup -> WARN 003 Default policy emission is deprecated, please include policy specificiations for the application group in configtx.yaml
2018-08-28 10:33:52.763 CST [msp] getMspConfig -> INFO 004 Loading NodeOUs
2018-08-28 10:33:52.764 CST [common/tools/configtxgen/encoder] NewApplicationOrgGroup -> WARN 005 Default policy emission is deprecated, please include policy specificiations for the application org group Org1MSP in configtx.yaml
2018-08-28 10:33:52.764 CST [msp] getMspConfig -> INFO 006 Loading NodeOUs
2018-08-28 10:33:52.765 CST [common/tools/configtxgen/encoder] NewApplicationOrgGroup -> WARN 007 Default policy emission is deprecated, please include policy specificiations for the application org group Org2MSP in configtx.yaml
2018-08-28 10:33:52.768 CST [common/tools/configtxgen] doOutputChannelCreateTx -> INFO 008 Writing new channel tx
+ res=0
+ set +x

#################################################################
#######    Generating anchor peer update for Org1MSP   ##########
#################################################################
+ configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID mychannel -asOrg Org1MSP
2018-08-28 10:33:52.801 CST [common/tools/configtxgen] main -> INFO 001 Loading configuration
2018-08-28 10:33:52.813 CST [common/tools/configtxgen] doOutputAnchorPeersUpdate -> INFO 002 Generating anchor peer update
2018-08-28 10:33:52.815 CST [common/tools/configtxgen] doOutputAnchorPeersUpdate -> INFO 003 Writing anchor peer update
+ res=0
+ set +x

#################################################################
#######    Generating anchor peer update for Org2MSP   ##########
#################################################################
+ configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID mychannel -asOrg Org2MSP
2018-08-28 10:33:52.852 CST [common/tools/configtxgen] main -> INFO 001 Loading configuration
2018-08-28 10:33:52.864 CST [common/tools/configtxgen] doOutputAnchorPeersUpdate -> INFO 002 Generating anchor peer update
2018-08-28 10:33:52.865 CST [common/tools/configtxgen] doOutputAnchorPeersUpdate -> INFO 003 Writing anchor peer update
+ res=0
+ set +x
```

2. 启动网络
```
$ sudo ./byfn.sh  up
```
在提示符中输入 y，最后输出如下内容代表启动且测试成功
```
Starting for channel 'mychannel' with CLI timeout of '10' seconds and CLI delay of '3' seconds
Continue? [Y/n] y
proceeding ...
LOCAL_VERSION=1.2.0
DOCKER_IMAGE_VERSION=1.2.0
Creating network "net_byfn" with the default driver
Creating volume "net_peer0.org2.example.com" with default driver
Creating volume "net_peer1.org2.example.com" with default driver
Creating volume "net_peer1.org1.example.com" with default driver
Creating volume "net_peer0.org1.example.com" with default driver
Creating volume "net_orderer.example.com" with default driver
Creating peer0.org2.example.com
Creating peer0.org1.example.com
Creating peer1.org2.example.com
Creating orderer.example.com
Creating peer1.org1.example.com
Creating cli

 ____    _____      _      ____    _____ 
/ ___|  |_   _|    / \    |  _ \  |_   _|
\___ \    | |     / _ \   | |_) |   | |  
 ___) |   | |    / ___ \  |  _ <    | |  
|____/    |_|   /_/   \_\ |_| \_\   |_|  

Build your first network (BYFN) end-to-end test

......

===================== Query successful on peer1.org2 on channel 'mychannel' ===================== 

========= All GOOD, BYFN execution completed =========== 

 _____   _   _   ____   
| ____| | \ | | |  _ \  
|  _|   |  \| | | | | | 
| |___  | |\  | | |_| | 
|_____| |_| \_| |____/
```

3. 关闭网络
```
$ sudo ./byfn.sh  down
```
在提示符中输入 y， 命令执行后终端输出如下日志内容：
```
Stopping for channel 'mychannel' with CLI timeout of '10' seconds and CLI delay of '3' seconds
Continue? [Y/n] y
proceeding ...
Stopping cli ... done
Stopping peer1.org1.example.com ... done
Stopping peer1.org2.example.com ... done
Stopping orderer.example.com ... done
Stopping peer0.org1.example.com ... done
Stopping peer0.org2.example.com ... done
Removing cli ... done
Removing peer1.org1.example.com ... done
Removing peer1.org2.example.com ... done
Removing orderer.example.com ... done
Removing peer0.org1.example.com ... done
Removing peer0.org2.example.com ... done
Removing network net_byfn
Removing volume net_peer0.org3.example.com
WARNING: Volume net_peer0.org3.example.com not found.
Removing volume net_peer1.org3.example.com
WARNING: Volume net_peer1.org3.example.com not found.
Removing volume net_orderer.example.com
Removing volume net_peer0.org2.example.com
Removing volume net_peer0.org1.example.com
Removing volume net_peer1.org1.example.com
Removing volume net_peer1.org2.example.com
7fb4e7907b3c
708576aff44f
0a8805ff393d
Untagged: dev-peer1.org2.example.com-mycc-1.0-26c2ef32838554aac4f7ad6f100aca865e87959c9a126e86d764c8d01f8346ab:latest
Deleted: sha256:687d517a67c1b236724deb84c50e310fb87f39341de5c66857e3049222a99504
Deleted: sha256:6d8c7e0948accd5bc445134533008f6f34946a49f880088a7cf3db1882412448
Deleted: sha256:e37dd3859185b936bbed2206a865785dddc0cfad1de53fe11ae6a462edd39073
Deleted: sha256:9a71f7af36db323a66ef9fb259d5b91ed36b272fcbab3d1b8c535d2b3c605862
Untagged: dev-peer0.org1.example.com-mycc-1.0-384f11f484b9302df90b453200cfb25174305fce8f53f4e94d45ee3b6cab0ce9:latest
Deleted: sha256:8d42a6a8edc43269d12833eced7dc7a5c3ab4fa93f42d9fe478f5d71059ee93f
Deleted: sha256:044f5beb69724fc61c0a2320deaa63a60f61e253057e16d55f37716467045ea3
Deleted: sha256:63ba54da2202bc9e96002b45b0a2be7978c2063dcb160cdfddf6cbac36d9ad34
Deleted: sha256:c2136be4ddeccb607ca5e5ac54eb6fcd0c568f402cd37a66e459389c3ff41c5f
Untagged: dev-peer0.org2.example.com-mycc-1.0-15b571b3ce849066b7ec74497da3b27e54e0df1345daff3951b94245ce09c42b:latest
Deleted: sha256:828c1b18f7e8e811f7b06adab1bdf2f6c33bfc7cc49cfe38b9281293f917d7da
Deleted: sha256:bb7469d1a150118cc475568fe11325a6e53a0fc5d61db54ec50b3efbd44d5eeb
Deleted: sha256:4609bc59481cb8c10dee0bd85c48f3e1c36bd897f5176cf35d43860beda5acd7
Deleted: sha256:be2477e444d06842e81fb691e4e94f7ed4a547aeb8ba4a963660356a915b61c7
```

关闭网络之后， 将杀死容器，删除加密文件，并从Docker Registry中删除链码图像。

> 请在网络不再使用时，务必关闭网络，以防止后期启动网络时造成的错误。

## FAQ
## 如果启动网络失败怎么办？

如果启动网络时发生错误，则执行关闭命令后重新生成组织结构及证书，然后再次执行启动网络的命令。

## 阿里云
Fabric启动时报错
```
 Error: error getting endorser client for channel: endorser client failed to connect to peer0.org1.example.com:7051: failed to create new connection: context deadline exceeded peer0.org1 failed to join the channel
```
阿里云原因未知，不过在客户机上没有问题。