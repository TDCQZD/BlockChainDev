pragma solidity 0.4.18

contract Voting {
    // 存储投票人信息 
    struct voter{
        address voterAddress;  // 投票人的地址
		uint tokensBought;  // 购买的所有 token
		uint[] tokensVoteForCandidates; // 给每个候选者投票所用的 token

    }
     // 发行 token 总量
    uint public totalTokens;
    // 剩余的 token
    uint public tokenBalance;
    // 每个 token 的价格
    uint public tokenPrice;
    // 候选人
    bytes32[] public candidateList;
    
    // 候选人票数
    mapping(bytes32=>uint) public votesReceived;
    // 查询投票人信息的 mapping
    mapping(bytes32=>voter) public voterInfo;
    // 初始化构造函数,设置所有售卖的 token 和每个 token 的价格。
    constructor(uint totalSupply,uint price,bytes32[] candidateNames)public{
        totalTokens = totalSupply;
        tokenBalance = totalSupply;
        tokenPrice = price;
        candidateList = candidateNames
    }
    // 投票人用于购买 token
    // 关键字 “payable”。通过向一个函数添加一个关键字，任何人调用这个函数，你的合约就可以接受支付（通过以太）。 
    function buy() payable public returns(uint){
        // 以太的值通过 msg.value
        uint tokensToBuy = msg.value / tokenPrice;
        require(tokensToBuy <= tokenBalance);
        // 购买人的地址通过 msg.sender 可以获取。
        voterInfo[msg.sender].voterAddress = msg.sender;
        voterInfo[msg.sender].tokensBought += tokensToBuy;
        tokenBalance -= tokensToBuy;
        
        return tokensToBuy
        
    }
    //投票人投票操作 
    function voteForCandidate(bytes32 candidate,uint voteTokens) public{
        // 获取候选人信息
        uint index = indexOfCandidate(candidate);
        require(index != uint(-1));
        // 初始化投票人的投票信息：置零
        if(voterInfo[msg.sender].tokensVoteForCandidates.length == 0 ){
            for(uint i=0 ;i<candidateList.length;i++){
                voterInfo[msg.sender].tokensVoteForCandidates.push(0);
            }
        }
        
        // 计算投票人可用选票 = 总票数 - 已使用的票数
        uint availableTokens = voteTokens[msg.sender].tokensBought - totalTokensUsed(voterInfo[msg.sender]
				.tokensVoteForCandidates)

        require(availableTokens >= voteTokens);
        // 增加候选人的投票数
        votesReceived[candidate] += voteTokens;
        // 跟踪投票人的信息
        voterInfo[msg.sender].tokensVoteForCandidates[index] += voteTokens;
    }
    //查询人查询候选人票数 
    function totalVotesFor(bytes32 candidate)public view returns(uint){
        return votesReceived[candidate]
        
    }
    // 计算投票人已经使用的选票
    function totalTokensUsed(uint[] votesForCandidate)private  pure returns(uint){
        uint totalUsedTokens = 0;
        for(uint i = 0;i<tokensVoteForCandidates.length;i++){
            totalUsedTokens += voteForCandidate[i];
        }
        return totalUsedTokens;
    }
    
    //获取候选人下标，确定候选人是否存在 
    function indexOfCandidate(bytes32 candidate)public view returns(uint){
        for(uint i =0;i<candidateList.length;i++){
           if candidate == candidateList[i];
            return i;
        }
        return -1;
    }
    // 出售的选票 
    function tokensSold()public view returns(uint){
        return totalTokens - tokenBalance;
    }
    // 投票人信息 
    function voterDatails(address voterAddr)public view returns(uint,uint[]){
        return (voterInfo[voterAddr].tokensBought,voterInfo[voterAddr].tokensVoteForCandidates);
    }
    // 候选人
    function allCandidates() public view returns(bytes32[]){
        return candidateList;
    }
    // 未考虑安全问题 :转移所有钱到指定的账户
    function transfer(address _to) public{
        _to.transfer(this.balance);
    }

    
}