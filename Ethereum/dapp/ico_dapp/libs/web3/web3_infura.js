var Web3 = require('web3'); 
let web3;

var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = "blue destroy kind chuckle exist hundred sphere mushroom panel long neither give";
var provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050");


if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
} else {
    // web3 = new Web3(new Web3.providers.HttpProvider('http://39.108.111.144:8545'));
    web3 = new Web3(provider);
}
export default web3;
