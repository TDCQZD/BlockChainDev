pragma solidity ^0.4.22;

contract Voting {
   
    //候选人列表
    bytes32[] public candidateList;
     //每一个候选人票数
    mapping (bytes32 => uint8) public votesReceived;
   
    
    constructor (bytes32[] candidateNames) public {
        candidateList = candidateNames;
    }
    
 
    // 查询候选人得票数
    function totalVotesFor(bytes32 candidateName)  public view returns (uint8){
        require(validCandidate(candidateName));
        return votesReceived[candidateName];
    }

    // 投票
    function voteForCandidate(bytes32 candidateName) public {
        require(validCandidate(candidateName));
        votesReceived[candidateName] +=1;
    }
    // 验证投票候选人
    function validCandidate(bytes32 candidateName) internal view  returns(bool){
        for (uint8 i = 0; i < candidateList.length; i++) {
            if ( candidateName == candidateList[i]){
                return true;
            }
        }
    }
}