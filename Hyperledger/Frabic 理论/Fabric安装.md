# Fabric安装
Fabric安装步骤如下：	
1. 安装Golang
2. 安装docker和dockercompose
3. 下载fabric相关镜像
4. 下载可执行文件
5. 编写docker-compose文件
6. 构建网络

Fabric安装方式有两种：

- 以提供脚本的方式，可以下载并安装 samples 和二进制文件到操作系统中，大大简化的安装过程
- 以源代码的方式进行本地编译安装

## 脚本安装
 1. 创建一个空目录并进入该目录
```
$ mkdir hyfa && cd hyfa
```
 2. 新建文件`bootstrap.sh`并添加内容
```
$ vim bootstrap.sh
```
将 https://github.com/hyperledger/fabric/blob/master/scripts/bootstrap.sh 中的内容拷贝保存退出。

或者执行以下命令直接拷贝脚本内容到指定文件
```
curl https://raw.githubusercontent.com/hyperledger/fabric/master/scripts/bootstrap.sh > bootstrap.sh
```

该 `bootstrap.sh` 可执行脚本文件的作用：

- 如果在当前目录中没有 `hyperledger/fabric-samples`，则从 github克隆` hyperledger/fabric-samples` 存储库
- 使用 `checkout` 签出对应指定的版本标签
- 将指定版本的`Hyperledger Fabric`平台特定的二进制文件和配置文件安装到 `fabric-samples` 存储库的根目录中
- 下载指定版本的 `Hyperledger Fabric docker` 镜像文件
- 将下载的 `docker` 镜像文件标记为 `"latest"`
 3. 赋予`bootstrap.sh`可执行权限并运行
```
$ chmod +x bootstrap.sh
```
或者直接使用命令执行
```
bash bootstrap.sh
```
 4. 执行`bootstrap.sh`
```
$ sudo ./bootstrap.sh 1.2.0
```
下载完成后，查看相关输出内容；如果下载有失败的镜像, 可再次执行 `$ sudo ./bootstrap.sh 1.2.0 `命令重新下载。

> 重新执行脚本命令对于已下载的Docker镜像文件不会再次重新下载。

安装完成后终端自动输出：
```
===> List out hyperledger docker images
hyperledger/fabric-javaenv     1.4.0               3d91b3bf7118        8 weeks ago         1.75 GB
hyperledger/fabric-javaenv     latest              3d91b3bf7118        8 weeks ago         1.75 GB
hyperledger/fabric-tools       1.4.0               0a44f4261a55        2 months ago        1.56 GB
hyperledger/fabric-tools       latest              0a44f4261a55        2 months ago        1.56 GB
hyperledger/fabric-ccenv       1.4.0               5b31d55f5f3a        2 months ago        1.43 GB
hyperledger/fabric-ccenv       latest              5b31d55f5f3a        2 months ago        1.43 GB
hyperledger/fabric-orderer     1.4.0               54f372205580        2 months ago        150 MB
hyperledger/fabric-orderer     latest              54f372205580        2 months ago        150 MB
hyperledger/fabric-peer        1.4.0               304fac59b501        2 months ago        157 MB
hyperledger/fabric-peer        latest              304fac59b501        2 months ago        157 MB
hyperledger/fabric-ca          1.4.0               1a804ab74f58        2 months ago        244 MB
hyperledger/fabric-ca          latest              1a804ab74f58        2 months ago        244 MB
hyperledger/fabric-zookeeper   0.4.14              d36da0db87a4        5 months ago        1.43 GB
hyperledger/fabric-zookeeper   latest              d36da0db87a4        5 months ago        1.43 GB
hyperledger/fabric-kafka       0.4.14              a3b095201c66        5 months ago        1.44 GB
hyperledger/fabric-kafka       latest              a3b095201c66        5 months ago        1.44 GB
hyperledger/fabric-couchdb     0.4.14              f14f97292b4c        5 months ago        1.5 GB
hyperledger/fabric-couchdb     latest              f14f97292b4c        5 months ago        1.5 GB
hyperledger/fabric-javaenv     1.3.0               2476cefaf833        5 months ago        1.7 GB
hyperledger/fabric-ca          1.3.0               5c6b20ba944f        5 months ago        244 MB
hyperledger/fabric-tools       1.3.0               c056cd9890e7        5 months ago        1.5 GB
hyperledger/fabric-ccenv       1.3.0               953124d80237        5 months ago        1.38 GB
hyperledger/fabric-orderer     1.3.0               f430f581b46b        5 months ago        145 MB
hyperledger/fabric-peer        1.3.0               f3ea63abddaa        5 months ago        151 MB
hyperledger/fabric-zookeeper   0.4.13              e62e0af39193        5 months ago        1.39 GB
hyperledger/fabric-kafka       0.4.13              4121ea662c47        5 months ago        1.4 GB
hyperledger/fabric-couchdb     0.4.13              1d3266e01e64        5 months ago        1.45 GB
hyperledger/fabric-tools       1.2.0               379602873003        8 months ago        1.51 GB
hyperledger/fabric-ccenv       1.2.0               6acf31e2d9a4        8 months ago        1.43 GB
hyperledger/fabric-orderer     1.2.0               4baf7789a8ec        8 months ago        152 MB
hyperledger/fabric-peer        1.2.0               82c262e65984        8 months ago        159 MB

```
### 添加环境变量（可选执行命令）
```
$ export PATH=<path to download location>/bin:$PATH
```
表示 `fabric-samples` 文件目录所在路径
例:  $ export PATH=$HOME/hyfa/fabric-samples/bin:$PATH


## 源码编译安装
1. 下载源码
首先，使用 mkdir 命令创建相应的目录，然后使用 git clone 命令将 Hyperledger Fabric 源代码克隆至该目录中：
```
$ mkdir -p $GOPATH/src/github.com/hyperledger/
$ cd $GOPATH/src/github.com/hyperledger/
$ git clone https://github.com/hyperledger/fabric.git
```
提示：也可以使用 go get 命令下载源码，需要手动创建相应的目录：
```
$ go get github.com/hyperledger/fabric
```
2. 然后使用 git checkout 命令切换至指定的分支：
```
$ cd $GOPATH/src/github.com/hyperledger/fabric/
$ git checkout -b v1.2.0 
```
3. 源码编译
源码下载完成之后，并不能直接使用，我们需要对其进行编译，生成所需要的各种节点及相应的工具。我们直接使用源码中提供的 Makefile 来进行编译，首先对 Makefile 文件进行编辑，指定相应的版本：
```
$ vim Makefile 
```
将文件中 BASE_VERSION、PREV_VERSION、CHAINTOOL_RELEASE、BASEIMAGE_RELEASE 的值进行修改，修改之后的内容为：
```
BASE_VERSION = 1.2.1
PREV_VERSION = 1.2.0
CHAINTOOL_RELEASE=1.1.1
BASEIMAGE_RELEASE=0.4.10
```
> 由于此文档说明基于frabic v1.2版本，故做此修改
4. 编译Orderer
```
$ cd $GOPATH/src/github.com/hyperledger/fabric/
$ make orderer
```
5. 编译Peer
```
$ make peer
```
查看 .build/bin 目录
```
$ ll .build/bin/
```

6. 编译生成相关工具
Hyperledger Fabric 除了 Orderer 和 Peer 之外，还为我们提供了在搭建网络环境时所需要的一系列辅助工具：

- configtxgen：生成初始区块及通道交易配置文件的工具
- cryptogen：生成组织结构及相应的的身份文件的工具
- configtxlator：将指定的文件在二进制格式与JSON格式之间进行转换
编译生成这些工具同样使用 make 即可：
```
$ make configtxgen 
$ make cryptogen 
$ make configtxlator 
```


7. 编译生成 docker 镜像
将当前用户添加到 docker 组
```
$ sudo usermod -aG docker kevin
```
添加成功后注销或重启系统。

8. 安装依赖的 libltdl-dev 库：
```
$ sudo apt-get install libltdl-dev
```
### 获取镜像方式一：

1. 编译生成docker镜像需要使用到Go的工具，所以我们需要通过 git clone 命令从 github.com 克隆至当前系统中：
```
$ mkdir -p $GOPATH/src/golang.org/x
$ cd $GOPATH/src/golang.org/x
$ git clone https://github.com/golang/tools.git
```
2. 执行命令后将指定的环境变量设置到用户的环境文件中(.bashrc)中
```
$ vim ~/.bashrc

export PATH=$PATH:$GOPATH/bin
```
执行 source 命令：
```
$ source ~/.bashrc
```
3. Fabric代码由Golang 构建，所以需要安装Go相关的工具，以方便开发和调试：
```
$ mkdir -p $GOPATH/src/golang.org/x
$ cd $GOPATH/src/golang.org/x
$ git clone https://github.com/golang/net.git
$ git clone https://github.com/golang/tools.git

$ cd $GOPATH
$ go get github.com/kardianos/govendor
$ go get github.com/onsi/ginkgo/ginkgo
$ go get github.com/golang/protobuf/protoc-gen-go
$ go get -u github.com/axw/gocov/...
$ go get -u github.com/AlekSi/gocov-xml
$ go get -u github.com/client9/misspell/cmd/misspell
$ go get -u golang.org/x/tools/cmd/goimports
$ go get -u github.com/golang/lint/golint
```
4. 将之前安装的 Go工具复制到Fabric目录：
```
$ cd $GOPATH/src/github.com/hyperledger/fabric/
$ mkdir -p .build/docker/gotools/bin
$ cp ~/go/bin/* .build/docker/gotools/bin
```
5. 使用 make docker 编译生成相关的 docker 镜像：
```
$ cd $GOPATH/src/github.com/hyperledger/fabric/
$ make docker
```
### 获取镜像方式二：

可以直接从Dockerhub拉取镜像，使用 docker pull 命令拉取指定的 docker 镜像
```
$ export FABRIC_TAG=1.2.0
$ export CA_TAG=1.2.0
$ export THIRDPARTY_IMAGE_VERSION=0.4.10

$ docker pull hyperledger/fabric-peer:$FABRIC_TAG \
&& docker pull hyperledger/fabric-orderer:$FABRIC_TAG \
&& docker pull hyperledger/fabric-ca:$CA_TAG \
&& docker pull hyperledger/fabric-tools:$FABRIC_TAG \
&& docker pull hyperledger/fabric-ccenv:$FABRIC_TAG \
&& docker pull hyperledger/fabric-baseimage:$THIRDPARTY_IMAGE_VERSION \
&& docker pull hyperledger/fabric-baseos:$THIRDPARTY_IMAGE_VERSION \
&& docker pull hyperledger/fabric-couchdb:$THIRDPARTY_IMAGE_VERSION \
&& docker pull hyperledger/fabric-kafka:$THIRDPARTY_IMAGE_VERSION \
&& docker pull hyperledger/fabric-zookeeper:$THIRDPARTY_IMAGE_VERSION
```

将已下载的镜像标记为最新
```
$ docker tag hyperledger/fabric-peer:$FABRIC_TAG hyperledger/fabric-peer \
&& docker tag hyperledger/fabric-orderer:$FABRIC_TAG hyperledger/fabric-orderer \
&& docker tag hyperledger/fabric-ca:$CA_TAG hyperledger/fabric-ca \
&& docker tag hyperledger/fabric-tools:$FABRIC_TAG hyperledger/fabric-tools \
&& docker tag hyperledger/fabric-ccenv:$FABRIC_TAG hyperledger/fabric-ccenv \
&& docker tag hyperledger/fabric-baseimage:$THIRDPARTY_IMAGE_VERSION hyperledger/fabric-baseimage \
&& docker tag hyperledger/fabric-baseos:$THIRDPARTY_IMAGE_VERSION hyperledger/fabric-baseos \
&& docker tag hyperledger/fabric-couchdb:$THIRDPARTY_IMAGE_VERSION hyperledger/fabric-couchdb \
&& docker tag hyperledger/fabric-kafka:$THIRDPARTY_IMAGE_VERSION hyperledger/fabric-kafka \
&& docker tag hyperledger/fabric-zookeeper:$THIRDPARTY_IMAGE_VERSION hyperledger/fabric-zookeeper
```

之后使用 docker images 命令查看相关的镜像信息：
```
$ docker images
```
## 总结
Hyperledger Fabric 可以有两种方式进行编译安装，第一种方式（bootstrap.sh脚本方式）进行环境的安装，优点是简单、方便，能够快速上手；第二种方式以 Fabric 源码方式进行编译，适合动手能力较强的人员，优点是可以对 Hyperledger Fabric 相关组件有深入的理解，但缺点是容易出现各种错误且修正比较麻烦。


## FAQ

### bootstrap.sh脚本中的内容是干什么用的？

脚本执行后将下载并提取设置网络所需的所有特定于平台的二进制文件，并保存在本地仓库中，

然后将Docker Hub中的Hyperledger Fabric docker镜像下载到本地Docker注册表中，并将其标记为”最新”。

### 下载Docker镜像文件速度特别慢，有什么好的解决方式？
配置Docker加速器
### 下载完成后，添加的环境变量有什么意义？

执行该命令后，意义为在系统中任何路径下使用Fabric相关的命令都可以让系统能够找到该命令并且顺利执行。后期我们会进入到Fabric目录中执行相应的命令，所以该环境变量也可以不添加。
