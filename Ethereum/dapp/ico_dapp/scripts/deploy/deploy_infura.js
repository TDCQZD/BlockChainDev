const path = require('path');
const fs = require('fs-extra');

const Web3 = require('web3'); 
const HDWalletProvider = require('truffle-hdwallet-provider');
const mnemonic = "blue destroy kind chuckle exist hundred sphere mushroom panel long neither give";
const provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050");
const web3 = new Web3(provider);

// const web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050'));

// 1. get bytecode
const filePath = path.resolve(__dirname, '../compiled/', 'ProjectList.json');
const { interface, bytecode } = require(filePath);

(async () => {
    // 2. get accounts
    let accounts = await web3.eth.getAccounts();
    // 3. get contract instance and deploy
    console.time("deploy time")
    let result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: 8000000 ,chainId: 3});
    console.timeEnd("deploy time");

    const contractAddress = result.options.address;
    console.log("constract address",contractAddress);
    // 4. write contract address to file
    const addressFile = path.resolve(__dirname, '../address.json');
    fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
    console.log("Address write succeeded :", addressFile);
    process.exit();
})();
