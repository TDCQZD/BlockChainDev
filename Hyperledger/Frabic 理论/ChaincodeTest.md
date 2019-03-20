# 链码测试

正常情况下 chaincode 由 peer 启动和维护。然而，在 dev “开发模式”下，链码由用户构建并启动。

> 如果没有下载安装 Hyperledger Fabric Samples 请先下载安装；
> 如果没有下载 Docker images 请先下载。
在 dev 开发模式下我们可以使用三个终端来实现具体的测试过程

## 启动网络
> 终端1（当前终端）

1. 为了确保我们的系统中的 Docker 镜像文件是完整的，首先使用 docker images 命令查看 Docker 镜像信息(显示本地 Docker Registry)：
```
$ sudo docker images
```
终端中会看到如下类似输出：
```
REPOSITORY                     TAG             IMAGE ID        CREATED        SIZE
hyperledger/fabric-ca          1.2.0           66cc132bd09c    4 weeks ago    252 MB
hyperledger/fabric-ca          latest          66cc132bd09c    4 weeks ago    252 MB
hyperledger/fabric-tools       1.2.0           379602873003    4 weeks ago    1.51 GB
hyperledger/fabric-tools       latest          379602873003    4 weeks ago    1.51 GB
hyperledger/fabric-ccenv       1.2.0           6acf31e2d9a4    4 weeks ago    1.43 GB
hyperledger/fabric-ccenv       latest          6acf31e2d9a4    4 weeks ago    1.43 GB
hyperledger/fabric-orderer     1.2.0           4baf7789a8ec    4 weeks ago    152 MB
hyperledger/fabric-orderer     latest          4baf7789a8ec    4 weeks ago    152 MB
hyperledger/fabric-peer        1.2.0           82c262e65984    4 weeks ago    159 MB
hyperledger/fabric-peer        latest          82c262e65984    4 weeks ago    159 MB
hyperledger/fabric-zookeeper   0.4.10          2b51158f3898    5 weeks ago    1.44 GB
hyperledger/fabric-zookeeper   latest          2b51158f3898    5 weeks ago    1.44 GB
hyperledger/fabric-kafka       0.4.10          936aef6db0e6    5 weeks ago    1.45 GB
hyperledger/fabric-kafka       latest          936aef6db0e6    5 weeks ago    1.45 GB
hyperledger/fabric-couchdb     0.4.10          3092eca241fc    5 weeks ago    1.61 GB
hyperledger/fabric-couchdb     latest          3092eca241fc    5 weeks ago    1.61 GB
hyperledger/fabric-baseos      amd64-0.4.10    52190e831002    6 weeks ago    132 MB
```

在 dev 模式中所需的必要镜像文件为：
```
hyperledger/fabric-tools
hyperledger/fabric-orderer
hyperledger/fabric-peer
hyperledger/fabric-ccenv
```
2. 关闭之前已启动的网络环境：
```
$ sudo docker-compose -f docker-compose-cli.yaml down
```
3. 进入 chaincode-docker-devmode 目录
```
$ cd ~/hyfa/fabric-samples/chaincode-docker-devmode/
```
进入 chaincode-docker-devmode 目录下我们会发现与网络、通道、初始区块相关的所有内容。如：

* docker-compose-simple.yaml：网络启动依赖的配置文件

    该配置文件中指定了四个容器，分别为：orderer、peer、cli、chaincode， 各项的配置内容大家可以通过 cat 命令查看，在此不再赘述。

* msp：网络环境的 MSP，包含一系列的证书及私钥。

* myc.block：代表通道配置块文件。

* myc.tx：应用通道交易配置文件。

* orderer.block：初始区块配置文件。

4. 下面，我们使用 docker-compose-simple.yaml 配置文件来启动网络：
```
$ sudo docker-compose -f docker-compose-simple.yaml up -d
```
上面的命令以 docker-compose-simple.yaml 启动了网络，并以开发模式启动 peer。另外还启动了两个容器：

- 一个 chaincode 容器，用于链码环境

- 一个 CLI 容器，用于与链码进行交互。

命令执行后，终端中输出如下：
```
Creating orderer
Creating peer
Creating chaincode
Creating cli
```

创建和连接通道的命令嵌入到 CLI 容器中，因此我们可以立即跳转到链码调用。

## 构建并启动链码
网络启动成功后，下一步需要开发者自行对已经编写好的链码进行构建及启动。

> 终端2（开启一个新的终端2）

1. 进入chaincode容器
chaincode 容器的作用是为了以简化的方式建立并启动链码
```
$ sudo docker exec -it chaincode bash
```
命令提示符变为：
```
root@858726aed16e:/opt/gopath/src/chaincode#
```
进入 chaincode 容器之后就可以构建与启动链码。

2. 编译
现在我们对 fabric-samples 提供的 chaincode_example02 进行测试，当然，在实际环境中，我们可以将开发的链码添加到 chaincode 子目录中并重新构建及启动链码，然后进行测试。

进入 `chaincode_example02/go/` 目录编译 chaincode
```
$ cd chaincode_example02/go/

$ go build
```
3. 运行chaincode
使用如下命令启动并运行链码：
```
$ CORE_PEER_ADDRESS=peer:7052 CORE_CHAINCODE_ID_NAME=mycc:0 ./go
```
命令执行后输出如下：
```
[shim] SetupChaincodeLogging -> INFO 001 Chaincode log level not provided; defaulting to: INFO
[shim] SetupChaincodeLogging -> INFO 002 Chaincode (build level: ) starting up ...
```
命令含义：

* CORE_PEER_ADDRESS：用于指定peer。
* CORE_CHAINCODE_ID_NAME：用于注册到peer的链码。
* mycc： 指定链码名称
* 0： 指定链码初始版本号
* ./go： 指定链码文件
> 注意，此阶段，链码与任何通道都没有关联。我们需要在后续步骤中使用“实例化”命令来完成.

## 调用链码
> 终端3（开启一个新的终端3）

1. 首先进入 cli 容器
```
$ sudo docker exec -it cli bash
```
2. 进入 CLI 容器后，执行如下命令安装及实例化 chaincode

即使我们在 dev 模式下，也需要安装链码，使链码能够正常通过生命周期系统链码的检查 。将来可能会删除此步骤。

安装：
```
$ peer chaincode install -p chaincodedev/chaincode/chaincode_example02/go -n mycc -v 0
```
注意：安装链码时指定的链码名称与版本号必须与在终端2中注册的链码名称及版本号相同。

安装命令执行后，终端中输出如下：
```
......
-----END CERTIFICATE-----
[msp] setupSigningIdentity -> DEBU 034 Signing identity expires at 2027-11-10 13:41:11 +0000 UTC
[msp] Validate -> DEBU 035 MSP DEFAULT validating identity
[grpc] Printf -> DEBU 036 parsed scheme: ""
[grpc] Printf -> DEBU 037 scheme "" not registered, fallback to default scheme
[grpc] Printf -> DEBU 038 ccResolverWrapper: sending new addresses to cc: [{peer:7051 0  <nil>}]
[grpc] Printf -> DEBU 039 ClientConn switching balancer to "pick_first"
[grpc] Printf -> DEBU 03a pickfirstBalancer: HandleSubConnStateChange: 0xc4204e7c40, CONNECTING
[grpc] Printf -> DEBU 03b pickfirstBalancer: HandleSubConnStateChange: 0xc4204e7c40, READY
[grpc] Printf -> DEBU 03c parsed scheme: ""
[grpc] Printf -> DEBU 03d scheme "" not registered, fallback to default scheme
[grpc] Printf -> DEBU 03e ccResolverWrapper: sending new addresses to cc: [{peer:7051 0  <nil>}]
[grpc] Printf -> DEBU 03f ClientConn switching balancer to "pick_first"
[grpc] Printf -> DEBU 040 pickfirstBalancer: HandleSubConnStateChange: 0xc420072170, CONNECTING
[grpc] Printf -> DEBU 041 pickfirstBalancer: HandleSubConnStateChange: 0xc420072170, READY
[msp] GetDefaultSigningIdentity -> DEBU 042 Obtaining default signing identity
[chaincodeCmd] checkChaincodeCmdParams -> INFO 043 Using default escc
[chaincodeCmd] checkChaincodeCmdParams -> INFO 044 Using default vscc
[chaincodeCmd] getChaincodeSpec -> DEBU 045 java chaincode disabled
[golang-platform] getCodeFromFS -> DEBU 046 getCodeFromFS chaincodedev/chaincode/chaincode_example02/go
[golang-platform] func1 -> DEBU 047 Discarding GOROOT package fmt
[golang-platform] func1 -> DEBU 048 Discarding provided package github.com/hyperledger/fabric/core/chaincode/shim
[golang-platform] func1 -> DEBU 049 Discarding provided package github.com/hyperledger/fabric/protos/peer
[golang-platform] func1 -> DEBU 04a Discarding GOROOT package strconv
[golang-platform] GetDeploymentPayload -> DEBU 04b done
[container] WriteFileToPackage -> DEBU 04c Writing file to tarball: src/chaincodedev/chaincode/chaincode_example02/go/chaincode_example02.go
[msp/identity] Sign -> DEBU 04d Sign: plaintext: 0AC4070A5C08031A0C08C3F492DC0510...21E3DF010000FFFF4C61C899001C0000 
[msp/identity] Sign -> DEBU 04e Sign: digest: 6F0F7CF70A07027506571AAC56B978353CA3C73E311C882AB57263543ECE7B76 
[chaincodeCmd] install -> INFO 04f Installed remotely response:<status:200 payload:"OK" >
```

3. 实例化：
```
$ peer chaincode instantiate -n mycc -v 0 -c '{"Args":["init","a", "100", "b","200"]}' -C myc
```
实例化命令执行后，终端中输出如下内容：
```
......
[common/configtx] addToMap -> DEBU 091 Adding to config map: [Policy] /Channel/Application/Readers
[common/configtx] addToMap -> DEBU 092 Adding to config map: [Policy] /Channel/Application/Writers
[common/configtx] addToMap -> DEBU 093 Adding to config map: [Policy] /Channel/Application/Admins
[common/configtx] addToMap -> DEBU 094 Adding to config map: [Value]  /Channel/BlockDataHashingStructure
[common/configtx] addToMap -> DEBU 095 Adding to config map: [Value]  /Channel/OrdererAddresses
[common/configtx] addToMap -> DEBU 096 Adding to config map: [Value]  /Channel/HashingAlgorithm
[common/configtx] addToMap -> DEBU 097 Adding to config map: [Value]  /Channel/Consortium
[common/configtx] addToMap -> DEBU 098 Adding to config map: [Policy] /Channel/Writers
[common/configtx] addToMap -> DEBU 099 Adding to config map: [Policy] /Channel/Admins
[common/configtx] addToMap -> DEBU 09a Adding to config map: [Policy] /Channel/Readers
[chaincodeCmd] InitCmdFactory -> INFO 09b Retrieved channel (myc) orderer endpoint: orderer:7050
[grpc] Printf -> DEBU 09c parsed scheme: ""
[grpc] Printf -> DEBU 09d scheme "" not registered, fallback to default scheme
[grpc] Printf -> DEBU 09e ccResolverWrapper: sending new addresses to cc: [{orderer:7050 0  <nil>}]
[grpc] Printf -> DEBU 09f ClientConn switching balancer to "pick_first"
[grpc] Printf -> DEBU 0a0 pickfirstBalancer: HandleSubConnStateChange: 0xc42043d790, CONNECTING
[grpc] Printf -> DEBU 0a1 pickfirstBalancer: HandleSubConnStateChange: 0xc42043d790, READY
[chaincodeCmd] checkChaincodeCmdParams -> INFO 0a2 Using default escc
[chaincodeCmd] checkChaincodeCmdParams -> INFO 0a3 Using default vscc
[chaincodeCmd] getChaincodeSpec -> DEBU 0a4 java chaincode disabled
[msp/identity] Sign -> DEBU 0a5 Sign: plaintext: 0AC9070A6108031A0C08F2F592DC0510...30300A000A04657363630A0476736363 
[msp/identity] Sign -> DEBU 0a6 Sign: digest: B7822DC27649C2CE85206E13DC69861CDB6C4786D6D3E299032BE2A187C0A362 
[msp/identity] Sign -> DEBU 0a7 Sign: plaintext: 0AC9070A6108031A0C08F2F592DC0510...025C39086D09D5D731F33C16A2E53492 
[msp/identity] Sign -> DEBU 0a8 Sign: digest: 27E503A393AD2B63F56A02FD29E4495999D913F037FEE4BCD894C16447EDAB35
```

### 测试：

1. 查询：
```
$ peer chaincode query -n mycc  -c '{"Args":["query","a"]}' -C myc
```
执行成功输出查询结果： 100

2. 调用：
```
$ peer chaincode invoke -n mycc -c '{"Args":["invoke","a","b","10"]}' -C myc
```
执行成功输出如下：
```
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 0a8 Chaincode invoke successful. result: status:200
```
3. 查询：
```
$ peer chaincode query -n mycc  -c '{"Args":["query","a"]}' -C myc
```
执行成功输出查询结果： 90

## FAQ
### net 模式与 dev 模式到底有什么区别？

使用 net 模式每次修改链码后想要测试，需要对链码进行升级重新实例化（或重新安装再实例化），指定一大堆参数，给开发调试带来了很大的不便。而 dev 模式就简化了这些过程。

### CORE_PEER_ADDRESS=peer:7052 中的 7052 端口到底指的是什么？为什么不是 7051 ？

peer:7052 是用于指定链码的专用监听地址及端口号。而7051是peer节点监听的网络端口
