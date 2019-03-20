var Web3 = require("web3");
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var arguments = process.argv.splice(2);
if (!arguments || arguments.length != 1) {
    console.log("Parameter length must be 1")
    return;
}

var _addr = arguments[0];

var abi =[{"constant":true,"inputs":[],"name":"minter","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"send","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Sent","type":"event"}]
var CoinContract = web3.eth.contract(abi);
var contractAddress = "0x8405aaa75b400fb7aa6e6ab28a28b7731c09f565";
var contractInstance = CoinContract.at(contractAddress);

contractInstance.balances(_addr, {from: _from}, (err,res)=>{
    if (err)
        console.log("Error:",err);
    else 
        console.log("Result:",res.toString());

});



