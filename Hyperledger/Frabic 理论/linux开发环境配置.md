# 开发环境配置

## 操作系统

- linux

## 安装所需工具

### Git
```
$ sudo apt update
$ sudo apt install git
```
### 安装CURL

```
$ sudo apt install curl
```

### 安装Docker
查看系统中是否已经安装Docker：
```
$ docker --version
```
使用如下命令安装Docker的最新版本：
```
$ sudo apt update
$ sudo apt install docker.io
```
查看Docker版本信息
```
$ docker --version
```


### 安装Docker-compose
确定系统中是否已安装docker－compose工具
```
$ docker-compose --version
```
如系统提示未安装，则使用如下命令安装docker-compose工具：
```
$ sudo apt install docker-compose
```
安装成功后，查看Docker－Compose版本信息
```
$ docker-compose --version

```

### 安装Golang
Fabric1.0.0版本要求Go语言1.7以上版本，Fabric1.1.0版本要求Go1.9以上版本，Fabric1.2.0版本要求Go1.10以上版本. 所以从官方下载最新版本的Golang。

 **1.下载Golang**

使用wget工具下载Golang的最新版本压缩包文件 go1.11.4.linux-amd64.tar.gz
```
$ wget https://dl.google.com/go/go1.11.4.linux-amd64.tar.gz

```
其它系统可以在Golang官方： https://golang.org/dl/ 下载页面中查找相应的安装包下载安装。

**2.解压文件**

使用 tar 命令将下载后的压缩包文件解压到指定的 /usr/local/ 路径下
```
$ sudo tar -zxvf go1.10.3.linux-amd64.tar.gz -C /usr/local/
```
如果在解压过程中出现EOF相关错误：说明下载的tar压缩包文件有问题， 如没有下载完整或压缩包数据损坏。请删除后重新下载并解压至指定的目录中。

**配置环境变量**

解压后，Golang可以让系统的所有用户正常使用， 所以我们使用 vim 文件编辑工具打开系统的 profile 文件进行编辑：
```
$ sudo vim /etc/profile
```
如果只想让当前登录用户使用Golang， 其它用户不能使用， 则编辑当前用户$HOME目录下的 .bashrc 或 .profile 文件， 在该文件中添加相应的环境变量即可。

在profile文件最后添加如下内容:
```
export GOPATH=$HOME/go
export GOROOT=/opt/go
export PATH=$GOROOT/bin:$PATH
```
使用 source 命令，使刚刚添加的配置信息生效：
```
$ source /etc/profile
```
通过 go version命令验证是否成功：

```
$ go version
```
### 安装Node及npm

**安装nvm**

- nvm：Node Version Manager，Node.js的版本管理软件， 可以根据不同的需求场景方便地随时在Node.js的各个版本之间进行切换。

由于Node.js版本更新较快，且各版本之间差异较大；直接从Node官网安装可能需要很长时间，而且中间可能会因为网络访问及数据传输原因造成下载中断或失败等问题。为了方便安装及后期管理Node.js的版本，我们首先需要在系统中安装nvm管理工具。

使用如下命令安装nvm：

```
$ sudo apt update
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.10/install.sh | bash

$ export NVM_DIR="$HOME/.nvm"
$ [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```
**安装Node**

nvm工具安装并配置成功后， 可以直接使用nvm命令安装Node；且Node安装成功后，nvm会自动将npm工具进行安装。

使用如下命令安装Node：

```
$ nvm install v8.11.1
```
> 安装Node时须注意：安装版本为8.9.x或10.X以上的Node.js，Fabric目前不支持9.x系列的Node.js版本.

**检查Node及npm版本**

```
$ node -v && npm -v
```


## FAQ
1. Fabric只支持Ubuntu系统吗？

Hyperledger Fabric支持常见的Linux相关系统（如：Debian、CentOS等）和MacOS。

由于不同操作系统或各系统的不同版本可能会造成一些问题， 所以在此推荐使用的操作系统为64位的 Ubuntu 16.04 LTS。

2. cURL是什么，有什么作用？

cURL是一个可以终端命令行下使用URL语法执行的开源文件传输工具。cURL支持SSL证书，HTTP POST，HTTP PUT，FTP上传，基于HTTP表单的上传，代理，HTTP / 2，cookie，用户+密码认证（Basic，Plain，Digest，CRAM-MD5，NTLM，Negotiate和Kerberos），文件转移简历，代理隧道等。

3. 为什么要安装Docker及Docker-compose?

Docker是一个开源的应用容器引擎， 可以为应用创建一个轻量级的、可移植的容器。

Fabric环境依赖于Docker提供的容器服务，所以必须安装Docker环境；推荐使用1.13或更高版本。

Compose是一个用于定义和运行多个容器的Docker应用程序的工具， 可以使用`docker-compose.yaml`文件配置相关的指定服务，运行该服务时，只需要一个简单的命令即可。

4. 能否不使用Golang而换作其它语言环境？

Hyperledger Fabric中的很多组件使用Golang实现，并且我们会使用Golang来编写链式代码的应用程序， 所以需要在我们的系统中安装并设置Golang环境。

5. 一定要安装Node与npm吗？

Node与npm工具为可选安装工具。如果后期使用Node.js的Hyperledger Fabric SDK开发Hyperledger Fabric的应用程序，则需要安装；否则无需安装。
