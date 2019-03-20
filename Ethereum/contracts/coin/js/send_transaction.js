var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


var _from = web3.eth.accounts[0];
var _to = "0x8405aaa75b400fb7aa6e6ab28a28b7731c09f565";
var _value = 5000000000;


web3.eth.sendTransaction({from: _from, to: _to, value: _value},(err,res)=>{
    if (err)
        console.log("Error:",err);
    else 
         console.log("Result:",res);
});