# ICO 智能合约开发
ICO合约初版
利用之前的工作流目录，在contracts下新建一个 Project.sol 文件：
```
pragma solidity ^0.4.17; 

contract Project { 
struct Payment { 
string description; 
uint amount; 
address receiver; 
bool completed; 
address[] voters; 
}
address public owner; 
string public description; 
uint public minInvest; 
uint public maxInvest; 
uint public goal; 
address[] public investors; 
Payment[] public payments; 

constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal) public { 
owner = msg.sender; 
description = _description; 
minInvest = _minInvest; 
maxInvest = _maxInvest; 
goal = _goal; 
}

function contribute() public payable { 
require(msg.value >= minInvest); 
require(msg.value <= maxInvest); 
require(address(this).balance + msg.value <= goal); 
investors.push(msg.sender); 
}

function createPayment(string _description, uint _amount, address _receiver) public { 
Payment memory newPayment = Payment({ 
description: _description, 
amount: _amount, 
receiver: _receiver, 
completed: false, 
voters: new address[](0) 
});
payments.push(newPayment); 
} 

function approvePayment(uint index) public { 
Payment storage payment = payments[index]; 

// must be investor to vote 
bool isInvestor = false; 
for (uint i = 0; i < investors.length; i++) { 
isInvestor = (investors[i] == msg.sender); 
if (isInvestor) { 
break; 
} 
} 
require(isInvestor); 

// can not vote twice 
bool hasVoted = false; 
for (uint j = 0; j < payment.voters.length; j++) { 
hasVoted = (payment.voters[j] == msg.sender); 
if (hasVoted) { 
break; 
} 
} 
require(!hasVoted); 

payment.voters.push(msg.sender); 
} 

function doPayment(uint index) public { 
Payment storage payment = payments[index]; 
require(!payment.completed); 
require(payment.voters.length > (investors.length / 2)); 
payment.receiver.transfer(payment.amount); 
payment.completed = true;
}
}
```
合约中声明的属性包括： 
- 	owner，项目所有者； 
- 	description，项目介绍； 
- 	minInvest，最小投资金额； 
- 	maxInvest，最大投资金额； 
- 	goal，融资上限； 
- 	investors，投资人列表； 
- 	payments，资金支出列表； 
合约中声明的函数包括： 
- 	constructor，合约构造函数，要求传入所有合约的基本属性； 
- 	contribute，参与项目投资的接口，投资人调用该接口时要求发送满足条件的资金，并且要求没有达到募资上线，这是所有合约接口中标记为 payable 的接口，即接受用户在交易中发送 ETH； 
- 	createPayment，发起资金支出请求，要求传入资金支出的细节信息； 
- 	approvePayment，投票赞成某个资金支出请求，需要指定是哪条请求，要求投票的人是投资人，并且没有重复投票； 
- 	doPayment，完成资金支出，需要指定是哪笔支出，即调用该接口给资金接收方转账，不能重复转账，并且赞成票数超过投资人数量的 50%

为了快速测试合约代码的正确性，我们可以先在remix中进行一下功能和流程测试。
