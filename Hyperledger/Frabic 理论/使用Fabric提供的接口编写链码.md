# 使用Fabric提供的接口编写链码
开发链码，离不开 Hyperledger Fabric 提供的 SDK ，为了方便诸多不同的应用场景且使用不同语言的开发人员，Hyperledger Fabric 提供了许多不同的 SDK 来支持各种编程语言。如：

* Hyperledger Fabric Node SDK：https://github.com/hyperledger/fabric-sdk-node
* Hyperledger Fabric Java SDK：https://github.com/hyperledger/fabric-sdk-java
* Hyperledger Fabric Python SDK：https://github.com/hyperledger/fabric-sdk-py
* Hyperledger Fabric Go SDK：https://github.com/hyperledger/fabric-sdk-go
如果本地系统中没有相关的API，请执行如下下载命令：
```
$ go get -u github.com/hyperledger/fabric/core/chaincode/shim
```
## 链码接口
链码启动必须通过调用 `shim `包中的 Start 函数，而 Start 函数被调用时需要传递一个类型为 Chaincode 的参数，这个参数 Chaincode 是一个接口类型，该接口中有两个重要的函数 Init 与 Invoke 。

1. Chaincode 接口定义如下：
```
type Chaincode interface{
    Init(stub ChaincodeStubInterface) peer.Response
    Invoke(stub ChaincodeStubInterface) peer.Response
}
```
2. Init 与 Invoke 方法

编写链码，关键是实现 Init 与 Invoke 两个方法，必须由所有链码实现。Fabric 通过调用指定的函数来运行事务。

* Init：在链码实例化或升级时被调用, 完成初始化数据的工作。
* invoke：更新或查询提案事务中的分类帐本数据状态时，Invoke 方法被调用， 因此响应调用或查询的业务实现逻辑都需要在此方法中编写实现。
在实际开发中，开发人员可以自行定义一个结构体，然后重写 Chaincode 接口的两个方法，并将两个方法指定为自定义结构体的成员方法；具体可参考下一节的内容。

## 必要结构
### 依赖包

shim 包为链码提供了 API 用来访问/操作数据状态、事务上下文和调用其他链代码；

peer 包提供了链码执行后的响应信息。所以开发链码需要引入如下依赖包：

* `"github.com/hyperledger/fabric/core/chaincode/shim"`
    - shim 包提供了链码与账本交互的中间层。
    - 链码通过 shim.ChaincodeStub 提供的方法来读取和修改账本的状态。
* `"github.com/hyperledger/fabric/protos/peer"`
    - peer.Response：封装的响应信息。
一个开发的链码源文件的必要结构如下：
```
package main

// 引入必要的包
import(
    "fmt"

    "github.com/hyperledger/fabric/core/chaincode/shim"
    "github.com/hyperledger/fabric/protos/peer"
)

// 声明一个结构体
type SimpleChaincode struct {

}

// 为结构体添加Init方法
func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) peer.Response{
  // 在该方法中实现链码初始化或升级时的处理逻辑
  // 编写时可灵活使用stub中的API
}

// 为结构体添加Invoke方法
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response{
  // 在该方法中实现链码运行中被调用或查询时的处理逻辑
  // 编写时可灵活使用stub中的API
}

// 主函数，需要调用shim.Start（ ）方法
func main() {
  err := shim.Start(new(SimpleChaincode))
  if err != nil {
     fmt.Printf("Error starting Simple chaincode: %s", err)
  }
}
```

因为链码是一个可独立运行的应用，所以必须声明在一个 main 包中，并且提供相应的 main 函数做为应用入口。
