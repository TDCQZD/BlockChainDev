# ICO合约重构：安全、费用、性能等的最佳实践

以太坊上智能合约的安全性一直是大家非常关注的话题，合约漏洞引发的安全事件我们并不陌生，从历史上著名的the DAO遭受黑客攻击，到今年的美图币爆出溢出漏洞，市值瞬间几乎归零；智能合约中的 BUG 如果在部署前没有被发现，产生的影响通常是灾难性的。
另一方面，因为以太坊上智能合约的绝大部分操作都是要支付gas的，而支付gas的多少跟计算量有关，所以能不能开发用户喜欢用的 DApp，需要在智能合约接口中做比较细节的优化，确保用户花最少的gas即可完成所有功能；另外，合约中的所有接口都是公开的，怎么确保接口不被恶意调用，也是部署合约前需要考虑的问题。
接下来，我们就从安全、性能、费用等方面对初版众筹智能合约进行改进。
##  安全改进
### 防止数学运算溢出
计算机数学运算溢出是很多 BUG 的根源，在智能合约中，我们可以引入 SafeMath 机制来确保数学运算的安全，SafeMath 机制就是通过简单的检查确保常见的数学运算不出现预期之外的结果：
```
/** 
* @title SafeMath 
* @dev Math operations with safety checks that throw on error 
*/ 
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
众筹合约中检查是否已经达到募资上限时使用了加法运算，要使 SafeMath 机制生效还需要做如下改动：
```
contract Project { 
using SafeMath for uint;
 
struct Payment { 
string description; 
uint amount; 
...
}
...
function contribute() public payable { 
	require(msg.value >= minInvest); 
	require(msg.value <= maxInvest); 

	// require(address(this).balance + msg.value <= goal); 
	// 合约修改如下：
	require(address(this).balance <= goal,"Total amount should not exceed total amount of funds raised ");
			if ( investors[msg.sender]==0) {
				investorCount += 1;
			}

	investors.push(msg.sender); 
}

...
```
这里我们在数字上显式的调用了 uint 类型变量的 add 方法。
### 操作权限检查
在众筹场景下，资金支出请求的创建、资金划转操作都应该限定仅项目所有者有权进行，而不是所有人都可以进行，要完成这样的功能，我们可以使用 Solidity 里面的 require 函数来做断言，不满足条件的时候交易直接回滚，改动如下：
```
function createPayment(string _description, uint _amount, address _receiver) public { 
require(msg.sender == owner);
...
}
function doPayment(uint index) public {
require(msg.sender == owner);
...
}
```
我们还可以用 modifier 来复用检查权限的代码：
```
modifier ownerOnly(){
	require(msg.sender == owner);
	_;
}
function createPayment(string _description, uint _amount, address _receiver) public ownerOnly { ...
function doPayment(uint index) public ownerOnly { ...
```
###  账户余额检查
在做资金划转时，检查账户余额是非常有必要的，我们应在每次做转出操作前检查账户余额是否充足。在众筹合约中，只有 doPayment 接口内部有转账逻辑，转账前我们需要账户余额大于等于当前需要支出的金额，代码改动如下：
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
## 性能和费用
以太坊智能合约里面的所有计算都是要花费gas的，如果进行简单的操作都要花很多钱，显然没有人愿意用这样的Dapp。我们在remix中进行测试时可以注意到，初版众筹智能合约编译时编译器报了很多 warning，这些warning主要都是针对性能方面的。
可以看到，编译器认为合约中的 contribute、createPayment、approvePayment、doPayment 的gas消耗都是很高的，极端情况下接近无限。通过简单的分析，我们不难发现，其中最严重的是 approvePayment，里面有两个循环，如果项目非常火爆，投资人数以万计，每次投票需要的计算量就非常大了。
有没有办法把线性的访问时间优化到到常数访问时间呢？熟悉数据结构的同学心里已经有了答案，我们可以使用哈希结构来存储这些大列表，而 Solidity 里面为我们提供了类哈希结构 mapping，我们在之前的项目中也用到过多次了，不过 Solidity 中的 mapping 类型有几个重要的特征需要再次强调一下，因为乍看起来 mapping 和 Javascript 中的对象很像，但是区别挺大。
- 	一个mappings 要求所有的 key 和 value 都必须是完全相同的类型，Javascript 却没有这种要求；
- 	mappings 里面并没有存储所有的 key，因此无法获取所有的 key 列表，Javascript 中可使用 Object.keys 取所有 key；
- 	mappings 里面的值也是无法被遍历的，只能通过 key 逐个去取，Javascript 中可用 Object.values 取所有值。
接下来我们对代码的数据结构进行改进，用 mapping 来存储 investors 和 voters，而 payments 还保持是数组类型：
```
contract Project { 
struct Payment { 
...
bool completed; 
// address[] voters; 
mapping(address => bool) voters; 
uint voterCount; 
} 
...
// address[] public investors; 
mapping(address => uint) public investors;
uint public investorCount;
Payment[] public payments; 
...
function contribute() public payable { 
...
require(newBalance <= goal); 
investors.push(msg.sender);
investors[msg.sender] = msg.value;
investorCount += 1;
}

function createPayment(string _description, uint _amount, address _receiver) public { 
...
completed: false, 
//voters: new address[](0) 
voterCount: 0
});
payments.push(newPayment); 
} 

function approvePayment(uint index) public { 
...
// must be investor to vote 
bool isInvestor = false; 
for (uint i = 0; i < investors.length; i++) { 
isInvestor = (investors[i] == msg.sender); 
if (isInvestor) { 
break; 
} 
} 
require(isInvestor); 
require(investors[msg.sender] > 0);

// can not vote twice 
bool hasVoted = false; 
for (uint j = 0; j < payment.voters.length; j++) { 
hasVoted = (payment.voters[j] == msg.sender); 
if (hasVoted) { 
break; 
} 
} 
require(!hasVoted); 
require(!payment.voters[msg.sender]);

payment.voters.push(msg.sender); 
payment.voters[msg.sender] = true;
payment.voterCount += 1;
} 

function doPayment(uint index) public { 
...
require(address(this).balance >= payment.amount);
require(payment.voters.length > (investors.length / 2));
require(payment.voterCount > (investorCount / 2)); 
...
}
}
```
改动之后，每次投票所需要的计算量大大减少，自然能为用户节省费用。需要额外说明的是，因为 mapping 类型没有存储里面键值的个数，我们需要在 Project 合约上新增 investorCount 来记录投资人数，在 Payment 结构体上新增 voterCount 来记录投票人数，最后资金划转时需要用这两个计数器来确定投赞成票的人数是否达到过半的要求，这些在代码中都有体现。

代码重构完成后，同样将代码放到remix中，校验正确性和流程的完整性。

## 部署方面的考量
如果在传统的 WEB 应用中设计众筹系统的数据库，所有的项目都会存在一张表中，而表中的每条记录都是一个实际的项目，在智能合约场景下，我们已经具备创建单个项目的能力，Project 合约部署完就能得到项目的实例，但实际的众筹应用中肯定不止一个项目，怎么存储所有的项目呢？因为在 DApp 我们必须具备列出所有项目的能力，能不能把所有的数据都存储在以太坊区块链上面？答案是肯定的。
接下来我们介绍一种比较常见的智能合约部署方法：用合约来控制合约。我们将会在代码中新建一个合约，用来管理所有的Project合约实例。新增合约 ProjectList.sol：
```
contract ProjectList {
using SafeMath for uint;
address[] public projects; 
function createProject(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
address newProject = new Project(msg.sender, _description, _minInvest, _maxInvest, _goal);
projects.push(newProject); 
} 
function getProjects() public view returns(address[]) { 
return projects;
} 
}
```
更改 Project 的构造函数，传入项目的 owner：
```
constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
constructor(address _owner, string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
owner = msg.sender;
owner = _owner;
...
}
```
新增合约的名称叫做 ProjectList，顾名思义就是项目列表，其中仅包含 createProject 和 getProjects 两个接口，方便我们创建新的项目、拉取所有的项目列表，其中 createProject 因为是从外部进行的，需要给 Project 合约的构造函数新增 _owner 参数。
把最新的代码放到 Remix 上，部署 ProjectList，并且调用它的 createProject 接口，然后加载创建后的 Project 合约实例进行测试。
