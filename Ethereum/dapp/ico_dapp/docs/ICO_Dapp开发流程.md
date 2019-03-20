# ICO 
1. 智能合约的数据结构和接口设计
2. 智能合约开发
3. 智能合约重构
    - 安全改进
        - 防止数学运算溢出
        - 操作权限检查
        - 账户余额检查
    - 性能和费用
    - 部署方面的考量
4. 众筹智能合约的编译、部署和自动化测试
    - 合约的自动化编译
    - 合约的自动化部署
    - 合约的自动化测试 
5. 前端交互

**项目目录：**
```
├── compiled
├── contracts
├── scripts
└── tests

```
- contracts 目录存放合约源代码；
- scripts 目录存放编译脚本；
- complied 目录存放编译结果；
- tests 目录存放测试文件。 
 
## 智能合约的数据结构和接口设计 
需要搞清楚任何一个信息系统，核心关注点只有两个，系统的数据结构和状态流转。数据结构通常可以理解为数据库表结构、系统中关键实体的属性，而状态流转常常和业务流程有关，即如何操作数据、数据如何变化，对应到实际的开发中就是系统对外暴露的接口，接口内部的业务规则。

## 智能合约重构

### 安全改进

#### 防止数学运算溢出
计算机数学运算溢出是很多 BUG 的根源，在智能合约中，我们可以引入 SafeMath 机制来确保数学运算的安全，SafeMath 机制就是通过简单的检查确保常见的数学运算不出现预期之外的结果：
```
library SafeMath { 
    function mul(uint a, uint b) internal pure returns (uint) { 
        uint c = a * b; 
        assert(a == 0 || c / a == b); 
        return c;
    }
    function div(uint a, uint b) internal pure returns (uint) { 
        // assert(b > 0); // Solidity automatically throws when dividing by 0 
        uint c = a / b; 
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold 
        return c; 
    } 
    function sub(uint a, uint b) internal pure returns (uint) { 
        assert(b <= a); 
        return a - b; 
    } 
    function add(uint a, uint b) internal pure returns (uint) { 
        uint c = a + b; 
        assert(c >= a); 
        return c; 
    } 
}
```
**使用示例：**
1. 引入SafeMath 
```
contract Project { 
    using SafeMath for uint;
} 
```

2. 修改代码
    ```
    require(address(this).balance + msg.value <= goal); 
    //修改如下：
    uint newBalance = 0; 
    newBalance = address(this).balance.add(msg.value); 
    require(newBalance <= goal); 

    ```
####  操作权限检查
在众筹场景下，资金支出请求的创建、资金划转操作都应该限定仅项目所有者有权进行，而不是所有人都可以进行。

**使用示例：**

1. require 
    要完成这样的功能，我们可以使用 Solidity 里面的 require 函数来做断言，不满足条件的时候交易直接回滚.
    ```
    require(msg.sender == owner);
    ```
2. modifier 
    还可以用 modifier 来复用检查权限的代码：
    ```
    modifier ownerOnly(){
        require(msg.sender == owner);
        _;
    }

    function createPayment(string _description, uint _amount, address _receiver) public ownerOnly { ...
    function doPayment(uint index) public ownerOnly { ...
    ```
#### 账户余额检查
在做资金划转时，检查账户余额是非常有必要的，我们应在每次做转出操作前检查账户余额是否充足。如果当前账户余额不足以支付本次需要支出的金额，就抛出错误，

**使用示例：**

在众筹合约中，只有 doPayment 接口内部有转账逻辑，转账前我们需要账户余额大于等于当前需要支出的金额，代码改动如下：
```
function doPayment(uint index) public {
    ...
    require(!payment.completed); 
    require(address(this).balance >= payment.amount); 
    require(payment.voters.length > (investors.length / 2));
    ...
}

```
账户余额检查也可以在 createPayment 时做，如果当前账户余额不足以支付本次需要支出的金额，就抛出错误，当然最严密的做法是在 createPayment 和 doPayment 两处都做余额检查，此外，在后续要开发的 DApp 也做一层检查，避免用户发起无效的交易。
### 性能和费用
1. 使用**哈希结构**代替**数组**来存储大列表数据

    **使用示例：**
    ```
    address[] voters; 
    //修改如下：
    mapping(address => bool) voters; 
    uint voterCount; 

    ```

### 部署方面的考量
一种比较常见的智能合约部署方法：用合约来控制合约。我们将会在代码中新建一个合约，用来管理所有的Project合约实例。新增合约 ProjectList.sol。

## 智能合约的编译、部署和自动化测试

### 编译脚本
1. 在 scripts 目录下新建文件 compile.js并编译。
2. 执行编译脚本
```
npm run compile
```
### 部署脚本
1. 在 scripts 目录下新建文件 compile.js并编译。
2. 执行部署脚本
```
npm run deploy
```
### 测试脚本
1. 在 tests 目录下新建文件 project_test.js并编译。
2. 执行测试脚本
```
npm run  test
```

## DApp框架搭建

### 安装Next.js和React
```
npm install --save next 
npm install --save react 
npm install --save react-dom
```
> next 7.0 需要 Node9.0
修改package.json，添加用于启动项目和构建项目的npm script：
```

"scripts": {
    ...
    "dev": "next",
    "build": "next build",
    "start": "next start"
},

```

### 创建项目首页
在项目根目录下创建 pages 目录，并添加 pages/index.js，在其中输入如下内容：
```
import React from 'react';
export default class Index extends React.Component {
    render() {
        return <div>Welcome to Ethereum ICO DApp!</div>;
    }
}

```
在控制台中，切换到项目根目录下，执行如下命令启动服务：
```
npm run dev
```
使用浏览器打开 http://localhost:3000/，我们应该能看到正常的页面渲染。

### 集成next-routes

1.	首先安装依赖
```
npm install --save next-routes
```
2.	根目录下增加 routes.js，内容如下：
```
const routes = require('next-routes')();

routes 
.add('/projects/create', 'projects/create')
.add('/projects/:address', 'projects/detail')
.add('/projects/:address/payments/create', 'projects/payments/create');

module.exports = routes;
```
3.	根目录下增加 server.js，内容如下：
```
const next = require('next');
const http = require('http');
const routes = require('./routes');

const app = next({ dev: process.env.NODE_ENV !== 'production' });
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
http.createServer(handler).listen(3000, () => {
console.log('server started on port: 3000');
});
});
```
4.	修改 package.json 的服务启动命令，因为我们自定义了 server 文件，不再使用 next.js 内置的 server：
```
{
  "scripts": {
	...
"dev": "next",
"dev": "node server.js",
    "build": "next build",
"start": "next start",
"start": "NODE_ENV=production node server.js"
  },
  ...
}
```
5.	重启 `next.js` 服务。结束之前的服务器进程，重新运行 `npm run dev`，刷新浏览器，确保能正常打开页面。

## DApp基本页面布局

### 集成Material UI
1. 安装依赖
    ```
    npm install --save @material-ui/core@1.5.1
    ```
2. 导入支持服务端渲染的必要文件 libs/withRoot.js ,libs/getPageContext.js
    - withRoot.js 实质上是 React 组件，并且是高阶组件，作用在于确保服务端渲染时能正确的生成样式；
    - getPageContext.js 为整个应用的前端、后端渲染提供 theme 配置，以及必要的工具函数，比如如何生成类名等

3. 创建自定义的页面结构
    参照示例项目中的 pages/_document.js，是基于 Next.js 里面的 Custom Document 机制实现的，创建自定义页面结构的动机在于我们可以全局性的在页面中引入需要的样式和字体文件。
4. 使用Material UI中的组件
    接下来检验 Material UI 的集成是否成功，改动pages/index.js中的内容，其中调用了组件库中的 Button 组件.
5. 重新启动服务
    执行 `npm run dev`，刷新页面，应该看到添加了Button组件的首页。

### 页面布局组件

**Layout组件**

1. 新建文件 components/Layout.js,Layout 组件的目的主要是规范页面的宽度.这里Layout 组件中使用了 Material UI 里面的样式注入机制。
2. 修改 pages/index.js 应用新的 Layout

**Header组件**

1. 创建Header组件,在 components 目录下新建 Header.js
    Header 中使用到了 Material UI 中的 AppBar、ToolBar、Button 组件，其中 AppBar 是和浏览器窗口等宽的，而 Toobar 和 Layout 里面的内容宽度相同。
2. 将 Header 组件集成到 Layout
    因为 Header 组件也是全局通用的，在 Layout 中引入即可，修改 components/Layout.js .

## 前后端通用的Web3实例

1. 为了解决服务端渲染带来的Web3对象缺失问题，我们需要兼容前后端的去创建 Web3 实例，产生在浏览器环境和在 Node.js 环境都可以使用 Web3 实例，直接在 libs 目录下新建 web3.js.
2. 修改pages/index.js，使用这个前后端通用的 Web3 实例

## 项目列表页
### 封装通用的合约实例
1. ProjectList 智能合约在项目列表页和项目创建页都会使用，所以有必要将其封装成可复用的代码，在 libs 目录下新建 projectList.js
2. Project 合约会存在很多实例，需要有基于地址去生成合约实例的可复用函数，在 libs 目录下新建 project.js
### 使用脚本添加测试数据
1. 把合约数据渲染到 DApp 之前，还需要准备一些测试数据，我们通过Node.js脚本来实现。脚本文件是 scripts/sample.js，通过代码调用 ProjectList 合约的 createProject 接口添加测试数据。

### 获取并渲染项目列表
1. 需要在前端获取数据并在页面上渲染出来。可以修改pages/index.js:
2. Project.sol 新增 getSummary 接口会返回项目说明、投资金额限制、管理员地址、账户余额、资金支出条目、投资者数量等信息。

```
function getSummary() public view returns (string, uint, uint, uint, uint, uint, uint, address) {
return (
description,
minInvest,
maxInvest,
goal,
address(this).balance,
investorCount,
payments.length,
owner
);
}
```


### 改进项目列表数据
1. getSummary 接口返回的数据渲染在项目卡片中，继续修改 pages/index.js，调用 Project 合约的 getSummary 方法
2. 在getInitialProps中完成数据提取部分之后，在renderProject渲染部分将对应的值写入。
3. 继续对 pages/index.js 做如下修改，增加进度条展示，并引入一个叫做InfoBlock的子组件来展示项目中的每个参数.

## 项目创建页
### 项目创建页入口
1. 之前在Header中已经有项目创建的按钮，但是没有加上链接跳转，修改 components/Header.js加上入口.
### 项目创建表单
1. 然后我们需要在 pages 目录下创建文件 pages/projects/create.js，用来展示创建项目的表单.

## 项目详情页
### 项目详情页框架
1. 在 pages/projects 目录下新建 detail.js

### 项目投资功能
1. 接下来我们需要添加投资功能所需的界面元素：输入框 + 按钮，并且能在 React 组件状态中记录用户输入。

## 项目资金管理功能
### 创建资金支出请求的入口
1. 添加入口很简单，直接修改 pages/projects/detail.js：
### 创建资金支出请求
1. 资金支出请求创建页面，可以完全参照项目创建页面去做，在 pages/projects 下面新建 payments 目录，然后在其中新建 create.js，
 
### 资金支出列表
1. 资金支出请求的数据现在已经有了，我们需要把它读取出来并渲染到 DApp 中。继续修改 pages/projects/detail.js，读取 payments 列表，并渲染成表格
### 资金支出投票
1. 接下来是资金支出请求的投票功能，继续修改 pages/projects/detail.js：
### 资金划转
1. 实现资金划转功能，继续修改 pages/projects/detail.js
## DApp的部署
###  配置管理
1.	安装依赖
```
npm install --save config@1.30.0
```
2.	创建配置文件
在项目根目录下创建 config 目录，然后在其中创建 3 个文件：
```
mkdir config
touch config/default.js
touch config/development.js
touch config/production.js
```
3.	提取配置项
在众筹 DApp 中，我们可以把web3 provider的地址放到配置文件里面，对应的配置文件为：config/default.js
4.	引用配置文件
要修改多少代码取决于我们把哪些内容放到了配置文件里，对于服务端，我们需要修改 scripts 下面的两个脚本：deploy.js & sample.js
5.	回归测试
代码改动之后，重新启动服务，浏览页面，试用几个功能即可，保证一切正常。

### 日志管理

1. 在根目录下创建 logs 目录；
```
mkdir logs 
``` 
2. 在 logs 目录下创建 .gitkeep 空文件，并且提交该文件；
```
touch logs/.gitkeep
``` 
3. 然后把这个目录加到 .gitignore 里面

### 服务进程管理
1.	安装依赖
```
npm install --save-dev pm2
```
2.	添加配置文件
根目录下创建 pm2.json，输入如下代码：
```
{
    "apps": [
        {
            "name": "ico-dapp",
            "script": "./server.js",
            "out_file": "./logs/out.log",
            "error_file": "./logs/error.log",
            "log_date_format": "YYYY-MM-DD HH:mm:ss",
            "instances": 0,
            "exec_mode": "cluster",
            "max_memory_restart": "500M",
            "merge_logs": true,
            "env": {
                "NODE_ENV": "production"
            }
        }
    ]
}
```
3.	修改启动命令
直接替换 package.json 中原有的 start 命令如下：
```
"start": "pm2 restart pm2.json"
```
这里我们使用了 pm2 restart，而不是 pm2 start，是为了兼容之前已经启动过服务部署新版本时的情况。

### 自动化
用流程化的语言来描述如下：
- 合约编译 --> 合约自动化测试 --> 合约部署
- DApp 构建 --> DApp 部署
使用 npm script 可以方便的实现上面的两条主线：合约部署、DApp 部署。修改 package.json 如下：
```
"scripts": {
    "compile": "node scripts/compile.js",
    "pretest": "npm run compile",
    "test": "./node_modules/mocha/bin/mocha tests/",
    "predeploy": "npm run test",
    "deploy": "node scripts/deploy.js",
    "dev": "node server.js",
    "build": "next build",
    "prestart": "npm run build",
    "start": "pm2 restart pm2.json"
  },
```
这样，之后我们做部署工作时，只要记住两条命令就可以了：
- 如果要部署智能合约，执行：`npm run deploy`
- 如果要部署 DApp，执行：`npm run start`
