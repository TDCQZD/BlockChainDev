const Web3 = require('web3');

const web3 = new Web3(new Web3.providers.HttpProvider('http://39.108.111.144:8545'));
// config 配置
// const config = require('config');
// const web3 = new Web3(new Web3.providers.HttpProvider(config.get('providerUrl')));

(async () => {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
    console.log(web3.eth.getBalance(accounts[0]))
    // 0xdEB144dBF30308cE72Fd4544Fdc8Fc3F86D3d703
    const  tx= await web3.eth.sendTransaction({from: accounts[8], to: "0xdEB144dBF30308cE72Fd4544Fdc8Fc3F86D3d703", value: 50000000000000000000})
    console.log(tx);  
   
})();
