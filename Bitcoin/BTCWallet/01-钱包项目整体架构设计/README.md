# 钱包项目整体架构设计
比特币钱包开发，后端使用的NodeJS搭建，客户端使用的web前端.


## 需求分析
1. 搭建NodeJS后端框架
2. 搭建前端web框架
3. 前后端交互
## 前端架构
咱们的开发重点是在后端实现上，因此为了让大家快速上手，web客户端没有使用其它流行的框架，这里只使用了jQuery框架简化代码，另外还有个jQuery Validate 插件简化了表单验证。

* web前端整体技术：

`html + css + javascript + jQuery。`

* web前端功能：

  - 钱包模块
    - 创建钱包
    - 助记词导入钱包
    - 钱包列表
    - 导出钱包助记词
  - 账号模块
    - 查询余额
    - 创建子账号
    - 查询子账号：地址、路径、私钥
  - 比特币转账
  - 交易记录

## 后端架构
钱包应用程序与比特币区块链交互，我们使用了Bitpay开发的`bitcore-wallet-client`库，使用它便于我们的开发，封装了比较全面的API给我们使用。

另外，后端Http框架使用的是强大的express，里面封装了很多功能，因为bitcore-wallet-client库中提供的API会通过异步callback返回数据，所以就不用koa。

在这个项目中使用了第三方库较少，如下：

* bitcore-wallet-client：是bitcore-wallet-service的客户端库，使用REST API 与BWS bitcore-wallet-service进行通信，所有REST端点都包装为简单的异步方法。bitcore-wallet-service库实现了多重签名的比特币HD钱包服务，使用该服务的有Copay、Bitpay钱包。
* express：是一个web框架，提供的HTTP服务器工具非常强大，且集成与使用简单，与koa类似。
* ejs：是一种JavaScript模版引擎，可以动态的设置变量值到html。需要与模板渲染中间件koa-views配合使用。

> express的github：https://github.com/expressjs/express

> ejs的github：https://github.com/tj/ejs

> bitcore-wallet-client的github：https://github.com/bitpay/bitcore-wallet-client

整体架构使用了成熟的MVC架构。项目的入口是index.js文件，对项目做了配置，将后端服务绑定到了3000端口并处于简体状态，当前端访问服务时，router.js路由文件根据URL将任务分配到controllers文件夹下的业务文件中。

这里为了让快速上手开发比特币钱包项目，前后端都在一个项目上同时开发，将前端的页面文件放在了static与views文件夹中，当然，同时支持移动端（iOS、安卓）的调用。若是需要前后端分离，可直接将static与views文件夹分离出来即可。

## 项目实战
### 1、初始化项目
```
npm init
```
### 2、安装依赖
修改package.json
```
"dependencies": {
    "bitcore-wallet-client": "^6.7.5",
    "ejs": "^2.6.1",
    "express": "^4.16.4"
  }
```
执行命令
```
npm install
```
### 3、构建项目

**index.js**

项目的入口文件。首先实例化express对象，然后将express.urlencoded、ejs、views、static路由注册到中间件，服务绑定到3000端口。
```
var express = require('express');
var app = express();
let router = require("./router/router")
let path = require("path")

app.use(express.urlencoded({ extended: false }))
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "static")));

app.use('/', router);

console.log("正在监听3000端口")
app.listen(3000)
```

**config/config.js**

项目的配置文件。
```
var path = require('path');

module.exports = {
    BWS_URL: 'https://bws.bitpay.com/bws/api',
    networkType: "testnet",//livenet,testnet
    coinType: "bch",
    copayerName: "lixu",
    walletFilePath: path.join(__dirname, "../static/wallet_file"),
}
```
字段说明：

- BWS_URL: bitcore-wallet服务端地址，我们使用的是bitpay的地址，你也可以自己搭建一个钱包服务端。

- networkType: 钱包连接的网络类型，支持正式网络和测试网络，分别表示为：livenet、testnet。

- coinType: 币种类型，支持比特币和比特币现金，分别表示为：btc、bch。

- copayerName: 钱包的拥有者，创建钱包的一个必填字断，这里我就指定为常量“lixu”。

- walletFilePath: 创建钱包后导出的文件的存放位置。

**Models/walletClient.js**

出来wallet的model文件，这里只有一个方法，实例化bitcore-wallet客户端。
```
let config = require("../config/config")

module.exports = {
    getWalletClient: () => {
        var Client = require('bitcore-wallet-client');

        var client = new Client({
            baseUrl: config.BWS_URL,
            verbose: false,
        });
        return client
    },

}
```

**router/router.js**

路由文件。
```
let router = require('express').Router();

router.get("/wallet.html", (req, res) => {
    res.render("wallet.html");
})

module.exports = router
```

**utils/myUtils.js**

项目工具类，提供返回给前端成功与失败的基本数据结构、判断字符串是否以某个字符串结尾。
```
module.exports = {

    success: (data) => {
        responseData = {
            code: 0,
            status: "success",
            data: data
        }
        return responseData
    },

    fail: (msg) => {
        responseData = {
            code: 1,
            status: "fail",
            data: msg
        }
        return responseData
    },

    //判断字符串是否以某个字符串结尾
    stringWithSubstrEnd: (str, substr) => {
        var start = str.length - substr.length;
        var sub = str.substr(start, substr.length);
        if (sub == substr) {
            return true;
        }
        return false;
    },
}
```
**static/js/wallet.js**

前端处理钱包模块的js文件。
```
$(document).ready(function () {
    alert("Welcome to KongYiXueYuan!")
})
```
**static/css/btcwallet.css**

前端唯一的css文件。
```
#main{
    /*background-color: #8bc34a;*/
    margin: 120px 50px 50px 50px;

}
.error{
    color: red;
}
a{
    color: black;
    text-decoration: none;
}
a:hover{
    color: #666;
}
body{
    margin: 0px;
}
ul>li{
    list-style: none;
    margin: 0px;
}

.global-color{
    color: #0abc9c;
}

ul{
    list-style: none;
    padding: 0px;
}

.row{
    display: inline-block;
    margin-right: 70px;
}
.top{
    vertical-align: top
}
a[class=button]{
    background-color: beige;
    padding: 2px 10px;
    border: 1px solid gray;
}
button{
    background-color: beige;
    border: 1px solid gray;
}

/*导航*/
#nav{
    display: flex;
    justify-content: space-between;
    background-color: #0abc9c;
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
}
#nav li{
    display: inline-block;
    margin: 10px 2px;
}
#nav ul{
    padding: 0px;
}
#nav a{
    padding: 10px;
    font-size: 24px;
}
#nav-left{
    margin-left: 20px;
}
#nav-right{
    margin-right: 20px;
}
```

**views/wallet.html**

前端：钱包列表的初始页面。
```
<html>

<head>
    <title>钱包</title>
    <script src="/js/lib/jquery-3.3.1.min.js"></script>
    <script src="/js/lib/jquery.url.js"></script>
    <script src="/js/wallet.js"></script>
    <link rel="stylesheet" href="/css/btcwallet.css">
</head>

<body>
    <%include block/nav.html%>

    <div id="main">
        <h1>钱包列表</h1>
    </div>
</body>

</html>
```

**views/block/nav.html**

前端的导航栏，使用ejs库的方法<%include block/nav.html%>载入。
```
<div id="nav">
    <div id="nav-center">
        <ul>
            <li><a href="http://www.kongyixueyuan.com">孔壹学院</a></li>
            <li><a href="/wallet.html">钱包</a></li>
            <li><a href="/walletinfo.html">账号</a></li>
            <li><a href="/transaction.html">交易</a></li>
            <li><a href="/transactionrecord.html">交易记录</a></li>
        </ul>
    </div>
</div>
```
### 4、测试
运行命令
```
node index.js
```
然后使用浏览器客户端访问http://39.108.111.144:3000/wallet.html



