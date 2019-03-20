const path = require('path');

const Web3 = require('web3'); 
const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = "blue destroy kind chuckle exist hundred sphere mushroom panel long neither give";
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050");
const web3 = new Web3(provider);
const address = "0x93289B62f14Af3c87a4325c6816941333d1c61be"
// const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050'));

// 1. get bytecode
const filePath = path.resolve(__dirname, '../compiled/', 'ProjectList.json');
const { interface, bytecode } = require(filePath);

 
(async () => {  
    const gas1 = web3.eth.getBlock("pending").gasLimit
    const gas2 =web3.eth.estimateGas({data: bytecode})
    console.log("gas min:",gas1)
    console.log("gas max:",gas2)
    
})();
