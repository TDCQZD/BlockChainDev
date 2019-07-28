# Hyperledger Fabric源码 解析

## 目录结构说明
```
fabric
├── bccsp           # bccsp：提供加密服务相关的功能
├── CHANGELOG.md 
├── ci.properties
├── cmd
├── CODE_OF_CONDUCT.md
├── common          # common：全局公用代码所在目录
├── CONTRIBUTING.md
├── core            # core：fabric核心功能代码目录
├── devenv
├── discovery       # discovery：动态发现网络服务模块
├── docker-env.mk
├── docs            # docs：说明文档所在目录
├── events          # events：事件相关的代码所在目录
├── examples        #examples：fabric提供的示例所在目录
├── Gopkg.lock
├── Gopkg.toml
├── gossip         # gossip：最终一致的算法实现
├── gotools.mk
├── idemix
├── images
├── integration     # integration：集成测试目录
├── LICENSE
├── Makefile
├── msp             # msp：提供会员服务相关的功能的代码所在目录
├── orderer         # orderer：消息订阅与分发实现功能的代码所在目录
├── peer            # peer：peer目录，提供对链码的操作、通道、节点等
├── protos          # protos：原型目录，定义各种原型和生成的对应的XXX.pb.go源码
├── README.md
├── release         # release_notes：各种版本信息说明所在的目录
├── release_notes
├── sampleconfig    # sampleconfig：示例配置文件的所在目录
├── scripts         # scripts：各种脚本文件所在的目录
├── settings.gradle
├── tox.ini
├── unit-test
└── vendor          # vendor：各种第三方依赖包所在目录
```

Hyperledger Fabric基础操作，下载好fabric-samples、Docker镜像文件、相应的二进制工具之后，在使用Hyperledger Fabric时，我们需要按照正确的步骤来执行：

1. 使用cryptogen工具创建相应的Network Artifacts

2. 使用configtxgen工具依次创建初始区块配置文件、通道配置事务文件、锚节点配置文件

3. 准备工作完成之后，使用指定的配置文件启动网络

4. 进入一个节点容器中，创建通道，将节点加入到创建的通道中

5. 安装、实例化链码，调用链码执行事务或查询

## 参考资料
* https://github.com/hyperledger/fabric
* https://hyperledger-fabric.readthedocs.io/en/latest/
* https://github.com/yinchengtsinghua/Fabric-Chinese
* https://www.chaindesk.cn/witbook/30
* https://blog.csdn.net/itcastcpp/article/category/7618299/17?




