import Web3 from 'web3';
const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = "coil black measure pottery light error swap such material cushion pink exhaust";
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050");
let web3;
// if browser enviroment & Metamask exists
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
} else {
    web3 = new Web3(provider);
    // web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050'));
    // web3 = new Web3(new Web3.providers.HttpProvider('http://39.108.111.144:8545'));
}

export default web3;
