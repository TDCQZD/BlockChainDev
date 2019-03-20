const assert = require('assert')
const path = require('path')
const Web3 = require('web3')
const ganache = require('ganache-cli')

const web3 = new Web3(ganache.provider())
const contractPath = path.resolve(__dirname, '../compiled/', 'Car.json')
const { interface, bytecode } = require(contractPath)

let contract;
let accounts;
const initialBrand = 'BMW';

describe('#contract', () => {
    before(() => {
        console.log("Test start!");
    });
    beforeEach(
        async () => {
            accounts = await web3.eth.getAccounts();
            contract = await new web3.eth.Contract(JSON.parse(interface))
                .deploy({ data: bytecode, arguments: [initialBrand] })
                .send({ from: accounts[0], gas: 3000000 });
            console.log("Contract has been deployed!");
        });
    afterEach(() => {
        console.log("Current test has been completed!");
    });
    after(() => {
        console.log("End of Test!");
    });



    it('deployed contract sucessfully', () => {
        assert.ok(contract.options.address);
    });
    it('should has a initial brand', async () => {
        let brand = await contract.methods.brand().call();
        assert.equal(brand, initialBrand);
    });
    it('can change the brand', async () => {
        const newBrand = 'Benz';
        await contract.methods.setBrand(newBrand)
            .send({ from: accounts[0] });
        const brand = await contract.methods.brand().call();
        assert.equal(brand, newBrand);
    });


})