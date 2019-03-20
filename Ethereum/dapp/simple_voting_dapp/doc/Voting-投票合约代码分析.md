# 投票合约代码

``` voting.sol
pragma solidity ^0.4.22; //指定代码将会哪个版本的solidity编译器进行编译

contract Voting {
    /* mapping 相当于一个关联数组或者是字典，是一个键值对。
    mapping votesReceived 的键是候选者的名字，类型为 bytes32。
    mapping 的值是一个未赋值的整型，存储的是投票数。
    */
    mapping (bytes32 => uint8) public votesReceived;  
    /*
    在很多编程语言中（例如java、python中的字典<HashTable继承自字典>），仅仅通过 votesReceived.keys 就可以获取所有的候选者姓名。
    但是在 solidity 中没有这样的方法，所以我们必须单独管理一个候选者数组 candidateList。
    */ 
	bytes32[] public candidateList;
  	constructor(bytes32[] candidateNames) public {
		candidateList = candidateNames;  
	}
  	function totalVotesFor(bytes32 candidate) view public returns (uint8) {
	 	require(validCandidate(candidate));    
		return votesReceived[candidate];  
	}
	function voteForCandidate(bytes32 candidate) public {
    		require(validCandidate(candidate));    
            // votesReceived[key] 有一个默认值 0，所以你不需要将其初始化为 0，直接加1 即可。
		votesReceived[candidate]  += 1;
	}
  	function validCandidate(bytes32 candidate) view public returns (bool) {
		for(uint i = 0; i < candidateList.length; i++) {
			if (candidateList[i] == candidate) {
        			return true;      
			}    
		}    
		return false;   
	}
}
```
你也会注意到每个函数有个可见性说明符（visibility specifier）（比如本例中的 public）。这意味着，函数可以从合约外调用。如果你不想要其他任何人调用这个函数，你可以把它设置为私有（private）函数。如果你不指定可见性，编译器会抛出一个警告。最近 solidity 编译器进行了一些改进，如果用户忘记了对私有函数进行标记导致了外部可以调用私有函数，编译器会捕获这个问题。 
你也会在一些函数上看到一个修饰符 view。它通常用来告诉编译器函数是只读的（也就是说，调用该函数，区块链状态并不会更新）。

