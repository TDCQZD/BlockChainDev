# 生成组织结构与身份证书
自动化脚本 `byfn.sh `可以自动帮我们创建网络环境运行时所需的所有内容，但在一些特定情况之下，我们根据不同的需求需要自定义一些设置。
## 与组织结构及身份证书关联的配置文件
如果要生成 Hyperledger Fabric 网络环境中所需的组织结构及身份证书信息，组织中的成员提供节点服务，相应的证书代表身份，可以在实体间进行通信以及交易时进行签名与验证。生成过程依赖`crypto-config.yaml` 配置文件，该配置文件路径 ：`fabric-samples/first-network/crypto-config.yaml`

crypto-config.yaml 配置文件包含如下内容：

```
OrdererOrgs:
  - Name: Orderer    # Orderer的名称
    Domain: example.com    # 域名
    Specs:
      - Hostname: orderer    # hostname + Domain的值组成Orderer节点的完整域名

PeerOrgs:
  - Name: Org1
    Domain: org1.example.com
    EnableNodeOUs: true        # 在msp下生成config.yaml文件
    Template:
      Count: 2
    Users:
      Count: 1

  - Name: Org2
    Domain: org2.example.com
    EnableNodeOUs: true
    Template:
      Count: 2
    Users:
      Count: 1
```

该配置文件指定了 OrdererOrgs 及 PeerOrgs 两个组织信息。在 PeerOrgs 配置信息中指定了 Org1 与 Org2 两个组织。每个组织使用 Template 属性下的 Count 指定了两个节点， Users 属性下的 Count 指定了一个用户。

组织信息中还包含组织名称、域名、节点数量、及新增的用户数量等相关信息。

Peer 节点的域名组成为` peer + 起始数字0 + Domain`，如 Org1 中的两个 peer 节点的完整域名为：
```
peer0.org1.example.com，
peer1.org1.example.com。
```
## 如何生成组织结构及身份证书
下面我们来实现组织结构及身份证书的生成。在 Hyperledger Fabric 中提供了一个工具 cryptogen ，该工具根据指定的配置文件实现标准化自动生成。执行过程如下：

进入 `fabric-samples/first-network` 目录：
```
$ cd hyfa/fabric-samples/first-network/
```
使用 `cryptogen` 工具为Hyperledger Fabric网络生成指定拓扑结构的组织关系和身份证书
```
$ sudo ../bin/cryptogen generate --config=./crypto-config.yaml
```
执行成功会有如下输出：
```
org1.example.com
org2.example.com
```
证书和密钥（即MSP材料）将被输出到当前一个名为 `crypto-config` 的目录中，该目录下有两个子目录：

- ordererOrganizations 子目录下包括构成 Orderer 组织(1个 Orderer 节点)的身份信息

- peerOrganizations 子目录下为所有的 Peer 节点组织(2个组织，4个节点)的相关身份信息. 其中最关键的是 MSP 目录, 代表了实体的身份信息

Cryptogen 工具按照配置文件中指定的结构生成了对应的组织和密钥、及相关的证书文件

生成的 crypto-config 的完整结构如下：
```
crypto-config
├── ordererOrganizations
│   └── example.com
│       ├── ca
│       │   ├── c674f2c6028c39dd8d8fddb5e0ed4b94c0e4a620691ec70bd8e3cf3c1a3c904d_sk
│       │   └── ca.example.com-cert.pem
│       ├── msp
│       │   ├── admincerts
│       │   │   └── Admin@example.com-cert.pem
│       │   ├── cacerts
│       │   │   └── ca.example.com-cert.pem
│       │   └── tlscacerts
│       │       └── tlsca.example.com-cert.pem
│       ├── orderers
│       │   └── orderer.example.com
│       │       ├── msp
│       │       │   ├── admincerts
│       │       │   │   └── Admin@example.com-cert.pem
│       │       │   ├── cacerts
│       │       │   │   └── ca.example.com-cert.pem
│       │       │   ├── keystore
│       │       │   │   └── 4279c65c46e367e2dc0f83127a2fe5bf398ddf84010e18b070de3adfdc638158_sk
│       │       │   ├── signcerts
│       │       │   │   └── orderer.example.com-cert.pem
│       │       │   └── tlscacerts
│       │       │       └── tlsca.example.com-cert.pem
│       │       └── tls
│       │           ├── ca.crt
│       │           ├── server.crt
│       │           └── server.key
│       ├── tlsca
│       │   ├── ab8411233f3d73dea3f15f9618a1c5e06919135ccc78b292208434717c13d2d0_sk
│       │   └── tlsca.example.com-cert.pem
│       └── users
│           └── Admin@example.com
│               ├── msp
│               │   ├── admincerts
│               │   │   └── Admin@example.com-cert.pem
│               │   ├── cacerts
│               │   │   └── ca.example.com-cert.pem
│               │   ├── keystore
│               │   │   └── 5de8388b453294c5fa6c55eb38f253b81d0832e196543e41d153db0e6cd59d5d_sk
│               │   ├── signcerts
│               │   │   └── Admin@example.com-cert.pem
│               │   └── tlscacerts
│               │       └── tlsca.example.com-cert.pem
│               └── tls
│                   ├── ca.crt
│                   ├── client.crt
│                   └── client.key
└── peerOrganizations
    ├── org1.example.com
    │   ├── ca
    │   │   ├── b8ec81e19fcd99d304e24b25981236671fe55cb230938be9a08ccc82b08eba43_sk
    │   │   └── ca.org1.example.com-cert.pem
    │   ├── msp
    │   │   ├── admincerts
    │   │   │   └── Admin@org1.example.com-cert.pem
    │   │   ├── cacerts
    │   │   │   └── ca.org1.example.com-cert.pem
    │   │   ├── config.yaml
    │   │   └── tlscacerts
    │   │       └── tlsca.org1.example.com-cert.pem
    │   ├── peers
    │   │   ├── peer0.org1.example.com
    │   │   │   ├── msp
    │   │   │   │   ├── admincerts
    │   │   │   │   │   └── Admin@org1.example.com-cert.pem
    │   │   │   │   ├── cacerts
    │   │   │   │   │   └── ca.org1.example.com-cert.pem
    │   │   │   │   ├── config.yaml
    │   │   │   │   ├── keystore
    │   │   │   │   │   └── ba8156132aac14d0904e5d14fa5f13e1497509223d4fa100064f91f4f2a3d15f_sk
    │   │   │   │   ├── signcerts
    │   │   │   │   │   └── peer0.org1.example.com-cert.pem
    │   │   │   │   └── tlscacerts
    │   │   │   │       └── tlsca.org1.example.com-cert.pem
    │   │   │   └── tls
    │   │   │       ├── ca.crt
    │   │   │       ├── server.crt
    │   │   │       └── server.key
    │   │   └── peer1.org1.example.com
    │   │       ├── msp
    │   │       │   ├── admincerts
    │   │       │   │   └── Admin@org1.example.com-cert.pem
    │   │       │   ├── cacerts
    │   │       │   │   └── ca.org1.example.com-cert.pem
    │   │       │   ├── config.yaml
    │   │       │   ├── keystore
    │   │       │   │   └── a37b7a22d765b2e9cc7804bc883235cc1981b24182bb4d3403fc82698159233f_sk
    │   │       │   ├── signcerts
    │   │       │   │   └── peer1.org1.example.com-cert.pem
    │   │       │   └── tlscacerts
    │   │       │       └── tlsca.org1.example.com-cert.pem
    │   │       └── tls
    │   │           ├── ca.crt
    │   │           ├── server.crt
    │   │           └── server.key
    │   ├── tlsca
    │   │   ├── 9d76be67281dbe32018ee5e6c1595a4a0da1645c81f4ed7680481c521a31cdbc_sk
    │   │   └── tlsca.org1.example.com-cert.pem
    │   └── users
    │       ├── Admin@org1.example.com
    │       │   ├── msp
    │       │   │   ├── admincerts
    │       │   │   │   └── Admin@org1.example.com-cert.pem
    │       │   │   ├── cacerts
    │       │   │   │   └── ca.org1.example.com-cert.pem
    │       │   │   ├── keystore
    │       │   │   │   └── 493e7191fa4b9f3fce46e2fb9bbf6f0ec077ed217c7a94a5ee72a93a22f8a2bd_sk
    │       │   │   ├── signcerts
    │       │   │   │   └── Admin@org1.example.com-cert.pem
    │       │   │   └── tlscacerts
    │       │   │       └── tlsca.org1.example.com-cert.pem
    │       │   └── tls
    │       │       ├── ca.crt
    │       │       ├── client.crt
    │       │       └── client.key
    │       └── User1@org1.example.com
    │           ├── msp
    │           │   ├── admincerts
    │           │   │   └── User1@org1.example.com-cert.pem
    │           │   ├── cacerts
    │           │   │   └── ca.org1.example.com-cert.pem
    │           │   ├── keystore
    │           │   │   └── 63d2bb7a402b6bc694ff242471d86a6512bb69726d8c3dc6c3d91952901abe85_sk
    │           │   ├── signcerts
    │           │   │   └── User1@org1.example.com-cert.pem
    │           │   └── tlscacerts
    │           │       └── tlsca.org1.example.com-cert.pem
    │           └── tls
    │               ├── ca.crt
    │               ├── client.crt
    │               └── client.key
    └── org2.example.com
        ├── ca
        │   ├── a86cfdc1ad188e7abc301cd21d7820fe1fa6a3cf81cdc25942405d632c1a4717_sk
        │   └── ca.org2.example.com-cert.pem
        ├── msp
        │   ├── admincerts
        │   │   └── Admin@org2.example.com-cert.pem
        │   ├── cacerts
        │   │   └── ca.org2.example.com-cert.pem
        │   ├── config.yaml
        │   └── tlscacerts
        │       └── tlsca.org2.example.com-cert.pem
        ├── peers
        │   ├── peer0.org2.example.com
        │   │   ├── msp
        │   │   │   ├── admincerts
        │   │   │   │   └── Admin@org2.example.com-cert.pem
        │   │   │   ├── cacerts
        │   │   │   │   └── ca.org2.example.com-cert.pem
        │   │   │   ├── config.yaml
        │   │   │   ├── keystore
        │   │   │   │   └── 6321e899b8467adca9a795cb1006789e2fecd168c162157aec895a54e86c7ff7_sk
        │   │   │   ├── signcerts
        │   │   │   │   └── peer0.org2.example.com-cert.pem
        │   │   │   └── tlscacerts
        │   │   │       └── tlsca.org2.example.com-cert.pem
        │   │   └── tls
        │   │       ├── ca.crt
        │   │       ├── server.crt
        │   │       └── server.key
        │   └── peer1.org2.example.com
        │       ├── msp
        │       │   ├── admincerts
        │       │   │   └── Admin@org2.example.com-cert.pem
        │       │   ├── cacerts
        │       │   │   └── ca.org2.example.com-cert.pem
        │       │   ├── config.yaml
        │       │   ├── keystore
        │       │   │   └── e90b33aae87ca50849e91b243188c41f7b6de8a082602ea67b94deabff710a83_sk
        │       │   ├── signcerts
        │       │   │   └── peer1.org2.example.com-cert.pem
        │       │   └── tlscacerts
        │       │       └── tlsca.org2.example.com-cert.pem
        │       └── tls
        │           ├── ca.crt
        │           ├── server.crt
        │           └── server.key
        ├── tlsca
        │   ├── 5b19cc3c436ba95d25047525aa73b58f151a267cec6b365ce11c659740296134_sk
        │   └── tlsca.org2.example.com-cert.pem
        └── users
            ├── Admin@org2.example.com
            │   ├── msp
            │   │   ├── admincerts
            │   │   │   └── Admin@org2.example.com-cert.pem
            │   │   ├── cacerts
            │   │   │   └── ca.org2.example.com-cert.pem
            │   │   ├── keystore
            │   │   │   └── 73aed893a0a298db80bdd8bf85fe54483cdfe70529e00fc641e09ac1ce97dbd5_sk
            │   │   ├── signcerts
            │   │   │   └── Admin@org2.example.com-cert.pem
            │   │   └── tlscacerts
            │   │       └── tlsca.org2.example.com-cert.pem
            │   └── tls
            │       ├── ca.crt
            │       ├── client.crt
            │       └── client.key
            └── User1@org2.example.com
                ├── msp
                │   ├── admincerts
                │   │   └── User1@org2.example.com-cert.pem
                │   ├── cacerts
                │   │   └── ca.org2.example.com-cert.pem
                │   ├── keystore
                │   │   └── 74280f530cdea1e89bfd28ff9c576942eeceb4e4a64b9b58a0d6ea821cd2c8ea_sk
                │   ├── signcerts
                │   │   └── User1@org2.example.com-cert.pem
                │   └── tlscacerts
                │       └── tlsca.org2.example.com-cert.pem
                └── tls
                    ├── ca.crt
                    ├── client.crt
                    └── client.key
```

在生成的目录结构中最关键的是各个资源下的 msp 目录内容，存储了生成的代表 MSP 实体身份的各种证书文件，一般包括：

* admincerts ：管理员的身份证书文件
* cacerts ：信任的根证书文件
* keystore ：节点的签名私钥文件
* signcerts ：节点的签名身份证书文件
* tlscacerts:：TLS 连接用的证书
* intermediatecerts （可选）：信任的中间证书
* crls （可选）：证书撤销列表
* config.yaml （可选）：记录OrganizationalUnitldentifiers 信息，包括根证书位置和ID信息
这些身份文件随后可以分发到对应的Orderer 节点和Peer 节点上，并放到对应的MSP路径下，用于签名验证使用。

## FAQ
### 组织结构中可以添加新的组织吗？

生成组织结构前，可以通过 crypto-config.yaml 配置文件指定具体的组织信息，如果是多个组织，只需要在该配置文件中 PeerOrgs 节点最后添加新的组织信息即可。

### Org 组织中可以指定多个 Peer 节点吗？

可以指定多个节点，只需要修改 Template 下的 Count 值即可（该值代表组织下有几个节点）。

### 组织结构生成之后可以随时添加或修改吗？

目前，Hyperledger Fabric 无法对已生成的组织结构进行修改；所以需要提前做好规划。在未来会支持对组织结构的节点进行动态修改。

​
