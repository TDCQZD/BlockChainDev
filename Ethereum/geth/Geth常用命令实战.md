## Geth基本操作
``` 创世账户
34ABA7b02C8d49B684BD3FCC770d3EBAf20f4c47
```

``` 查询指定账户的余额
> eth.getBalance("0x34ABA7b02C8d49B684BD3FCC770d3EBAf20f4c47")
300000000000000000
```
> 说明：十六进制，账户地址前加0x


``` Wei 换算成以太币
> web3.fromWei(eth.getBalance("0x34ABA7b02C8d49B684BD3FCC770d3EBAf20f4c47"))
0.3

> web3.fromWei(eth.getBalance("0x34ABA7b02C8d49B684BD3FCC770d3EBAf20f4c47"),'ether')
0.3

```


``` 列出当前区块高度
> eth.blockNumber
0
```

``` 创建账户
> personal.newAccount()
Passphrase: 
Repeat passphrase: 
"0x9bbbb891258b071c265b6fd8608ca0c77c959a69"
```
> 说明：需要输入密码和确认密码.使用`keystore/UTC--XXXX`和密码可以解析出私钥。

``` 列出系统中的账户
> eth.accounts
["0x9bbbb891258b071c265b6fd8608ca0c77c959a69"]
```

``` 查看账户余额，返回值的单位是 Wei
eth.getBalance(eth.accounts[0])
user1=eth.accounts[0]
eth.getBalance(user1)
```
> 说明：user1 赋值操作只作用于当前操作

``` 解锁账户
> personal.unlockAccount(eth.accounts[0])
Unlock account 0x9bbbb891258b071c265b6fd8608ca0c77c959a69
Passphrase: 
true
```
> 说明：true:解锁成功。私链上账户进行交易时，需要进行解锁操作。

``` 交易
eth.sendTransaction({from: "0x34ABA7b02C8d49B684BD3FCC770d3EBAf20f4c47", to: eth.accounts[0], value: 10000000})
// 账户错误：本私链没有该账户
Error: unknown account
    at web3.js:3143:20
    at web3.js:6347:15
    at web3.js:5081:36
    at <anonymous>:1:1




eth.sendTransaction({from: eth.accounts[0], to: "0x34ABA7b02C8d49B684BD3FCC770d3EBAf20f4c47", value: 10000000})
// Error：账户需要解锁
Error: authentication needed: password or unlock
    at web3.js:3143:20
    at web3.js:6347:15
    at web3.js:5081:36
    at <anonymous>:1:1


> eth.sendTransaction({from: eth.accounts[0], to: "0x34ABA7b02C8d49B684BD3FCC770d3EBAf20f4c47", value: 10000000})
Error: insufficient funds for gas * price + value
    at web3.js:3143:20
    at web3.js:6347:15
    at web3.js:5081:36
    at <anonymous>:1:1

```

``` 挖矿:开始挖矿和停止挖矿
> miner.start(1)
null
> miner.stop()
null
```
``` 
> eth.blockNumber
15

> eth.getBalance(eth.accounts[0])
75000000000000000000
```
说明：以太坊初始矿工奖励为5 ether,后来改为3 ether

``` 查询矿工
> eth.coinbase
"0x9bbbb891258b071c265b6fd8608ca0c77c959a69"
```





