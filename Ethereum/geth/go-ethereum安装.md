# go-ethereum install 

## go 

```
vi /etc/profile
```

```
export GOROOT=/opt/go
export PATH=$PATH:$GOROOT/bin
export GOPATH=$HOME/goproject
```

```
source /etc/profile
```

##  Building from source

```
git clone https://github.com/ethereum/go-ethereum
```
```
cd go-ethereum
make geth
```
**注意**

源码安装时只能在`go-ethereum/build/bin`目录下执行`geth`。如需在全局执行，修改profile文件`vim /etc/profile`添加下面代码：
```
export PATH=$PATH:$HOME/ethereum/go-ethereum/build/bin
```
```
source  /etc/profile
```
##  Start  node

```
build/bin/geth
geth 
```

## Installing from PPA
```
sudo apt-get install software-properties-common
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```

