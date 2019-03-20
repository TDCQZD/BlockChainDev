# 实现对链码的打包升级
## 链码打包及签名
### 打包

通过将链码相关数据（如链码名称、版本、实例化策略等信息）进行封装，可以实现对其进行打包和签名的操作。

chaincode 包具体包含以下三个部分：

* chaincode 本身，由 ChaincodeDeploymentSpec（CDS）定义。CDS 根据代码及一些其他属性（名称，版本等）来定义 chaincode。
* 一个可选的实例化策略，该策略可被 **背书策略** 描述。
* 一组表示 chaincode 所有权的签名。
对于一个已经编写完成的链码可以使用 package 命令进行打包操作：
```
$ peer chaincode package -n exacc -v 1.0 -p github.com/chaincode/chaincode_example02/go/  -s -S -i "AND('Org1MSP.admin')" ccpack.out
```
参数说明：

* -s： 创建一个可以被多个所有者签名的包。

* -S： 可选参数，使用 core.yaml 文件中被 localMspId 相关属性值定义的 MSP 对包进行签名。

* -i： 指定链码的实例化策略（指定谁可以实例化链码）。

打包后的文件，可以直接用于 install 操作，如： peer chaincode install ccpack.out，但我们一般会在将打包的文件进行签名之后再做进一步的处理。

### 签名

对一个打包文件进行签名操作（添加当前 MSP 签名到签名列表中）

1. 使用 signpackage 命令实现：
```
$ peer chaincode signpackage ccpack.out signedccpack.out
```
signedccpack.out 包含一个用本地 MSP 对包进行的附加签名。

添加了签名的链码包可以进行进行一步的处理，如先将链码进行安装，然后对已安装的链码进行实例化或升级的操作。

2. 安装已添加签名的链码：
```
$ peer chaincode install signedccpack.out
```
命令执行成功输出如下内容：
```
[chaincodeCmd] install -> INFO 001 Installed remotely response:<status:200 payload:"OK" >
```
3. 安装成功之后进行链码的实例化操作，同时指定其背书策略。
```
$ peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n exacc -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
```
**测试：**

1. 查询链码：
```
$ peer chaincode query -C $CHANNEL_NAME -n exacc -c '{"Args":["query","a"]}'
```
执行成功输出查询结果： 100

2. 调用链码：
```
$ peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C $CHANNEL_NAME -n exacc -c '{"Args":["invoke","a","b","10"]}'
```
执行成功输出如下：
```
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200
```
3. 查询链码：
```
$ peer chaincode query -C $CHANNEL_NAME -n exacc -c '{"Args":["query","a"]}'
```
执行成功输出查询结果： 90

## 链码的升级
在实际场景中，由于需求场景的变化，链码也需求实时做出修改，以适应不同的场景需求。所以我们必须能够对于已成功部署并运行状态中的链码进行升级操作。

首先，先将修改之后的链码进行安装，然后使用 upgrade 命令对已安装的链码进行升级，具体实现如下：

1. 安装：
```
$ peer chaincode install -n mycc -v 2.0 -p github.com/chaincode/chaincode_example02/go/
```
2. 升级：
```
$ peer chaincode upgrade -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -v 2.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
```
为了验证链码升级是否成功，我们可以使用如下步骤进行测试：

**测试：**

1. 查询链码：
```
$ peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
```
执行成功输出查询结果： 100

2. 调用链码：
```
$ peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C $CHANNEL_NAME -n mycc -c '{"Args":["invoke","a","b","10"]}'
```
执行成功输出如下：
```
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200
```
3. 查询链码：
```
$ peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
```
执行成功输出查询结果： 90

注意：升级过程中，chaincode 的 Init 函数会被调用以执行数据相关的操作，或者重新初始化数据；所以需要多加小心，以避免在升级 chaincode 时重设状态信息。

## FAQ
### 链码升级之后， 之前旧版本的链码还能使用吗？

升级是一个类似于实例化操作的交易，它会将新版本的链码与通道绑定。其他与旧版本绑定的通道则仍旧运行旧版本的链码。换句话说，升级只会一次影响一个提交它的通道。
