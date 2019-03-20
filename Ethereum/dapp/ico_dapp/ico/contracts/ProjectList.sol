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
    using SafeMath for uint;
    mapping (uint => address) public projects;
    uint projectsCount;

    constructor() public {
        projectsCount = 0;
    }


    function createProject(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
        address newProject = new Project(msg.sender, _description, _minInvest, _maxInvest, _goal);
        projectsCount += 1;
        projects[projectsCount] =newProject; 
    } 


}

contract Project {
    using SafeMath for uint;
    struct Payment {
        string description;// 项目介绍
        uint amount;// 
        address receiver;// 
        bool completed;// 
       
        mapping (address => bool) voters;
        uint voterCount;
    }

    address public owner; // 项目所有者
    string public description;//
    uint public minInvest;// 最小投资金额
    uint public maxInvest;// 最大投资金额
    uint public goal; // 融资上限

    // address[] public investors;// 投资人列表
    mapping(address => uint) public investors;
    uint public investorCount;


    Payment[] public payments;// 资金支出列表

    //权限
    modifier ownerOnly(){
        require(msg.sender == owner,"Message must be Owner");
        _;
    }

    constructor(address _owner,string _description, uint _minInvest, uint _maxInvest, uint _goal) public { 
        owner = _owner; 
        description = _description; 
        minInvest = _minInvest; 
        maxInvest = _maxInvest; 
        goal = _goal; 
    }

    // 	参与众筹
    function contribute() public payable {
        require(msg.value >= minInvest,"Invest value should be larger than minInvest");
        require(msg.value >= maxInvest,"Invest value should be less than maxInvest");
        // require(msg.value + address(this).balance <= goal,"Total amount should not exceed total amount of funds raised ");
        uint newBalance = address(this).balance.add(msg.value);
        require(newBalance <= goal,"Total amount should not exceed total amount of funds raised ");
        investors[msg.sender] = msg.value;
        investorCount += 1;

    }
    // 创建资金支出条
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
    // 给资金支出条目投票
    function approvePayment(uint index) public { 
        Payment storage payment = payments[index];
        require(investors[msg.sender] > 0,"Message sender must be investor to vote ");
        require(!payment.voters[msg.sender],"Message sender not should be voted "); 

        payment.voters[msg.sender];
        payment.voterCount +=1; 

    }
   	// 完成资金支出
    function doPayment(uint index) public ownerOnly  { 
        Payment storage payment = payments[index];
        require(!payment.completed,"Payment should not be completed.");
        require(address(this).balance >= payment.amount,"Balance should be lagger payment");
        require(payment.voterCount > (investorCount / 2),"Voters should be more half of investors"); 
        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }
}

