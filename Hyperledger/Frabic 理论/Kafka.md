# 基于Kafka排序服务的实现
## 指定 Kafka 实现排序服务

### 1.配置 crypto-config.yaml
进入 fabric-samples/first-network 目录中
```
$ cd hyfa/fabric-samples/first-network/
```
将 `crypto-config.yaml` 配置文件备份为 `crypto-config_backup.yaml` ，然后编辑 `crypto-config.yaml` 文件，在 `OrdererOrgs.Specs` 中添加三个 orderer 节点，共计四个 orderer 节点
```
$ sudo cp crypto-config.yaml crypto-config_backup.yaml
$ sudo vim crypto-config.yaml
```
编辑后 OrdererOrgs 的具体内容如下（PeerOrgs 中的内容不变）：
```
# ---------------------------------------------------------------------------
# "OrdererOrgs" - Definition of organizations managing orderer nodes
# ---------------------------------------------------------------------------
OrdererOrgs:
  # ---------------------------------------------------------------------------
  # Orderer
  # ---------------------------------------------------------------------------
  - Name: Orderer
    Domain: example.com
    # ---------------------------------------------------------------------------
    # "Specs" - See PeerOrgs below for complete description
    # ---------------------------------------------------------------------------
    Specs:
      - Hostname: orderer
      - Hostname: orderer1
      - Hostname: orderer2
      - Hostname: orderer3
```

### 2.配置 configtx.yaml
将 `configtx.yaml` 配置文件备份为 `configtx_backup.yaml `，然后编辑 `configtx.yaml` 文件，在 `Orderer.Addresses` 中声明四个 orderer 节点信息， 将 `Orderer.OrdererType` 的值由默认的 solo 修改为 kafka，在 `Orderer.Addresses` 下添加另外的三个 orderer 节点信息，在 `Orderer.Kafka.Brokers` 中添加 kafka 集群服务器的信息
```
$ sudo cp configtx.yaml configtx_backup.yaml
$ sudo vim configtx.yaml
```
编辑后 Orderer 下的具体内容如下（其它部分不变）：
```
################################################################################
#
#   SECTION: Orderer
#
#   - This section defines the values to encode into a config transaction or
#   genesis block for orderer related parameters
#
################################################################################
Orderer: &OrdererDefaults

    # Orderer Type: The orderer implementation to start
    # Available types are "solo" and "kafka"
    OrdererType: kafka

    Addresses:
        - orderer.example.com:7050
        - orderer1.example.com:7050
        - orderer2.example.com:7050
        - orderer3.example.com:7050

    # Batch Timeout: The amount of time to wait before creating a batch
    BatchTimeout: 2s

    # Batch Size: Controls the number of messages batched into a block
    BatchSize:

        # Max Message Count: The maximum number of messages to permit in a batch
        MaxMessageCount: 10

        # Absolute Max Bytes: The absolute maximum number of bytes allowed for
        # the serialized messages in a batch.
        AbsoluteMaxBytes: 99 MB

        # Preferred Max Bytes: The preferred maximum number of bytes allowed for
        # the serialized messages in a batch. A message larger than the preferred
        # max bytes will result in a batch larger than preferred max bytes.
        PreferredMaxBytes: 512 KB

    Kafka:
        # Brokers: A list of Kafka brokers to which the orderer connects
        # NOTE: Use IP:port notation
        Brokers:
            - kafka0:9092
            - kafka1:9092
            - kafka2:9092
            - kafka3:9092

    # Organizations is the list of orgs which are defined as participants on
    # the orderer side of the network
    Organizations:
```
## 配置网络环境
### 1.配置 docker-compose-base.yaml
将 `base/docker-compose-base.yaml` 配置文件备份为 `base/docker-compose-base_backup.yaml` ，然后编辑 `base/docker-compose-base.yaml`
```
$ sudo cp base/docker-compose-base.yaml base/docker-compose-base_backup.yaml
$ sudo vim base/docker-compose-base.yaml
```

在文件中添加 zookeeper 节点信息、kafka 节点信息及修改 orderer 节点的信息，peer 节点信息不变，详细配置信息如下：
```
  zookeeper:
    image: hyperledger/fabric-zookeeper
    environment: 
      - ZOO_SERVERS=server.1=zookeeper1:2888:3888 server.2=zookeeper2:2888:3888 server.3=zookeeper3:2888:3888
    ports:
      - '2181'
      - '2888'
      - '3888'

  kafka:
    image: hyperledger/fabric-kafka
    environment:
      - KAFKA_LOG_RETENTION_MS=-1
      - KAFKA_MESSAGE_MAX_BYTES=103809024
      - KAFKA_REPLICA_FETCH_MAX_BYTES=103809024
      - KAFKA_UNCLEAN_LEADER_ELECTION_ENABLE=false      
      - KAFKA_MIN_INSYNC_REPLICAS=2
      - KAFKA_DEFAULT_REPLICATION_FACTOR=3
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper1:2181,zookeeper2:2181,zookeeper3:2181
    ports:
      - '9092'    

  orderer.example.com:
    container_name: orderer.example.com
    image: hyperledger/fabric-orderer
    environment:
      - ORDERER_GENERAL_LOGLEVEL=debug
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # kafka      
      - CONFIGTX_ORDERER_ORDERERTYPE=kafka
      - CONFIGTX_ORDERER_KAFKA_BROKERS=[kafka0:9092,kafka1:9092,kafka2:9092,kafka3:9092]
      - ORDERER_KAFKA_RETRY_SHORTINTERVAL=1s
      - ORDERER_KAFKA_RETRY_SHORTTOTAL=30s
      - ORDERER_KAFKA_VERBOSE=true    
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp:/var/hyperledger/orderer/msp
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/tls/:/var/hyperledger/orderer/tls
    ports:
      - '7050'

  orderer1.example.com:
    container_name: orderer1.example.com
    image: hyperledger/fabric-orderer
    environment:
      - ORDERER_GENERAL_LOGLEVEL=debug
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # kafka      
      - CONFIGTX_ORDERER_ORDERERTYPE=kafka
      - CONFIGTX_ORDERER_KAFKA_BROKERS=[kafka0:9092,kafka1:9092,kafka2:9092,kafka3:9092]
      - ORDERER_KAFKA_RETRY_SHORTINTERVAL=1s
      - ORDERER_KAFKA_RETRY_SHORTTOTAL=30s
      - ORDERER_KAFKA_VERBOSE=true
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/msp:/var/hyperledger/orderer/msp
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer1.example.com/tls/:/var/hyperledger/orderer/tls
    ports:
      - '7050'

  orderer2.example.com:
    container_name: orderer2.example.com
    image: hyperledger/fabric-orderer
    environment:
      - ORDERER_GENERAL_LOGLEVEL=debug
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # kafka      
      - CONFIGTX_ORDERER_ORDERERTYPE=kafka
      - CONFIGTX_ORDERER_KAFKA_BROKERS=[kafka0:9092,kafka1:9092,kafka2:9092,kafka3:9092]
      - ORDERER_KAFKA_RETRY_SHORTINTERVAL=1s
      - ORDERER_KAFKA_RETRY_SHORTTOTAL=30s
      - ORDERER_KAFKA_VERBOSE=true
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/msp:/var/hyperledger/orderer/msp
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/:/var/hyperledger/orderer/tls
    ports:
      - '7050'

  orderer3.example.com:
    container_name: orderer3.example.com
    image: hyperledger/fabric-orderer
    environment:
      - ORDERER_GENERAL_LOGLEVEL=debug
      - ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
      - ORDERER_GENERAL_GENESISMETHOD=file
      - ORDERER_GENERAL_GENESISFILE=/var/hyperledger/orderer/orderer.genesis.block
      - ORDERER_GENERAL_LOCALMSPID=OrdererMSP
      - ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp
      # kafka      
      - CONFIGTX_ORDERER_ORDERERTYPE=kafka
      - CONFIGTX_ORDERER_KAFKA_BROKERS=[kafka0:9092,kafka1:9092,kafka2:9092,kafka3:9092]
      - ORDERER_KAFKA_RETRY_SHORTINTERVAL=1s
      - ORDERER_KAFKA_RETRY_SHORTTOTAL=30s
      - ORDERER_KAFKA_VERBOSE=true
      # enabled TLS
      - ORDERER_GENERAL_TLS_ENABLED=true
      - ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key
      - ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt
      - ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric
    command: orderer
    volumes:
      - ../channel-artifacts/genesis.block:/var/hyperledger/orderer/orderer.genesis.block
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/msp:/var/hyperledger/orderer/msp
      - ../crypto-config/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/:/var/hyperledger/orderer/tls
    ports:
      - '7050'
```
### 2.配置 docker-compose-cli.yaml
将 `docker-compose-cli.yaml` 配置文件备份为 `docker-compose-cli_backup.yaml`，然后编辑 `docker-compose-cli.yaml` 配置文件
```
$ sudo cp docker-compose-cli.yaml docker-compose-cli_backup.yaml
$ sudo vim docker-compose-cli.yaml
```
在文件中添加三个 zookeeper 节点、四个 kafka 节点及相应的 orderer 节点的信息，具体配置内容如下：
```
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

version: '2'

volumes:
  orderer.example.com:
  orderer1.example.com:
  orderer2.example.com:
  orderer3.example.com:
  peer0.org1.example.com:
  peer1.org1.example.com:
  peer0.org2.example.com:
  peer1.org2.example.com:

networks:
  byfn:

services:

  zookeeper1:
    container_name: zookeeper1
    extends:
      file:   base/docker-compose-base.yaml
      service: zookeeper
    environment:
      - ZOO_MY_ID=1
    networks:
      - byfn

  zookeeper2:
    container_name: zookeeper2
    extends:
      file:   base/docker-compose-base.yaml
      service: zookeeper
    environment:
      - ZOO_MY_ID=2
    networks:
      - byfn

  zookeeper3:
    container_name: zookeeper3
    extends:
      file:   base/docker-compose-base.yaml
      service: zookeeper
    environment:
      - ZOO_MY_ID=3
    networks:
      - byfn

  kafka0:
    container_name: kafka0
    extends:
      file:   base/docker-compose-base.yaml
      service: kafka
    environment:
      - KAFKA_BROKER_ID=0      
    depends_on:
      - zookeeper1
      - zookeeper2
      - zookeeper3
    networks:
      - byfn

  kafka1:
    container_name: kafka1
    extends:
      file:   base/docker-compose-base.yaml
      service: kafka
    environment:
      - KAFKA_BROKER_ID=1
    depends_on:
      - zookeeper1
      - zookeeper2
      - zookeeper3
    networks:
      - byfn

  kafka2:
    container_name: kafka2
    extends:
      file:   base/docker-compose-base.yaml
      service: kafka
    environment:
      - KAFKA_BROKER_ID=2
    depends_on:
      - zookeeper1
      - zookeeper2
      - zookeeper3
    networks:
      - byfn

  kafka3:
    container_name: kafka3
    extends:
      file:   base/docker-compose-base.yaml
      service: kafka
    environment:
      - KAFKA_BROKER_ID=3
    depends_on:
      - zookeeper1
      - zookeeper2
      - zookeeper3
    networks:
      - byfn

  orderer.example.com:
    extends:
      file:   base/docker-compose-base.yaml
      service: orderer.example.com
    container_name: orderer.example.com
    depends_on:
      - kafka0
      - kafka1
      - kafka2
      - kafka3
    networks:
      - byfn

  orderer1.example.com:
    extends:
      file:   base/docker-compose-base.yaml
      service: orderer1.example.com
    container_name: orderer1.example.com
    depends_on:
      - kafka0
      - kafka1
      - kafka2
      - kafka3
    networks:
      - byfn

  orderer2.example.com:
    extends:
      file:   base/docker-compose-base.yaml
      service: orderer2.example.com
    container_name: orderer2.example.com
    depends_on:
      - kafka0
      - kafka1
      - kafka2
      - kafka3
    networks:
      - byfn

  orderer3.example.com:
    extends:
      file:   base/docker-compose-base.yaml
      service: orderer3.example.com
    container_name: orderer3.example.com   
    depends_on:
      - kafka0
      - kafka1
      - kafka2
      - kafka3
    networks:
      - byfn      

  peer0.org1.example.com:
    container_name: peer0.org1.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org1.example.com
    networks:
      - byfn

  peer1.org1.example.com:
    container_name: peer1.org1.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org1.example.com
    networks:
      - byfn

  peer0.org2.example.com:
    container_name: peer0.org2.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer0.org2.example.com
    networks:
      - byfn

  peer1.org2.example.com:
    container_name: peer1.org2.example.com
    extends:
      file:  base/docker-compose-base.yaml
      service: peer1.org2.example.com
    networks:
      - byfn

  cli:
    container_name: cli
    image: hyperledger/fabric-tools:$IMAGE_TAG
    tty: true
    stdin_open: true
    environment:
      - GOPATH=/opt/gopath
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      #- CORE_LOGGING_LEVEL=DEBUG
      - CORE_LOGGING_LEVEL=INFO
      - CORE_PEER_ID=cli
      - CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      - CORE_PEER_LOCALMSPID=Org1MSP
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    working_dir: /opt/gopath/src/github.com/hyperledger/fabric/peer
    command: /bin/bash
    volumes:
      - /var/run/:/host/var/run/
      - ./../chaincode/:/opt/gopath/src/github.com/chaincode
      - ./crypto-config:/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/
      - ./scripts:/opt/gopath/src/github.com/hyperledger/fabric/peer/scripts/
      - ./channel-artifacts:/opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts
    depends_on:
      - orderer.example.com
      - orderer1.example.com
      - orderer2.example.com
      - orderer3.example.com
      - peer0.org1.example.com
      - peer1.org1.example.com
      - peer0.org2.example.com
      - peer1.org2.example.com
    networks:
      - byfn
```

### 启动网络
1. 关闭并清理网络环境
```
$ sudo ./byfn.sh down
```
3. 使用 byfn.sh 生成组织结构及身份证书及所需的各项配置文件
```
$ sudo ./byfn.sh generate
```
3. 启动网络
```
$ sudo docker-compose -f docker-compose-cli.yaml up
```
查看活动容器：
```
$ sudo docker ps
```
可发现发三个 zookeeper 节点、四个 kafka 节点、四个 orderer 节点、四个 peer 节点都已经处于活动状态.



4. 打开一个新的终端2窗口：

进入 zookeeper1 容器
```
# sudo docker exec -it zookeeper1 bash
```
使用 ifconfig 命令查看容器的 IP 地址之后退出


进入 kafka0 容器并进入 kafka HOME目录
```
$ sudo docker exec -it kafka0 bash
# cd opt/kafka/
```
查看 kafka 自动创建的 topic
```
# bin/kafka-topics.sh --list --zookeeper 172.18.0.5:2181

testchainid
```
5. 创建通道

返回终端 １ 窗口，进入 cli 容器
```
$ sudo docker exec -it cli bash
```
设置环境变量
```
$ export CHANNEL_NAME=mychannel
```
创建通道
```
$ peer channel create -o orderer.example.com:7050 -c $CHANNEL_NAME -f ./channel-artifacts/channel.tx --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
```
终端输出如下：
```
[channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 002 Got status: &{SERVICE_UNAVAILABLE}
[channelCmd] InitCmdFactory -> INFO 003 Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 004 Got status: &{SERVICE_UNAVAILABLE}
[channelCmd] InitCmdFactory -> INFO 005 Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 006 Got status: &{SERVICE_UNAVAILABLE}
[channelCmd] InitCmdFactory -> INFO 007 Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 008 Got status: &{SERVICE_UNAVAILABLE}
[channelCmd] InitCmdFactory -> INFO 009 Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 00a Got status: &{SERVICE_UNAVAILABLE}
[channelCmd] InitCmdFactory -> INFO 00b Endorser and orderer connections initialized
[cli/common] readBlock -> INFO 00c Received block: 0
```

创建通道之后在终端 2 窗口的 kafka 容器中再次查看 topic 信息， 发现 kafka 又自动创建了一个新的名为 mychannel 的 topic
```
# bin/kafka-topics.sh --list --zookeeper 172.18.0.5:2181

mychannel
testchainid
```
返回终端 １ 窗口的 cli 容器中，将当前代表的 peer0.org1.example.com 节点加入到应用通道中
```
$ peer channel join -b mychannel.block
```
终端输出如下：
```
[channelCmd] InitCmdFactory -> INFO 001 Endorser and orderer connections initialized
[channelCmd] executeJoin -> INFO 002 Successfully submitted proposal to join channel
```
## 测试
1. 安装链码
```
$ peer chaincode install -n mycc -v 1.0 -p github.com/chaincode/chaincode_example02/go/
```
安装成功显示内容如下：
```
[chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
[chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
[chaincodeCmd] install -> INFO 003 Installed remotely response:<status:200 payload:"OK" >
```
2. 实例化链码
```
$ peer chaincode instantiate -o orderer.example.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C $CHANNEL_NAME -n mycc -v 1.0 -c '{"Args":["init","a", "100", "b","200"]}' -P "OR ('Org1MSP.peer','Org2MSP.peer')"
```
实例化成功显示如下：
```
[chaincodeCmd] checkChaincodeCmdParams -> INFO 001 Using default escc
[chaincodeCmd] checkChaincodeCmdParams -> INFO 002 Using default vscc
```
3. 查询链码
```
$ peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
```
返回查询结果：100

4. 调用链码
```
$ peer chaincode invoke -o orderer.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C $CHANNEL_NAME -n mycc -c '{"Args":["invoke","a","b","10"]}'
```
返回调用结果：
```
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200
```
5. 查询转账之后的结果
```
$ peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
```
返回查询结果：90

orderer 节点以集群的方式运行，在集群环境下，客户端将交易发送到任何一个 orderer 排序节点都可以，如下所示，指定Orderer2节点。

6. 调用链码
```
$ peer chaincode invoke -o orderer2.example.com:7050  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer2.example.com/msp/tlscacerts/tlsca.example.com-cert.pem  -C $CHANNEL_NAME -n mycc -c '{"Args":["invoke","a","b","10"]}'
```
返回调用结果：
```
[chaincodeCmd] chaincodeInvokeOrQuery -> INFO 001 Chaincode invoke successful. result: status:200
```
再次查询链码
```
$ peer chaincode query -C $CHANNEL_NAME -n mycc -c '{"Args":["query","a"]}'
```
返回查询结果：80

## FAQ
### 之前从未使用过 Kafka / Zookeeper 集群，我想使用基于 Kafka 的 Ordering 服务。我该怎么办？

如果之前从未使用过 Kafka，那么应该先从官方网站学习一下 [Kafka快速入门指南](https://kafka.apache.org/quickstart)

### 为什么使用基于 Kafka 的集群服务中必须使用 ZooKeeper？

Zookeeper 是一个开源的为分布式应用提供一致性服务的软件，Kafka 在内部使用 Zookeeper 来进行 broker 之间的协调。更多的内容，请查看官方提供的相关说明文档。
