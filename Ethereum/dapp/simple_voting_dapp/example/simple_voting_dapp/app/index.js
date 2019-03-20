var web3 =new Web3(new Web3.providers.HttpProvider("http://39.108.111.144:8545"));

// abi 合约编译字节码
var abi = JSON.parse('[{"constant":true,"inputs":[{"name":"candidateName","type":"bytes32"}],"name":"totalVotesFor","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"votesReceived","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"candidateList","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"candidateName","type":"bytes32"}],"name":"voteForCandidate","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"candidateNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');
//合约地址因部署的区块链环境不同而改变
var contractAddr = "0x647f350f2144d4d2d41274bbd7101c5f7cc3340a";
var VotingContract = web3.eth.contract(abi);
var contractInstance = VotingContract.at(contractAddr);

var candidates =  {"Alice": "candidate-1", "Bob": "candidate-2", "Cary": "candidate-3"};

// 投票
function voteForCandidate() {
    var candidateName = $("#candidate").val();
    try{
        contractInstance.voteForCandidate(candidateName,{from: web3.eth.accounts[0]},(err,res)=>{
            if(err){
                console.log("Error:",err)
            }else{
                let div_id =candidates[candidateName];
                let count = contractInstance.totalVotesFor(candidateName).toString();
                $("#"+div_id).html(count);
            }
            
        });
    } catch (error) {
        console.log(err);
    }
}

$(document).ready(function () {
    var candidateNames = Object.keys(candidates);
    for (let i = 0; i < candidateNames.length; i++) {
        let name = candidateNames[i];
        let val = contractInstance.totalVotesFor.call(name).toString();
        $("#"+candidates[name]).html(val);
        
    }
});