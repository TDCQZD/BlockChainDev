

## 合约编译部署
```
root@Aws:~/ethereum/dapp/token_voting_dapp# truffle compile
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/Voting.sol...

Compilation warnings encountered:

/root/ethereum/dapp/token_voting_dapp/contracts/Migrations.sol:11:3: Warning: Defining constructors as functions with the same name as the contract is deprecated. Use "constructor(...) { ... }" instead.
  function Migrations() public {
  ^ (Relevant source part starts here and spans across multiple lines).
,/root/ethereum/dapp/token_voting_dapp/contracts/Voting.sol:77:20: Warning: Using contract member "balance" inherited from the address type is deprecated. Convert the contract to "address" type to access the member, for example use "address(contract).balance" instead.
		account.transfer(this.balance); 
		                 ^----------^

Writing artifacts to ./build/contracts


root@Aws:~/ethereum/dapp/token_voting_dapp# truffle migrate
Using network 'development'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x105dd0a638825e709c2e4e4665ded84e37f111a0cb37fac1b66d4e3ac4e07d78
  Migrations: 0xff917815f2faada1295261c967c0fa4d0d505089
Saving successful migration to network...
  ... 0x50fb41e0da8393cb16e0617c4e9c63a568145a88271e1cb3b809a46b76c5158a
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying Voting...
  ... 0xdd6e859996bd4a8636e3d9f38de4d593060db589fdf2d26c16c839307cf96f4a
  Voting: 0xddfbe66399f2a6b7c5fbed713388755cee7ffa05
Saving successful migration to network...
  ... 0x7c0c6077a346cf2bf67840b98683eaee62d01ee31f60f543ecbc2a9902872bf1
Saving artifacts...
root@Aws:~/ethereum/dapp/token_voting_dapp# 
```
## 控制台交互
```
truffle(development)> Voting.deployed().then(function(instance) {instance.totalVotesFor.call('Alice').then(function(i) {console.log(i)})})
undefined
truffle(development)> BigNumber { s: 1, e: 0, c: [ 0 ] }

undefined
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.totalTokens.call().then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> BigNumber { s: 1, e: 4, c: [ 10000 ] }

undefined
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.tokensSold.call().then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> BigNumber { s: 1, e: 0, c: [ 0 ] }

undefined
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.buy({value: web3.toWei('1', 'ether')}).then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> web3.eth.getBalance(web3.eth.accounts[0])
BigNumber { s: 1, e: 0, c: [ 0 ] }
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.tokensSold.call().then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> BigNumber { s: 1, e: 0, c: [ 0 ] }

undefined
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.voteForCandidate('Alice', 25).then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.voteForCandidate('Bob', 10).then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.voteForCandidate('Cary', 10).then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> Voting.deployed().then(function(instance) {console.log(instance.voterDetails.call(web3.eth.accounts[0]).then(function(v) {console.log(v)}))})
Promise {
  <pending>,
  domain: 
   Domain {
     domain: null,
     _events: { error: [Function: debugDomainError] },
     _eventsCount: 1,
     _maxListeners: undefined,
     members: [] } }
undefined
truffle(development)> [ BigNumber { s: 1, e: 0, c: [ 0 ] }, [] ]

undefined
truffle(development)> Voting.deployed().then(function(instance) {instance.totalVotesFor.call('Alice').then(function(i) {console.log(i)})})
undefined
truffle(development)> BigNumber { s: 1, e: 0, c: [ 0 ] }

undefined
truffle(development)> web3.eth.getBalance(Voting.address).toNumber()
0

```

## 测试
```
root@Aws:~/ethereum/dapp/token_voting_dapp# truffle test test/TestVoting.sol
Using network 'development'.

Compiling ./contracts/Voting.sol...
Compiling ./test/TestVoting.sol...
Compiling truffle/Assert.sol...
Compiling truffle/DeployedAddresses.sol...

Compilation warnings encountered:

/root/ethereum/dapp/token_voting_dapp/contracts/Voting.sol:77:20: Warning: Using contract member "balance" inherited from the address type is deprecated. Convert the contract to "address" type to access the member, for example use "address(contract).balance" instead.
		account.transfer(this.balance); 
		                 ^----------^



  TestVoting
    ✓ testInitialTokenBalanceUsingDeployedContract (83ms)
    ✓ testBuyTokens (94ms)


  2 passing (1s)

root@Aws:~/ethereum/dapp/token_voting_dapp# 
```

```
root@Aws:~/ethereum/dapp/token_voting_dapp# truffle test test/voting.js
Using network 'development'.



  Contract: Voting
    ✓ should be able to buy tokens (345ms)
    ✓ should be able to vote for candidates (443ms)


  2 passing (813ms)

root@Aws:~/ethereum/dapp/token_voting_dapp#
```