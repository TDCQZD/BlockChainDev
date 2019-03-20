# npm最新版本安装

**npm node 最新版本安装：**
```
curl -sL https://deb.nodesource.com/setup_.x | sudo -E bash -

sudo apt-get install -y nodejs
```
```
npm install -g n
n stable
```
**查看node进程并删除：**

```
ps -ef | grep geth
kill -9 port
```
**查看ESC云服务器监听**
```
ss -tnl
```