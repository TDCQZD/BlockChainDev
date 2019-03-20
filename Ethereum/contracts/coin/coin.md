# coin 简单代币合约

```
> var abi = [{"constant":true,"inputs":[],"name":"minter","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"receiver","type":"address"},{"name":"amount","type":"uint256"}],"name":"send","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Sent","type":"event"}]

```

```
> var CoinContract = web3.eth.contract(abi)
```

```
var byteCode = '0x' + '608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550610479806100606000396000f3fe608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063075461721461006757806327e235e3146100be57806340c10f1914610123578063d0679d341461017e575b600080fd5b34801561007357600080fd5b5061007c6101d9565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b3480156100ca57600080fd5b5061010d600480360360208110156100e157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506101fe565b6040518082815260200191505060405180910390f35b34801561012f57600080fd5b5061017c6004803603604081101561014657600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610216565b005b34801561018a57600080fd5b506101d7600480360360408110156101a157600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803590602001909291905050506102c2565b005b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60016020528060005260406000206000915090505481565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614151561027157600080fd5b80600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505050565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054811115151561031057600080fd5b80600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555080600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055507f3990db2d31862302a685e8086b5755072a6e2b5b780af1ee81ece35ee3cd3345338383604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828152602001935050505060405180910390a1505056fea165627a7a72305820457f0c45225f36c38126d4299c00af5e4a9a3069dfbd2fa2767af8b930963a550029'

```

```
var deployTxObject = {from: web3.eth.accounts[0],data: byteCode, gas:1000000}

```

```
var coinContractInstance = CoinContract.new(deployTxObject)
```

```
> coinContractInstance
{
  abi: [{
      constant: true,
      inputs: [],
      name: "minter",
      outputs: [{...}],
      payable: false,
      stateMutability: "view",
      type: "function"
  }, {
      constant: true,
      inputs: [{...}],
      name: "balances",
      outputs: [{...}],
      payable: false,
      stateMutability: "view",
      type: "function"
  }, {
      constant: false,
      inputs: [{...}, {...}],
      name: "mint",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
  }, {
      constant: false,
      inputs: [{...}, {...}],
      name: "send",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function"
  }, {
      inputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor"
  }, {
      anonymous: false,
      inputs: [{...}, {...}, {...}],
      name: "Sent",
      type: "event"
  }],
  address: "0x8405aaa75b400fb7aa6e6ab28a28b7731c09f565",
  transactionHash: "0x8a19299e28d0c58ae63124fe20a241e139d918108d1ed0ea4b4b0d1176ff8411",
  Sent: function(),
  allEvents: function(),
  balances: function(),
  mint: function(),
  minter: function(),
  send: function()
}

```
```
> coinContractInstance.address
"0x8405aaa75b400fb7aa6e6ab28a28b7731c09f565"
```