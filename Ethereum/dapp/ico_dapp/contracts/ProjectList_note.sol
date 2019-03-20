pragma solidity ^0.4.20;

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
contract ProjectList {
    using SafeMath for uint; // SafeMath 机制:防止数学运算溢出
    address[] public projects; 
    uint projectsCount;

    constructor() public {
        projectsCount = 0;
    }

    // 创建项目，创建项目时需要指定项目名称，基本投资规则，自动记录项目的所有者；
    function createProject(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
        address newProject = new Project(msg.sender, _description, _minInvest, _maxInvest, _goal);
        projects.push(newProject);
    } 

    function getProjects() public view returns(address[]) { 
        return projects;
    } 
}

contract Project {
    using SafeMath for uint; // SafeMath 机制:防止数学运算溢出
    struct Payment {
        string description;// 资金用途，说明该笔资金支出的目的，字符串类型
        uint amount;    // 支出金额，标明资金支出的金额，数值类型
        address receiver;   // 收款方，该笔资金要转给谁，之所以要记录，是不想让该资金经项目方的手流转到收款方，减少操作空间； 
        bool completed; // 状态，标明该笔支出是否已经完成
       
        mapping (address => bool) voters; // 投票记录，记录所有投资人在该笔支出上的投票记录，所有投票过的投资人都会被记录下来。
        uint voterCount; // 统计投票人
    }

    address public owner;   // 所有者，即发起项目的人，在智能合约层面指调用项目创建合约的账户，数据类型是智能合约中独有的 address 类型
    string public description;  // 项目名称，项目的简单介绍
    uint public minInvest;  // 最小投资金额
    uint public maxInvest;  // 最大投资金额
    uint public goal; // 融资上限

    // address[] public investors;// 投资人列表
    mapping(address => uint) public investors;
    uint public investorCount;  // 统计投资人


    Payment[] public payments;// 资金支出列表

    //权限
    modifier ownerOnly(){
        require(msg.sender == owner,"Message must be Owner");
        _;
    }
    // 合约构造函数，要求传入所有合约的基本属性；
    constructor(address _owner,string _description, uint _minInvest, uint _maxInvest, uint _goal) public { 
        owner = _owner; 
        description = _description; 
        minInvest = _minInvest; 
        maxInvest = _maxInvest; 
        goal = _goal; 
    }

    // 	参与众筹，参与的含义是投资人选定某个项目，并向智能合约转账，智能合约会把投资人记录在投资人列表中，并更新项目的资金余额； 
    function contribute() public payable {
        require(msg.value >= minInvest,"Invest value should be larger than minInvest");
        require(msg.value <= maxInvest,"Invest value should be less than maxInvest");
       
        // uint newBalance = address(this).balance.add(msg.value);//address(this).balance:包括输入的数目
        require(address(this).balance <= goal,"Total amount should not exceed total amount of funds raised ");
        if ( investors[msg.sender]==0) {
            investorCount += 1;
        }
        investors[msg.sender] += msg.value;
    }
    // 	创建资金支出条目，项目所有者有权限在项目上发起资金支出请求，需要提供资金用途、支出金额、收款方，默认为未完成状态，创建资金支出条目前需要检查资金余额是否充足；
    function createPayment(string _description, uint _amount, address _receiver) public ownerOnly { 
        Payment memory newPayment = Payment({ 
            description: _description, 
            amount: _amount, 
            receiver: _receiver, 
            completed: false, 
            voterCount: 0 
        });

        payments.push(newPayment); 

    }
    // 给资金支出条目投票，投资人看到新的资金支出请求之后会选择投赞成票还是反对票，投票过程需要被如实记录，为了简化，我们只记录赞成票；
    function approvePayment(uint index) public { 
        Payment storage payment = payments[index];
        require(investors[msg.sender] > 0,"Message sender must be investor to vote ");
        require(!payment.voters[msg.sender],"Message sender not should be voted "); 

        payment.voters[msg.sender];
        payment.voterCount +=1; 

    }
   	// 	完成资金支出，项目所有者在资金支出请求达到超过半数投资人投赞成票的条件时才有权进行此操作，操作结果是直接把对应的金额转给收款方，转账前也要进行余额检查。
    function doPayment(uint index) public ownerOnly  { 
        Payment storage payment = payments[index];
        require(!payment.completed,"Payment should not be completed.");
        require(address(this).balance >= payment.amount,"Balance should be lagger payment");
        require(payment.voterCount > (investorCount / 2),"Voters should be more half of investors"); 
        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }
    // 获取项目基本信息
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

}

