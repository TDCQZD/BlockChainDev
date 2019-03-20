# 不可或缺的配置文件
## configtx.yaml配置文件指定哪些核心内容
创建服务启动初始区块及应用通道交易配置文件需要指定 Orderer 服务的相关配置以及当前的联盟信息， 这些信息定义在一个名为 configtx.yaml 文件中。

configtx.yaml 配置文件内容如下：
```
---

Organizations:
    - &OrdererOrg
        Name: OrdererOrg
        ID: OrdererMSP
        MSPDir: crypto-config/ordererOrganizations/example.com/msp

    - &Org1
        Name: Org1MSP
        ID: Org1MSP
        MSPDir: crypto-config/peerOrganizations/org1.example.com/msp

        AnchorPeers:
            - Host: peer0.org1.example.com
              Port: 7051

    - &Org2
        Name: Org2MSP
        ID: Org2MSP
        MSPDir: crypto-config/peerOrganizations/org2.example.com/msp

        AnchorPeers:
            - Host: peer0.org2.example.com
              Port: 7051

Capabilities:
    Global: &ChannelCapabilities
        V1_1: true

    Orderer: &OrdererCapabilities
        V1_1: true

    Application: &ApplicationCapabilities
        V1_2: true

Application: &ApplicationDefaults
    Organizations:

Orderer: &OrdererDefaults
    OrdererType: solo
    Addresses:
        - orderer.example.com:7050

    BatchTimeout: 2s
    BatchSize:
        MaxMessageCount: 10
        AbsoluteMaxBytes: 99 MB
        PreferredMaxBytes: 512 KB

    Kafka:
        Brokers:
            - 127.0.0.1:9092

    Organizations:

Profiles:
    TwoOrgsOrdererGenesis:
        Capabilities:
            <<: *ChannelCapabilities
        Orderer:
            <<: *OrdererDefaults
            Organizations:
                - *OrdererOrg
            Capabilities:
                <<: *OrdererCapabilities
        Consortiums:
            SampleConsortium:
                Organizations:
                    - *Org1
                    - *Org2
    TwoOrgsChannel:
        Consortium: SampleConsortium
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *Org1
                - *Org2
            Capabilities:
                <<: *ApplicationCapabilities
```

该配置文件中由 Organizations 定义了三个成员 Orderer Org、Org1、Org2，并且设置每个成员的MSP 目录的位置，从而允许在 orderer genesis 块中存储每个 Org 的根证书。通过这些信息实现与Orderer 服务通信的任何网络实体都可以验证其数字签名。而且为每个 PeerOrg 指定了相应的锚节点（Org1 组织中`peer0.org1.example.com`与 Org2 组织中`peer0.org2.example.com`）。

Orderer部分指定了Orderer节点的信息：

- OrdererType 指定了共识排序服务的实现方式，有两种选择（solo 及 Kafka）。
- Addresses 指定了 Orderer 节点的服务地址与端口号。
- BatchSize 指定了批处理大小，如最大交易数量，最大字节数及建议字节数。
Profiles 部分指定了两个模板：`TwoOrgsOrdererGenesis` 与 `TwoOrgsChannel` 。

* TwoOrgsOrdererGenesis 模板用来生成Orderer服务的初始区块文件，该模板由三部分组成：
    - Capabilities 指定通道的权限信息。

    - Orderer 指定了Orderer服务的信息（OrdererOrg）及权限信息。

    - Consortiums 定义了联盟组成成员（Org1&Org2）。

* TwoOrgsChannel 模板用来生成应用通道交易配置文件。由两部分组成：

    - Consortium 指定了联盟信息。

    - Application 指定了组织及权限信息。

## Orderer服务启动初始区块的创建
熟悉了配置文件中的相关信息后，就可以创建 Orderer 服务启动初始区块；确认当前在 `fabric-samples/first-network` 目录下。

指定使用 `configtx.yaml` 文件中定义的 TwoOrgsOrdererGenesis 模板,，生成 Orderer 服务系统通道的初始区块文件。
```
$ sudo ../bin/configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./channel-artifacts/genesis.block
```
命令执行后输出如下:
```
10:49:21.181 CST [common/tools/configtxgen] main -> INFO 001 Loading configuration
10:49:21.207 CST [msp] getMspConfig -> INFO 002 Loading NodeOUs
10:49:21.208 CST [msp] getMspConfig -> INFO 003 Loading NodeOUs
10:49:21.210 CST [common/tools/configtxgen] doOutputBlock -> INFO 004 Generating genesis block
10:49:21.211 CST [common/tools/configtxgen] doOutputBlock -> INFO 005 Writing genesis block
```
> 为了方便管理，我们将所有创建的文件都指定保存在默认的 channel-artifacts 目录下。

## 创建必须的应用通道交易配置文件
1. 指定通道名称的环境变量：
```
$ export CHANNEL_NAME=mychannel
```
> 因为我们后面的命令需要多次使用同一个通道名称，所以先指定一个通道名称将其设为环境变量，后期需要使用该通道名称时时只需要使用对应的环境变量名称即可。

2. 生成应用通道交易配置文件：

指定使用`configtx.yaml` 配置文件中的 TwoOrgsChannel 模板, 来生成新建通道的配置交易文件, TwoOrgsChannel 模板指定了 Org1 和 Org2 都属于后面新建的应用通道
```
$ sudo ../bin/configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID $CHANNEL_NAME
```
执行完成后输出如下内容：
```
11:13:24.984 CST [common/tools/configtxgen] main -> INFO 001 Loading configuration
11:13:24.992 CST [common/tools/configtxgen] doOutputChannelCreateTx -> INFO 002 Generating new channel configtx
11:13:24.993 CST [msp] getMspConfig -> INFO 003 Loading NodeOUs
11:13:24.994 CST [msp] getMspConfig -> INFO 004 Loading NodeOUs
11:13:25.016 CST [common/tools/configtxgen] doOutputChannelCreateTx -> INFO 005 Writing new channel tx
```

## 生成锚节点更新配置文件
同样基于 configtx.yaml 配置文件中的 TwoOrgsChannel 模板，为每个组织分别生成锚节点更新配置，且注意指定对应的组织名称。
```
$ sudo ../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP

$ sudo ../bin/configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org2MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org2MSP
```
上述所有命令执行完成后，`channel-artifacts`目录下会有4个被创建的文件，如下所示：
```
channel-artifacts/
├── channel.tx
├── genesis.block
├── Org1MSPanchors.tx
└── Org2MSPanchors.tx
```
## FAQ
### 可以查看生成的文件中的详细内容吗？

可以查看。我们可以在命令提示符下输入 `../bin/configtxgen -help` 命令（当前在 `fabric-samples/first-network` 目录下）查看相应的参数，会发现有 `inspectBlock`、`inspectChannelCreateTx` 两个参数。通过这两个参数即可查看相应的配置文件内容。
