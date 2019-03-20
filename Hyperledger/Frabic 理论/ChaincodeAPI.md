# 链码相关API
shim 包提供给链码的相应接口有如下几种类型：

- 参数解析 API：调用链码时需要给被调用的目标函数/方法传递参数，与参数解析相关的 API 提供了获取这些参数（包含被调用的目标函数/方法名称）的方法。
- 账本状态数据操作 API：该类型的 API 提供了对账本数据状态进行操作的方法，包括对状态数据的查询及事务处理等。
- 交易信息获取 API：获取提交的交易信息的相关 API。
- 事件处理 API：与事件处理相关的 API。
- 对 PrivateData 操作的 API： Hyperledger Fabric 在 1.2.0 版本中新增的对私有数据操作的相关 API。
下面我们介绍每一种类型相对应的 API 的定义及调用时所需参数。
## 参数解析相关API
* GetArgs() [][]byte：返回调用链码时在交易提案中指定提供的被调用函数及参数列表

* GetArgsSlice() ([]byte, error)：返回调用链码时在交易提案中指定提供的参数列表

* GetFunctionAndParameters() (function string, params []string)：返回调用链码时在交易提案中指定提供的被调用的函数名称及其参数列表

* GetStringArgs() []string：返回调用链码时指定提供的参数列表

在实际开发中，常用的获取被调用函数及参数列表的API一般为： `GetFunctionAndParameters()` 及 `GetStringArgs()` 两个。

## 账本数据状态操作API
* GetState(key string) ([]byte, error) ：根据指定的 Key 查询相应的数据状态。

* PutState(key string, value []byte) error：根据指定的 key，将对应的 value 保存在分类账本中。

* DelState(key string) error：根据指定的 key 将对应的数据状态删除

* GetStateByRange(startKey, endKey string) (StateQueryIteratorInterface, error)：根据指定的开始及结束 key，查询范围内的所有数据状态。注意：结束 key 对应的数据状态不包含在返回的结果集中。

* GetHistoryForKey(key string) (HistoryQueryIteratorInterface, error)：根据指定的 key 查询所有的历史记录信息。

* CreateCompositeKey(objectType string, attributes []string) (string, error)：创建一个复合键。

* SplitCompositeKey(compositeKey string) (string, []string, error)：将指定的复合键进行分割。

* GetQueryResult(query string) (StateQueryIteratorInterface, error)：对(支持富查询功能的)状态数据库进行富查询，目前支持富查询的只有 CouchDB。

## 交易信息相关API
* GetTxID() string：返回交易提案中指定的交易 ID。

* GetChannelID() string：返回交易提案中指定的 Channel ID。

* GetTxTimestamp() (*timestamp.Timestamp, error)：返回交易创建的时间戳，这个时间戳是peer 接收到交易的具体时间。

* GetBinding() ([]byte, error)：返回交易的绑定信息。如果一些临时信息，以避免重复性攻击。

* GetSignedProposal() (*pb.SignedProposal, error)：返回与交易提案相关的签名身份信息。

* GetCreator() ([]byte, error)：返回该交易提交者的身份信息。

* GetTransient() (map[string][]byte, error)：返回交易中不会被写至账本中的一些临时信息。

## 事件处理API
* SetEvent(name string, payload []byte) error：设置事件，包括事件名称及内容。

## 对 PrivateData 操作的 API
* GetPrivateData(collection, key string) ([]byte, error)：根据指定的 key，从指定的私有数据集中查询对应的私有数据。

* PutPrivateData(collection string, key string, value []byte) error：将指定的 key 与 value 保存到私有数据集中。

* DelPrivateData(collection, key string) error：根据指定的 key 从私有数据集中删除相应的数据。

* GetPrivateDataByRange(collection, startKey, endKey string) (StateQueryIteratorInterface, error)：根据指定的开始与结束 key 查询范围（不包含结束key）内的私有数据。

* GetPrivateDataByPartialCompositeKey(collection, objectType string, keys []string) (StateQueryIteratorInterface, error)：根据给定的部分组合键的集合，查询给定的私有状态。

* GetPrivateDataQueryResult(collection, query string) (StateQueryIteratorInterface, error)：根据指定的查询字符串执行富查询 （只支持支持富查询的 CouchDB）。

## FAQ
### 通过 put 写入的数据状态能立刻 get 到吗？

不能立刻 get 到，因为 put 只是链码执行的模拟交易（防止重复提交攻击），并不会真正将状态保存到账本中，必须经过Orderer达成共识之后，将数据状态保存在区块中，然后保存在各 peer 节点的账本中。
