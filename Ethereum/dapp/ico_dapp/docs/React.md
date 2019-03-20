# React

React，一个构建用户界面的JavaScript库，主要用于构建UI，负责视图层和简单的状态管理；

## React Demo
1. 安装Next.js和React
    ```
    npm install --save next 
    npm install --save react 
    npm install --save react-dom
    ```
    修改package.json，添加用于启动项目和构建项目的npm script：
    ```

    "scripts": {
        ...
        "dev": "next",
        "build": "next build",
        "start": "next start"
    },

    ```

2. 创建项目首页
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
