# 基于以太坊的众筹 (ICO) DApp
## 项目构建
```
 mkdir ico_dapp
 cd ico_dapp
 mkdir compiled contracts scripts tests
 ```
 ```
 npm init 
 npm install web3 --save
 npm install solc --save
 npm install fs-extra --save-dev
 npm install ganache-cli --save-dev
 npm install mocha --save-dev
```
## 修改package.json
```
"scripts": {
    "compile": "node scripts/compile.js",
    "predeploy": "npm run compile",
    "deploy": "node scripts/deploy.js",
    "pretest": "npm run compile",
    "test": "./node_modules/mocha/bin/mocha tests/",
    "dev": "node server.js",
    "build": "next build",
    "start": "NODE_ENV=production node server.js"
  },
  "dependencies": {
    "react": "16.6.3",
    "react-dom": "16.6.3",
    "next": "^7.0.2",
    "next-routes": "^1.4.2",
    "@material-ui/core": "^1.5.1",
    "solc": "^0.4.25",
    "web3": "^1.0.0-beta.36"
  },
  "devDependencies": {
    "fs-extra": "^7.0.1",
    "ganache-cli": "^6.1.8",
    "mocha": "^5.2.0"
  }

```
```
npm install
```
## Contracts
```
node_modules/.bin/ganache-cli
npm run compile # 编译合约
npm run deploy  # 部署合约
npm run test    # 自动化测试
```

## DApp框架搭建
```
npm install --save next 
npm install --save react 
npm install --save react-dom
npm install --save next-routes

```
npm run dev
```
 
```

## DApp基本页面布局
```
npm install --save @material-ui/core@1.5.1
```

## 项目列表页
**使用脚本添加测试数据**

```
touch scripts/sample.js #创建sample.js
node scripts/txtoaccount.js #执行txtoaccount.js，账户转账
node scripts/sample.js  #执行sample.js，添加测试数据
```

## 项目创建页
```
http://39.108.111.144:3000/projects/create
cp -Rf ico_dapp2/* ico_dapp/
```

## DApp的部署
### 配置管理
**测试**
```
grep -r --exclude-dir=node_modules "39.108.111.144:8545" *
geth --datadir . --networkid 15 --rpc --rpcport 9545 --rpcaddr 127.0.0.1 console 2>output.log
tail -f output.log

```

```
NODE_ENV=production npm run deploy
npm run build
npm run start
```
> deploy err:修改deploy.js 代码
```
let result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: '0x' + bytecode })
        .send({ from: accounts[0], gas: 5000000 });
```
```
NODE_ENV=production npm run dev
```
