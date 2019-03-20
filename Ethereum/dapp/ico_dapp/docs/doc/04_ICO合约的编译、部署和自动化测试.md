# 众筹智能合约的编译、部署和自动化测试
现在我们有了两个智能合约源文件，在不使用 truffle 这类框架的前提下，怎样进行编译、部署和测试的管理呢？回忆一下我们之前做过的自动化编译部署脚本，现在可以重新利用起来。不过之前我们的脚本只是针对一个合约源文件的，现在需要稍作改进。
## 改进编译脚本
对workflow 项目下的 scripts/compile.js 做如下改进，使得我们可以编译 contracts 目录下的所有合约源文件：
```
compile.js
const fs = require('fs-extra');
const path = require('path');
const solc = require('solc'); 
// 1. cleanup 
const compiledDir = path.resolve(__dirname, '../compiled');
fs.removeSync(compiledDir);
fs.ensureDirSync(compiledDir);
// compile 
const contractPath = path.resolve(__dirname, '../contracts', 'Car.sol');
const contractSource = fs.readFileSync(contractPath, 'utf8');
const result = solc.compile(contractSource, 1);
// 2. search all contracts
const contractFiles = fs.readdirSync(path.resolve(__dirname, '../contracts'));
contractFiles.forEach(contractFile => {
// 2.1 compile
const contractPath = path.resolve(__dirname, '../contracts', contractFile);
const contractSource = fs.readFileSync(contractPath, 'utf8');
const result = solc.compile(contractSource, 1); 
console.log(`file compiled: ${contractFile}`);
// 2.2 check errors
if (Array.isArray(result.errors) && result.errors.length) { 
throw new Error(result.errors[0]); 
}
// 2.3 save to disk
Object.keys(result.contracts).forEach(name => { 
const contractName = name.replace(/^:/, '');
const filePath = path.resolve(compiledDir, `${contractName}.json`);
fs.outputJsonSync(filePath, result.contracts[name]);
console.log(` > contract ${contractName} saved to ${filePath}`);
});
});
```
上面的改动只是用到了 fs-extra 模块中的 readdirSync 方法，把 contracts 目录下所有合约文件读出来逐个编译，还对日志打印也做了改进。在项目根目录下执行 npm run compile，可以看到 Project.sol 文件编译出来3个 .json 文件，其中 ProjectList.json 和 Project.json 是可以单独部署的。
## 改进部署脚本
我们还需要改进下部署脚本，使其默认部署 ProjectList 合约，并且能把合约地址记录下来，方便后续使用，记录合约部署地址的方式可以是写到文件中，具体改动如下：
```
deploy.js
const fs = require('fs-extra');
...
// 1. get bytecode
const contractPath = path.resolve(__dirname, '../compiled/Car.json');
const contractPath = path.resolve(__dirname, '../compiled/ProjectList.json');
...
(async() =>{
...
// 3. get contract instance and deploy
...
const result = await new web3.eth.Contract(JSON.parse(interface))
.deploy({ data: bytecode, arguments: ['AUDI'] })
.deploy({ data: bytecode })
...
const contractAddress = result.options.address;
// 4. write contract address to file
const addressFile = path.resolve(__dirname, '../address.json');
fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
console.log('地址写入成功:', addressFile); 
process.exit(); 
})();
```
## 增加自动化测试
合约编译完之后，我们就可以基于bytecode、interface 来添加单元测试了，同样还是利用了mocha 框架，代码如下：
```
const assert = require('assert');
const path = require('path'); 
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const ProjectList = require(path.resolve(__dirname, '../compiled/ProjectList.json'));
const Project = require(path.resolve(__dirname, '../compiled/Project.json'));

let accounts;
let projectList;
let project;

describe('Project Contract', () => { 
// 1. 每次跑单测时需要部署全新的合约实例，起到隔离的作用
beforeEach(async () => { 
// 1.1 拿到 ganache 本地测试网络的账户
accounts = await web3.eth.getAccounts(); 

// 1.2 部署 ProjectList 合约
projectList = await new web3.eth.Contract(JSON.parse(ProjectList.interface))
.deploy({ data: ProjectList.bytecode })
.send({ from: accounts[0], gas: '5000000' });

// 1.3 调用 ProjectList 的 createProject 方法
await projectList.methods.createProject('Ethereum DApp Tutorial', 100, 10000, 1000000).send({
from: accounts[0], 
gas: '1000000', 
});

// 1.4 获取刚创建的 Project 实例的地址
const [address] = await projectList.methods.getProjects().call();

// 1.5 生成可用的 Project 合约对象
project = await new web3.eth.Contract(JSON.parse(Project.interface), address);
});

it('should deploy ProjectList and Project', async () => {
assert.ok(projectList.options.address);
assert.ok(project.options.address);
});
it('should save correct project properties', async () => {
const owner = await project.methods.owner().call();
const description = await project.methods.description().call();
const minInvest = await project.methods.minInvest().call();
const maxInvest = await project.methods.maxInvest().call();
const goal = await project.methods.goal().call();
assert.equal(owner, accounts[0]);
assert.equal(description, 'Ethereum DApp Tutorial');
assert.equal(minInvest, 100);
assert.equal(maxInvest, 10000);
assert.equal(goal, 1000000);
});
});
```
同样，我们每个测试运行都是在单独的合约实例下，确保环境隔离，环境准备过程的 1.3、1.4、1.5 三个步骤，我们调用 ProjectList 的方法直接创建 Project 合约实例，后续的测试基本都是针对 Project 合约实例编写，因为主要的业务逻辑都在 Project 合约中。
具备了基本测试骨架之后，可以逐步提高测试用例的覆盖度，比如先测试 Project 合约实例的 contribute 方法：
```
it('should allow investor to contribute', async () => {
const investor = accounts[1]; 
await project.methods.contribute().send({
from: investor,
value: '200',
});
const amount = await project.methods.investors(investor).call();
assert.ok(amount == '200');
});
```
又如，测试 contribute 接口的边界检查，即最小投资金额、最大投资金额，以及投资上限也是可以测试的，感兴趣的可以自己添加：
```
it('should require minInvest', async () => {
try {
const investor = accounts[1];
await project.methods.contribute().send({
from: investor,
value: '10', 
});
assert.ok(false);
} catch (err) {
assert.ok(err);
}
});
```
这里的接口边界测试时使用了比较 trick 的方法，因为 contribute 接口在边界检查失败时会抛出错误，这样接口调用就会返回异常，所以我们使用了 try catch 把代码包起来，断言在超出边界时肯定会抛出错误。
