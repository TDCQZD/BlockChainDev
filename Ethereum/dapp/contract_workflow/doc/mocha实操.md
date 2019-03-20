## mocha实操

**1.mocha普通测试**
```
root@Aws:~/blockchain/dapp/contract_workflow# ./node_modules/.bin/mocha tests


  #sum.js
    #sum.js
      ✓ sum() should return 0
      ✓ sum(1) should return 1
      ✓ sum(1,2) should return 3
      ✓ sum(1,2,3) should return 6


  4 passing (9ms)

root@Aws:~/blockchain/dapp/contract_workflow#

```
**2.mocha合约测试**
```
root@Aws:~/blockchain/dapp/contract_workflow# node_modules/.bin/mocha tests
General test sucessfully!


  #contract
(node:3726) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit
    ✓ deployed contract sucessfully
    ✓ should has a initial brand (42ms)
    ✓ can change the brand (78ms)

  #sum.js
    #sum.js
      ✓ sum() should return 0
      ✓ sum(1) should return 1
      ✓ sum(1,2) should return 3
      ✓ sum(1,2,3) should return 6


  7 passing (397ms)

root@Aws:~/blockchain/dapp/contract_workflow# 

```
>说明：普通测试异常会阻塞后面代码，macha不会。