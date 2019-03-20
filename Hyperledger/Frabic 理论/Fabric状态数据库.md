# Fabric状态数据库
## CouchDB数据库介绍
在 Hyperledger Fabric 项目中，目前可以支持的状态数据库有两种：

* LevelDB：LevelDB 是嵌入在 Peer 中的默认键值对（key-value）状态数据库。
* CouchDB：CouchDB 是一种可选的替代 levelDB 的状态数据库。与 LevelDB 键值存储一样，CouchDB 不仅可以根据 key 进行相应的查询，还可以根据不同的应用场景需求实现复杂查询。

CouchDB 是前 IBM 的 Lotus Notes 开发者 Damien Katz 创建于2005年的一个项目，定义为“面向大规模可扩展对象数据库的存储系统”，在2008年成为了 Apache 的项目。2010年7月发布第一个稳定版，目前官网的最新版本为 2.2.0。


Apache CouchDB 是一种新一代数据库管理系统之一，具有核心概念简单（但功能强大）且易于理解的特征，使用 JSON 并支持二进制数据以满足所有数据存储需求。具有高可用性和容错存储引擎，将数据的安全性放在第一位；适用于现代网络和移动应用程序，可以高效地实现数据分发。

后期 Hyperledger Fabric 正式版本中可能会支持更多的数据库管理系统。

## CouchDB在Hyperledter Fabric中的具体实现
下面我们使用 CouchDB 容器来实现对 CouchDB 的使用。

以一个票据查询功能实现为例，链码中提供两个查询方法，根据持票人的证件号码查询所有票据与根据持票人的证件号码查询待签收票据。链码部署后调用自定义的 billInit 方法进行数据的初始化，然后分别调用两个查询方法进行测试。实现步骤如下：

首先定义一个票据的结构体文件：domain.go
```
package main

type BillStruct struct {
    ObjectType    string    `json:"docType"`
    BillInfoID    string    `json:"BillInfoID"`
    BillInfoAmt    string    `json:"BillInfoAmt"`
    BillInfoType string    `json:"BillInfoType"`

    BillIsseDate    string    `json:"BillIsseDate"`
    BillDueDate    string    `json:"BillDueDate"`

    HolderAcct    string    `json:"HolderAcct"`
    HolderCmID    string    `json:"HolderCmID"`

    WaitEndorseAcct    string    `json:"WaitEndorseAcct"`
    WaitEndorseCmID    string    `json:"WaitEndorseCmID"`

}
```

编写链码文件： main.go

```
package main

import (
    "github.com/hyperledger/fabric/core/chaincode/shim"
    "fmt"
    "github.com/hyperledger/fabric/protos/peer"
    "encoding/json"
    "bytes"
)

type CouchDBChaincode struct {

}

func (t *CouchDBChaincode) Init(stub shim.ChaincodeStubInterface) peer.Response  {
    return shim.Success(nil)
}

func (t *CouchDBChaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response  {
    fun, args := stub.GetFunctionAndParameters()
    if fun == "billInit" {
        return billInit(stub, args)
    } else if fun == "queryBills" {
        return queryBills(stub, args)
    } else if fun == "queryWaitBills" {
        return queryWaitBills(stub, args)
    }

    return shim.Error("非法操作, 指定的函数名无效")
}

// 初始化票据数据
func billInit(stub shim.ChaincodeStubInterface, args []string) peer.Response  {
    bill := BillStruct{
        ObjectType:"billObj",
        BillInfoID:"POC101",
        BillInfoAmt:"1000",
        BillInfoType:"111",
        BillIsseDate:"20100101",
        BillDueDate:"20100110",

        HolderAcct:"AAA",
        HolderCmID:"AAAID",

        WaitEndorseAcct:"",
        WaitEndorseCmID:"",
    }

    billByte, _ := json.Marshal(bill)
    err := stub.PutState(bill.BillInfoID, billByte)
    if err != nil {
        return shim.Error("初始化第一个票据失败: "+ err.Error())
    }

    bill2 := BillStruct{
        ObjectType:"billObj",
        BillInfoID:"POC102",
        BillInfoAmt:"2000",
        BillInfoType:"111",
        BillIsseDate:"20100201",
        BillDueDate:"20100210",

        HolderAcct:"AAA",
        HolderCmID:"AAAID",

        WaitEndorseAcct:"BBB",
        WaitEndorseCmID:"BBBID",
    }

    billByte2, _ := json.Marshal(bill2)
    err = stub.PutState(bill2.BillInfoID, billByte2)
    if err != nil {
        return shim.Error("初始化第二个票据失败: "+ err.Error())
    }

    bill3 := BillStruct{
        ObjectType:"billObj",
        BillInfoID:"POC103",
        BillInfoAmt:"3000",
        BillInfoType:"111",
        BillIsseDate:"20100301",
        BillDueDate:"20100310",

        HolderAcct:"BBB",
        HolderCmID:"BBBID",

        WaitEndorseAcct:"CCC",
        WaitEndorseCmID:"CCCID",
    }

    billByte3, _ := json.Marshal(bill3)
    err = stub.PutState(bill3.BillInfoID, billByte3)
    if err != nil {
        return shim.Error("初始化第三个票据失败: "+ err.Error())
    }

    bill4 := BillStruct{
        ObjectType:"billObj",
        BillInfoID:"POC104",
        BillInfoAmt:"4000",
        BillInfoType:"111",
        BillIsseDate:"20100401",
        BillDueDate:"20100410",

        HolderAcct:"CCC",
        HolderCmID:"CCCID",

        WaitEndorseAcct:"BBB",
        WaitEndorseCmID:"BBBID",
    }

    billByte4, _ := json.Marshal(bill4)
    err = stub.PutState(bill4.BillInfoID, billByte4)
    if err != nil {
        return shim.Error("初始化第四个票据失败: "+ err.Error())
    }

    return shim.Success([]byte("初始化票据成功"))
}

// 根据持票人的证件号码批量查询持票人的持有票据列表
func queryBills(stub shim.ChaincodeStubInterface, args []string) peer.Response {
    if len(args) != 1 {
        return shim.Error("必须且只能指定持票人的证件号码")
    }
    holderCmID := args[0]

    // 拼装CouchDB所需要的查询字符串(是标准的一个JSON串)
    // "{\"key\":{\"k\":\"v\", \"k\":\"v\"[,...]}}"
    queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"billObj\", \"HoldrCmID\":\"%s\"}}", holderCmID)

    // 查询数据
    result, err := getBillsByQueryString(stub, queryString)
    if err != nil {
        return shim.Error("根据持票人的证件号码批量查询持票人的持有票据列表时发生错误: " + err.Error())
    }
    return shim.Success(result)
}

// 根据待背书人的证件号码批量查询待背书的票据列表
func queryWaitBills(stub shim.ChaincodeStubInterface, args []string) peer.Response {
    if len(args) != 1 {
        return shim.Error("必须且只能指定待背书人的证件号码")
    }

    waitEndorseCmID := args[0]
    queryString := fmt.Sprintf("{\"selector\":{\"docType\":\"billObj\", \"WaitEndorseCmID\":\"%s\"}}", waitEndorseCmID)

    result, err := getBillsByQueryString(stub, queryString)
    if err != nil {
        return shim.Error("根据待背书人的证件号码批量查询待背书的票据列表时发生错误: " + err.Error())
    }
    return shim.Success(result)
}

// 根据指定的查询字符串查询批量数据
func getBillsByQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {

    iterator, err := stub.GetQueryResult(queryString)
    if err != nil {
        return nil, err
    }
    defer  iterator.Close()

    var buffer bytes.Buffer
    var isSplit bool
    for iterator.HasNext() {
        result, err := iterator.Next()
        if err != nil {
            return nil, err
        }

        if isSplit {
            buffer.WriteString("; ")
        }

        buffer.WriteString("key:")
        buffer.WriteString(result.Key)
        buffer.WriteString(", Value: ")
        buffer.WriteString(string(result.Value))

        isSplit = true

    }

    return buffer.Bytes(), nil

}

func main() {
    err := shim.Start(new(CouchDBChaincode))
    if err != nil {
        fmt.Errorf("启动链码失败: %v", err)
    }
}
```
使用 CouchDB 需要声明相应的 couchdb 容器， 在 docker-compose-simple.yaml 配置文件中添加 couchdb 的容器信息：

可以参考 first-network 目录中的 docker-compose-couch.yaml 配置文件，该文件中声明了 couchdb 的示例配置信息。

需要在 chaincode-docker-devmode 目录下编辑 docker-compose-simple.yaml 文件. 添加couchDB相关内容
```
  couchdb:
    container_name: couchdb
    image: hyperledger/fabric-couchdb
    # Populate the COUCHDB_USER and COUCHDB_PASSWORD to set an admin user and password
    # for CouchDB.  This will prevent CouchDB from operating in an "Admin Party" mode.
    environment:
      - COUCHDB_USER=
      - COUCHDB_PASSWORD=
    # Comment/Uncomment the port mapping if you want to hide/expose the CouchDB service,
    # for example map it to utilize Fauxton User Interface in dev environments.
    ports:
      - "5984:5984"
```

peer容器中声明的配置信息参考 first-network 目录中的 docker-compose-couch.yaml 配置文件

需要在 chaincode-docker-devmode 目录下编辑 docker-compose-simple.yaml 文件. 添加couchDB相关内容，在声明 peer 容器中的 environment 中添加如下内容：
```
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=couchdb:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=
    depends_on: 
      - couchdb
```
## 测试
进入 chaincode 目录中，创建并进入 testcdb 目录：
```
$ cd hyfa/fabric-samples/chaincode
$ sudo mkdir testcdb
$ cd testcdb
```
将编写的两个 domain.go、main.go 文件上传至 testcdb 目录中，然后跳转至fabric-samples的chaincode-docker-devmode目录
```
$ cd ~/hyfa/fabric-samples/chaincode-docker-devmode/
```
### 终端1 启动网络
```
$ sudo docker-compose -f docker-compose-simple.yaml up -d
```
在执行启动网络的命令之前确保无Fabric网络处于运行状态，如果有网络在运行，请先关闭。

### 终端2 建立并启动链码

**2.1 打开一个新终端2，进入 chaincode 容器**
```
$ sudo docker exec -it chaincode bash
```
**2.2 编译**

进入 testcdb 目录编译 chaincode
```
$ cd testcdb
$  go build
```
**2.3 运行chaincode**
```
$ CORE_PEER_ADDRESS=peer:7052 CORE_CHAINCODE_ID_NAME=cdb:0 ./testcdb
```
命令执行后输出如下：
```
[shim] SetupChaincodeLogging -> INFO 001 Chaincode log level not provided; defaulting to: INFO
[shim] SetupChaincodeLogging -> INFO 002 Chaincode (build level: ) starting up ...
```
### 终端3 测试

**3.1 打开一个新的终端3，进入 cli 容器**
```
$ sudo docker exec -it cli bash
```
**3.2 安装链码**
```
$ peer chaincode install -p chaincodedev/chaincode/testcdb -n cdb -v 0
```
**3.3 实例化链码**
```
$ peer chaincode instantiate -n cdb -v 0 -C myc -c '{"Args":["init"]}'
```
**3.4 初始化数据**

指定调用 billInit 函数进行数据的初始化：
```
$ peer chaincode invoke -n cdb -C myc -c '{"Args":["billInit"]}'
```
执行成功，输出如下内容：
```
......
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 0a8 Chaincode invoke successful. result: status:200 payload:"\345\210\235\345\247\213\345\214\226\347\245\250\346\215\256\346\210\220\345\212\237"
```
**3.5 根据持票人证件号码查询所有票据列表**

指定调用 queryBills 函数，查询指定持票人的票据列表
```
$ peer chaincode query -n cdb -C myc -c '{"Args":["queryBills", "AAAID"]}'
```
执行成功，输出查询到的结果如下：
```
......
[msp/identity] Sign -> DEBU 045 Sign: digest: 200A43B1310FF70847EB518A10EBFE1231F448CDBD61239AF11E82BA40D9456F 
key:POC101, Value: {"BillDueDate":"20100110","BillInfoAmt":"1000","BillInfoID":"POC101","BillInfoType":"111","BillIsseDate":"20100101","HolderAcct":"AAA","HolderCmID":"AAAID","WaitEndorseAcct":"","WaitEndorseCmID":"","docType":"billObj"}; key:POC102, Value: {"BillDueDate":"20100210","BillInfoAmt":"2000","BillInfoID":"POC102","BillInfoType":"111","BillIsseDate":"20100201","HolderAcct":"AAA","HolderCmID":"AAAID","WaitEndorseAcct":"BBB","WaitEndorseCmID":"BBBID","docType":"billObj"}
```
**3.6 根据持票人证件号码查询待签收票据列表**

指定调用 queryWaitBills 函数，查询指定人员的待签收票据列表
```
$ peer chaincode query -n cdb -C myc -c '{"Args":["queryWaitBills", "CCCID"]}'
```
执行成功，输出查询到的结果如下：
```
   ......
   [msp/identity] Sign -> DEBU 045 Sign: digest: 94F32E3D440F409720433DDFA3A2F2FA48BF98835916927923ED1D1A75344B8A 
   key:POC103, Value: {"BillDueDate":"20100310","BillInfoAmt":"3000","BillInfoID":"POC103","BillInfoType":"111","BillIsseDate":"20100301","HolderAcct":"BBB","HolderCmID":"BBBID","WaitEndorseAcct":"CCC","WaitEndorseCmID":"CCCID","docType":"billObj"}
```

## FAQ
### 在 Hyperledger Fabric 中，状态数据库使用 LevelDB 与 CouchDB 有什么区别？

如果状态数据库使用 CouchDB 的话，具有最大的一个特点：可以使用富查询实现对状态的检索，但是需要自定义富查询字符串，该字符串必须符合 CouchDB 查询语法结构。

### 如何使用 CouchDB？

在 Hyperledger Fabric 环境中，如果需要使用 CouchDB，那么必须在 `docker-compose.yml/docker-compose.yaml`或自定义的配置文件中声明 CouchDB 容器，然后在各个 peer 容器中 environment 属性中声明相关环境内容，且在 depends_on 属性中指定声明的 CouchDB 容器的名称。
