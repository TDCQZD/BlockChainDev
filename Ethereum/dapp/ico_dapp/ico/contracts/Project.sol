pragma solidity ^0.4.20;

contract Project {
    struct Payment {
        string decription;// 项目介绍
        uint amount;// 
        address receiver;// 
        bool completed;// 
        address[] voters;// 
    }
    address public owner; // 项目所有者
    string public description;//
    uint public minInvest;// 最小投资金额
    uint public maxInvest;// 最大投资金额
    uint public goal; // 融资上限
    address[] public investors;// 投资人列表
    Payment[] public payments;// 资金支出列表

    constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal) public { 
        owner = msg.sender; 
        description = _description; 
        minInvest = _minInvest; 
        maxInvest = _maxInvest; 
        goal = _goal; 
    }

    // 	参与众筹
    function contribute() public payable {
        require(msg.value >= minInvest,"Invest value should be larger than minInvest");
        require(msg.value >= maxInvest,"Invest value should be less than maxInvest");
        require(msg.value + address(this).balance <= goal,"Total amount should not exceed total amount of funds raised ");

        investors.push(msg.sender);
    }
    // 创建资金支出条
    function createPayment(string _description, uint _amount, address _receiver) public { 
        Payment memory newPayment = Payment ({ 
            description: _description, 
            amount: _amount, 
            receiver: _receiver, 
            completed: false, 
            voters: new address[](0) 
            });
        payments.push(newPayment); 

    }
    // 给资金支出条目投票
    function approvePayment(uint index) public { 
        Payment storage payment = payments[index];

        bool isInvestor = false;
        for (var i = 0; i < investors.length; i++) {
            isInvestor = (investors[i] == msg.sender);
            if (isInvestor) {
                break;
            }
        }
        require(isInvestor,"Message sender must be investor to vote ");
        // can not vote twice 
        bool hasVoted = false; 
        for (uint j = 0; j < payment.voters.length; j++) { 
            hasVoted = (payment.voters[j] == msg.sender); 
            if (hasVoted) { 
                break; 
            } 
        } 
        require(!hasVoted,"Message sender not should be voted "); 

        payment.voters.push(msg.sender); 

    }
   	// 完成资金支出
    function doPayment(uint index) public { 
        Payment storage payment = payments[index];
        require(!payment.completed,"Payment should not be completed.");
        require(payment.voters.length > (investors.length)/2,"Voters should be more half of investors");
        payment.receiver.transfer(payment.amount);
        payment.completed = true;
    }
}