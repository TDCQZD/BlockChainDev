# eth_pow分析
## consensus 共识算法
> consensus.go
1. Prepare方法
2. CalcDifficulty方法：计算工作量
3. AccumulateRewards方法：计算每个块的出块奖励
4. VerifySeal方法：校验pow的工作量难度是否符合要求，返回nil则通过
5. verifyHeader方法：校验区块头是否符合共识规则

## miner 挖矿
self(*Miner).start()：
- self.worker.start() :调用所有代理cpu或者远程代理开始挖矿工作

- self.worker.commitNewWork():提交新的块，新的交易,从交易池中获取未打包的交易，然后提交交易,进行打包
    * Work.commitTransactions():验证当前work中的每一笔交易是不是合法的,如果合法就加入到当前work的交易列表中.
    * Ethash.Finalize():计算好该块的出块奖励.
    * worker.push():把当前出块的任务推送到每一个代理,通过管道的形式写入到每个代理的work管道
- CpuAgent.update()：接收并且处理写入到管道的当前块任务,调用`self.mine(work, self.quitCurrentOp)`进行挖矿,谁先计算出符合该块上面的难度hash，谁就能够产块
