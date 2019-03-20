# 基于以太坊的众筹 (ICO) DApp

## Contracts
```
root@Aws:~/ethereum/dapp/ico_dapp# npm run compile

> ico_dapp@1.0.0 compile /root/ethereum/dapp/ico_dapp
> node scripts/compile.js

file compiled: ProjectList.sol
 > contract Project saved to /root/ethereum/dapp/ico_dapp/compiled/Project.json
 > contract ProjectList saved to /root/ethereum/dapp/ico_dapp/compiled/ProjectList.json
 > contract SafeMath saved to /root/ethereum/dapp/ico_dapp/compiled/SafeMath.json
```
```
root@Aws:~/ethereum/dapp/ico_dapp# npm run deploy

> ico_dapp@1.0.0 predeploy /root/ethereum/dapp/ico_dapp
> npm run compile


> ico_dapp@1.0.0 compile /root/ethereum/dapp/ico_dapp
> node scripts/compile.js

file compiled: ProjectList.sol
 > contract Project saved to /root/ethereum/dapp/ico_dapp/compiled/Project.json
 > contract ProjectList saved to /root/ethereum/dapp/ico_dapp/compiled/ProjectList.json
 > contract SafeMath saved to /root/ethereum/dapp/ico_dapp/compiled/SafeMath.json

> ico_dapp@1.0.0 deploy /root/ethereum/dapp/ico_dapp
> node scripts/deploy.js

deploy time: 123.100ms
constract address 0x6fcd56702075cF468e38d4BaC88a0592c35f2Ca9
Address write succeeded : /root/ethereum/dapp/ico_dapp/address.json
root@Aws:~/ethereum/dapp/ico_dapp#
```
```
root@Aws:~/ethereum/dapp/ico_dapp# npm run test

> ico_dapp@1.0.0 pretest /root/ethereum/dapp/ico_dapp
> npm run compile


> ico_dapp@1.0.0 compile /root/ethereum/dapp/ico_dapp
> node scripts/compile.js

file compiled: ProjectList.sol
 > contract Project saved to /root/ethereum/dapp/ico_dapp/compiled/Project.json
 > contract ProjectList saved to /root/ethereum/dapp/ico_dapp/compiled/ProjectList.json
 > contract SafeMath saved to /root/ethereum/dapp/ico_dapp/compiled/SafeMath.json

> ico_dapp@1.0.0 test /root/ethereum/dapp/ico_dapp
> ./node_modules/mocha/bin/mocha tests/



  Project Contract
(node:31678) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 data listeners added. Use emitter.setMaxListeners() to increase limit
    ✓ should deploy ProjectList and Project
    ✓ should save correct project properties (109ms)
    ✓ should allow investor to contribute (64ms)
    ✓ should require minInvest (47ms)


  4 passing (1s)

root@Aws:~/ethereum/dapp/ico_dapp#
```

## DApp框架搭建
```
root@Aws:~/ethereum/dapp/ico_dapp# npm run dev

> ico_dapp@1.0.0 dev /root/ethereum/dapp/ico_dapp
> node server.js

✔ success server compiled in 235ms
✔ success client compiled in 1s 768ms



 DONE  Compiled successfully in 2961ms                                            18:29:19

server started on port: 3000



 WAIT  Compiling...                                                               18:29:20

✔ success client compiled in 90ms



 DONE  Compiled successfully in 191ms                                             18:29:20

Client pings, but there's no entry for page: /
> Building page: /



 WAIT  Compiling...                                                               18:29:21

✔ success client compiled in 952ms



 DONE  Compiled successfully in 979ms                                             18:29:22

✔ success server compiled in 1s 73ms
> Disposing inactive page(s): /
✔ success server compiled in 39ms
✔ success client compiled in 133ms



 DONE  Compiled successfully in 299ms                                             18:30:27

> Building page: /



 WAIT  Compiling...                                                               18:30:27

✔ success client compiled in 279ms



 DONE  Compiled successfully in 317ms                                             18:30:27

✔ success server compiled in 381ms
```

##  项目列表
```
root@Aws:~/ethereum/dapp/ico_dapp2# node scripts/txtoaccount.js 
[ '0x5336bf10058703DCaA017f07E273A2B2d873DbE4',
  '0xb9F708587c124A27eA7391a7fEF2dA5EE23aA70D',
  '0x06eA0dCd1A0fB6a54879cf4EA8Ec1b50d8A7fC13',
  '0xe77BF2dBB0cf03f9dF44Fc274D16FF9C0Ae09E90',
  '0xDFE1E9Ba5F6401161049ADaf05DAA1c6Bf74F01f',
  '0xb98Ae72BD55ea795Ca65B5F2e1002366C643AFBe',
  '0x7c9EE7f1Fa30F6791F1731EF13691c0b9264d6ac',
  '0x5c54F086aba8135A43f785E98A14d97CC5626023',
  '0x54329097c6cf4fC3E5476c9788bAd2EB2Bddbc49',
  '0x960127dDC5418BA09380FA033b2e309aD506F081' ]
Promise { <pending> }
{ transactionHash: '0x3ee7591893b40c1b5f711dfbc15aff92a37e5ecf010d3dde25bfcecdae8fa1bd',
  transactionIndex: 0,
  blockHash: '0x438ee7d33e18611f68014046b85e805f0e3d57cc39255c73c55a6f4f19d24fdd',
  blockNumber: 2,
  from: '0x960127ddc5418ba09380fa033b2e309ad506f081',
  to: '0x93289b62f14af3c87a4325c6816941333d1c61be',
  gasUsed: 21000,
  cumulativeGasUsed: 21000,
  contractAddress: null,
  logs: [],
  status: true,
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  v: '0x1c',
  r: '0x1dfc0442dd85be60b5a2f7839944db69db5404759997957220b1217c8d4ae48e',
  s: '0x2be27c6eca0dcb7acd5e9f3315c17065e77da1640caa07365d4bcc404ec42757' }
```

```
root@Aws:~/ethereum/dapp/ico_dapp2# node scripts/sample.js 
[ '0x5336bf10058703DCaA017f07E273A2B2d873DbE4',
  '0xb9F708587c124A27eA7391a7fEF2dA5EE23aA70D',
  '0x06eA0dCd1A0fB6a54879cf4EA8Ec1b50d8A7fC13',
  '0xe77BF2dBB0cf03f9dF44Fc274D16FF9C0Ae09E90',
  '0xDFE1E9Ba5F6401161049ADaf05DAA1c6Bf74F01f',
  '0xb98Ae72BD55ea795Ca65B5F2e1002366C643AFBe',
  '0x7c9EE7f1Fa30F6791F1731EF13691c0b9264d6ac',
  '0x5c54F086aba8135A43f785E98A14d97CC5626023',
  '0x54329097c6cf4fC3E5476c9788bAd2EB2Bddbc49',
  '0x960127dDC5418BA09380FA033b2e309aD506F081' ]
[ { description: 'Ethereum DApp Tutorial',
    minInvest: '10000000000000000',
    maxInvest: '100000000000000000',
    goal: '1000000000000000000' },
  { description: 'Ethereum Video Tutorial',
    minInvest: '100000000000000000',
    maxInvest: '1000000000000000000',
    goal: '5000000000000000000' } ]
[ { transactionHash: '0x69d41c96481225598404c58c8b26244b890f43eff406ca4c93c005a1b74f3970',
    transactionIndex: 0,
    blockHash: '0x226f5fb08557966b6c55e20b917ac651eee12493a16c10e081eb27920e040eca',
    blockNumber: 4,
    from: '0x5336bf10058703dcaa017f07e273a2b2d873dbe4',
    to: '0xd8ab2089811770caa5f634fcaf137b5ecb4e249d',
    gasUsed: 955593,
    cumulativeGasUsed: 955593,
    contractAddress: null,
    status: true,
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    v: '0x1c',
    r: '0x7ac4cc09112c915bcb0a28261dc8c8e6891386deef416ec991a5843c71b10625',
    s: '0x1e14b6c44c71c3f12a5bb7eb34d32e22912d856f28b7e58aacababb16179379e',
    events: {} },
  { transactionHash: '0x21bf038a204e99075b6ba5a24a8a407073bf7d4203a6f0f226bfb380dad9cd97',
    transactionIndex: 0,
    blockHash: '0xf01f903e30ca744d1d6252537a5eafdb48d7252fc6ee87e600c7335eb2f7b3be',
    blockNumber: 5,
    from: '0x5336bf10058703dcaa017f07e273a2b2d873dbe4',
    to: '0xd8ab2089811770caa5f634fcaf137b5ecb4e249d',
    gasUsed: 940721,
    cumulativeGasUsed: 940721,
    contractAddress: null,
    status: true,
    logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    v: '0x1b',
    r: '0x7333f1c50e6129f39099bdf15f708b69e6138dd0bbfe38d690328753c8eba586',
    s: '0x7fc63aabdee5c76aa18b41beee711a5c79128778665271379ee6d9848a854273',
    events: {} } ]

```