import Web3 from 'web3';
import getConfig from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig();

let web3;

// if browser enviroment & Metamask exists
if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    web3 = new Web3(window.web3.currentProvider);
} else {
    // web3 = new Web3(new Web3.providers.HttpProvider('http://39.108.111.144:8545'));
    web3 = new Wb3(new Web3.providers.HttpProvider(publicRuntimeConfig.providerUrl));}

export default web3;
