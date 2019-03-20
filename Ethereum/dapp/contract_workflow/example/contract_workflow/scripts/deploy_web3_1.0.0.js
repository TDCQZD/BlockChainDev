const path = require('path');
const Web3 = require('web3');// Note: web3 1.0.0

//Note:IP is determined by the dev-test environment
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const filePath = path.resolve(__dirname, '../compiled/', 'Car.json');
//Note: ‘interface’ and ‘bytecode’ cannot be modified. Generated by the compiled file.
const { interface, bytecode } = require(filePath);

(async () => {
    let accounts = await web3.eth.getAccounts();
    console.time("Contract deployment time consuming");
    let result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ["BMW"] })
        .send({ from: accounts[0], gas: 500000 });
    console.timeEnd("Contract deployment time consuming");
    
    console.log("Successful contract deployment:", result.options.address);
})();