# solc.js

## 安装
!(solidity)[https://solidity.readthedocs.io/en/latest/installing-solidity.html]
```
sudo add-apt-repository ppa:ethereum/ethereum
sudo add-apt-repository ppa:ethereum/ethereum-dev
sudo apt-get update
sudo apt-get install solc

solcjs --version
```
> 以上方式安装：执行 `solcjs --abi Coin.sol` 不会生成`Coin_sol_Coin.abi`文件，但会打印出来。
```
npm install -g solc

solcjs version
```