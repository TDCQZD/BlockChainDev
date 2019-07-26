# eth_pow分析.md
eth目前的共识算法pow的整理

## 涉及的代码子包主要有consensus,miner,core,geth

```
/consensus 共识算法
　　  consensus.go
         1. Prepare方法
         2. CalcDifficulty方法：计算工作量
         3. AccumulateRewards方法：计算每个块的出块奖励
         4. VerifySeal方法：校验pow的工作量难度是否符合要求，返回nil则通过
         5. verifyHeader方法：校验区块头是否符合共识规则
```



/miner 挖矿

work.go
- commitNewWork():提交新的块，新的交易,从交易池中获取未打包的交易，然后提交交易,进行打包

__核心代码__:
```
         // Create the current work task and check any fork transitions needed
            work := self.current
            if self.config.DAOForkSupport && self.config.DAOForkBlock != nil && self.config.DAOForkBlock.Cmp(header.Number) == 0 {
                misc.ApplyDAOHardFork(work.state)
            }
            pending, err := self.eth.TxPool().Pending()
            if err != nil {
                log.Error("Failed to fetch pending transactions", "err", err)
                return
            }
            txs := types.NewTransactionsByPriceAndNonce(self.current.signer, pending)
            work.commitTransactions(self.mux, txs, self.chain, self.coinbase)

```



```
eth/handler.go
    NewProtocolManager --> verifyHeader -->  VerifySeal

```

__整条链的运行,打包交易,出块的流程__
```
/cmd/geth/main.go/main
    makeFullNode-->RegisterEthService-->eth.New-->NewProtocolManager --> verifyHeader -->  VerifySeal

```
## eth的共识算法pow调用栈详解


 核心的逻辑需要从/eth/handler.go/NewProtocolManager方法下开始,关键代码:
```
manager.downloader = downloader.New(mode, chaindb, manager.eventMux, blockchain, nil, manager.removePeer)

    validator := func(header *types.Header) error {
        return engine.VerifyHeader(blockchain, header, true)
    }
    heighter := func() uint64 {
        return blockchain.CurrentBlock().NumberU64()
    }
    inserter := func(blocks types.Blocks) (int, error) {
        // If fast sync is running, deny importing weird blocks
        if atomic.LoadUint32(&manager.fastSync) == 1 {
            log.Warn("Discarded bad propagated block", "number", blocks[0].Number(), "hash", blocks[0].Hash())
            return 0, nil
        }
        atomic.StoreUint32(&manager.acceptTxs, 1) // Mark initial sync done on any fetcher import
        return manager.blockchain.InsertChain(blocks)
    }
    manager.fetcher = fetcher.New(blockchain.GetBlockByHash, validator, manager.BroadcastBlock, heighter, inserter, manager.removePeer)

    return manager, nil
```

 该方法中生成了一个校验区块头部的对象`validator`

 让我们继续跟进`engine.VerifyHeader(blockchain, header, true)`方法:

```
// VerifyHeader checks whether a header conforms to the consensus rules of the
// stock Ethereum ethash engine.
func (ethash *Ethash) VerifyHeader(chain consensus.ChainReader, header *types.Header, seal bool) error {
    // If we're running a full engine faking, accept any input as valid
    if ethash.fakeFull {
        return nil
    }
    // Short circuit if the header is known, or it's parent not
    number := header.Number.Uint64()
    if chain.GetHeader(header.Hash(), number) != nil {
        return nil
    }
    parent := chain.GetHeader(header.ParentHash, number-1)
    if parent == nil {
        return consensus.ErrUnknownAncestor
    }
    // Sanity checks passed, do a proper verification
    return ethash.verifyHeader(chain, header, parent, false, seal)
}

```

首先看第一个if,它的逻辑判断是如果为true,那么就关闭所有的共识规则校验,紧跟着两个if判断是只要该block的header的hash和number或者上一个header的hash和number存在链上,那么它header的共识规则校验就通过,如果都不通过,那么该区块校验失败跑出错误.如果走到最后一个return,那么就需要做一些其他额外验证

```
// verifyHeader checks whether a header conforms to the consensus rules of the
// stock Ethereum ethash engine.
// See YP section 4.3.4. "Block Header Validity"
func (ethash *Ethash) verifyHeader(chain consensus.ChainReader, header, parent *types.Header, uncle bool, seal bool) error {
    // Ensure that the header's extra-data section is of a reasonable size
    if uint64(len(header.Extra)) > params.MaximumExtraDataSize {
        return fmt.Errorf("extra-data too long: %d > %d", len(header.Extra), params.MaximumExtraDataSize)
    }
    // Verify the header's timestamp
    if uncle {
        if header.Time.Cmp(math.MaxBig256) > 0 {
            return errLargeBlockTime
        }
    } else {
        if header.Time.Cmp(big.NewInt(time.Now().Unix())) > 0 {
            return consensus.ErrFutureBlock
        }
    }
    if header.Time.Cmp(parent.Time) <= 0 {
        return errZeroBlockTime
    }
    // Verify the block's difficulty based in it's timestamp and parent's difficulty
    expected := CalcDifficulty(chain.Config(), header.Time.Uint64(), parent)
    if expected.Cmp(header.Difficulty) != 0 {
        return fmt.Errorf("invalid difficulty: have %v, want %v", header.Difficulty, expected)
    }
    // Verify that the gas limit is <= 2^63-1
    if header.GasLimit.Cmp(math.MaxBig63) > 0 {
        return fmt.Errorf("invalid gasLimit: have %v, max %v", header.GasLimit, math.MaxBig63)
    }
    // Verify that the gasUsed is <= gasLimit
    if header.GasUsed.Cmp(header.GasLimit) > 0 {
        return fmt.Errorf("invalid gasUsed: have %v, gasLimit %v", header.GasUsed, header.GasLimit)
    }

    // Verify that the gas limit remains within allowed bounds
    diff := new(big.Int).Set(parent.GasLimit)
    diff = diff.Sub(diff, header.GasLimit)
    diff.Abs(diff)

    limit := new(big.Int).Set(parent.GasLimit)
    limit = limit.Div(limit, params.GasLimitBoundDivisor)

    if diff.Cmp(limit) >= 0 || header.GasLimit.Cmp(params.MinGasLimit) < 0 {
        return fmt.Errorf("invalid gas limit: have %v, want %v += %v", header.GasLimit, parent.GasLimit, limit)
    }
    // Verify that the block number is parent's +1
    if diff := new(big.Int).Sub(header.Number, parent.Number); diff.Cmp(big.NewInt(1)) != 0 {
        return consensus.ErrInvalidNumber
    }
    // Verify the engine specific seal securing the block
    if seal {
        if err := ethash.VerifySeal(chain, header); err != nil {
            return err
        }
    }
    // If all checks passed, validate any special fields for hard forks
    if err := misc.VerifyDAOHeaderExtraData(chain.Config(), header); err != nil {
        return err
    }
    if err := misc.VerifyForkHashes(chain.Config(), header, uncle); err != nil {
        return err
    }
    return nil
}

```
该方法会去校验该区块头中的extra数据是不是比约定的参数最大值还大,如果超过,则返回错误,其次会去判断该区块是不是一个uncle区块,如果header的时间戳不符合规则则返回错误,然后根据链的配置,header的时间戳以及上一个区块计算中本次区块期待的难度,如果header的难度和期待的不一致,或header的gasLimit比最大数字还大,或已用的gas超过gasLimit,则返回错误.如果gasLimit超过预定的最大值或最小值,或header的number减去上一个block的header的number不为1,则返回错误.`seal`为true,则会去校验该区块是否符合pow的工作量证明的要求(`verifySeal`方法),因为私有链一般是不需要pow.最后两个if是去判断区块是否具有正确的hash,防止用户在不同的链上,以及校验块头的额外数据字段是否符合DAO硬叉规则

## uncle block:
eth允许旷工在挖到一个块的同时包含一组uncle block列表,主要有两个作用:
1. 由于网络传播的延迟原因,通过奖励那些由于不是链组成区块部分而产生陈旧或孤立区块的旷工,从而减少集权激励
2. 通过增加在主链上的工作量来增加链条的安全性(在工作中,少浪费工作在陈旧的块上)

eth的pow核心代码:

```
// CalcDifficulty is the difficulty adjustment algorithm. It returns
// the difficulty that a new block should have when created at time
// given the parent block's time and difficulty.
// TODO (karalabe): Move the chain maker into this package and make this private!
func CalcDifficulty(config *params.ChainConfig, time uint64, parent *types.Header) *big.Int {
    next := new(big.Int).Add(parent.Number, big1)
    switch {
    case config.IsByzantium(next):
        return calcDifficultyByzantium(time, parent)
    case config.IsHomestead(next):
        return calcDifficultyHomestead(time, parent)
    default:
        return calcDifficultyFrontier(time, parent)
    }
}
```
 该方法的第一个`case`是根据拜占庭规则去计算新块应该具有的难度,第二个`case`是根据宅基地规则去计算新块应该具有的难度,第三个`case`是根据边界规则去计算难度


## pow计算生成新块代码解析
 __/consensus/seal.go/seal__

 ```
 // Seal implements consensus.Engine, attempting to find a nonce that satisfies
 // the block's difficulty requirements.
 func (ethash *Ethash) Seal(chain consensus.ChainReader, block *types.Block, stop <-chan struct{}) (*types.Block, error) {
    // If we're running a fake PoW, simply return a 0 nonce immediately
    if ethash.fakeMode {
        header := block.Header()
        header.Nonce, header.MixDigest = types.BlockNonce{}, common.Hash{}
        return block.WithSeal(header), nil
    }
    // If we're running a shared PoW, delegate sealing to it
    if ethash.shared != nil {
        return ethash.shared.Seal(chain, block, stop)
    }
    // Create a runner and the multiple search threads it directs
    abort := make(chan struct{})
    found := make(chan *types.Block)

    ethash.lock.Lock()
    threads := ethash.threads
    if ethash.rand == nil {
        seed, err := crand.Int(crand.Reader, big.NewInt(math.MaxInt64))
        if err != nil {
            ethash.lock.Unlock()
            return nil, err
        }
        ethash.rand = rand.New(rand.NewSource(seed.Int64()))
    }
    ethash.lock.Unlock()
    if threads == 0 {
        threads = runtime.NumCPU()
    }
    if threads < 0 {
        threads = 0 // Allows disabling local mining without extra logic around local/remote
    }
    var pend sync.WaitGroup
    for i := 0; i < threads; i++ {
        pend.Add(1)
        go func(id int, nonce uint64) {
            defer pend.Done()
            ethash.mine(block, id, nonce, abort, found)
        }(i, uint64(ethash.rand.Int63()))
    }
    // Wait until sealing is terminated or a nonce is found
    var result *types.Block
    select {
    case <-stop:
        // Outside abort, stop all miner threads
        close(abort)
    case result = <-found:
        // One of the threads found a block, abort all others
        close(abort)
    case <-ethash.update:
        // Thread count was changed on user request, restart
        close(abort)
        pend.Wait()
        return ethash.Seal(chain, block, stop)
    }
    // Wait for all miners to terminate and return the block
    pend.Wait()
    return result, nil
 }

 ```

 该方法的foreach中并行挖新块,一旦停止或者找到新快,则废弃其他所有的,如果协程计算有变更,则重新调用方法

 好了pow挖矿的核心方法已经出现,｀ethash.mine｀,如果挖取到新块,那么就写入到`found channel`

```
// mine is the actual proof-of-work miner that searches for a nonce starting from
// seed that results in correct final block difficulty.
func (ethash *Ethash) mine(block *types.Block, id int, seed uint64, abort chan struct{}, found chan *types.Block) {
    // Extract some data from the header
    var (
        header = block.Header()
        hash   = header.HashNoNonce().Bytes()
        target = new(big.Int).Div(maxUint256, header.Difficulty)

        number  = header.Number.Uint64()
        dataset = ethash.dataset(number)
    )
    // Start generating random nonces until we abort or find a good one
    var (
        attempts = int64(0)
        nonce    = seed
    )
    logger := log.New("miner", id)
    logger.Trace("Started ethash search for new nonces", "seed", seed)
    for {
        select {
        case <-abort:
            // Mining terminated, update stats and abort
            logger.Trace("Ethash nonce search aborted", "attempts", nonce-seed)
            ethash.hashrate.Mark(attempts)
            return

        default:
            // We don't have to update hash rate on every nonce, so update after after 2^X nonces
            attempts++
            if (attempts % (1 << 15)) == 0 {
                ethash.hashrate.Mark(attempts)
                attempts = 0
            }
            // Compute the PoW value of this nonce
            digest, result := hashimotoFull(dataset, hash, nonce)
            if new(big.Int).SetBytes(result).Cmp(target) <= 0 {
                // Correct nonce found, create a new header with it
                header = types.CopyHeader(header)
                header.Nonce = types.EncodeNonce(nonce)
                header.MixDigest = common.BytesToHash(digest)

                // Seal and return a block (if still needed)
                select {
                case found <- block.WithSeal(header):
                    logger.Trace("Ethash nonce found and reported", "attempts", nonce-seed, "nonce", nonce)
                case <-abort:
                    logger.Trace("Ethash nonce found but discarded", "attempts", nonce-seed, "nonce", nonce)
                }
                return
            }
            nonce++
        }
    }
}


```

 `target`是目标新块的难度,`hashimotoFull`方法计算出一个hash值,如果产生的`hash`值小于等于`target`的值,则hash难度符合要求,将符合要求的`header`写入到`found channel`中,并返回,否则一直循环

```
// hashimotoFull aggregates data from the full dataset (using the full in-memory
// dataset) in order to produce our final value for a particular header hash and
// nonce.
func hashimotoFull(dataset []uint32, hash []byte, nonce uint64) ([]byte, []byte) {
    lookup := func(index uint32) []uint32 {
        offset := index * hashWords
        return dataset[offset : offset+hashWords]
    }
    return hashimoto(hash, nonce, uint64(len(dataset))*4, lookup)
}

```

```
// hashimoto aggregates data from the full dataset in order to produce our final
// value for a particular header hash and nonce.
func hashimoto(hash []byte, nonce uint64, size uint64, lookup func(index uint32) []uint32) ([]byte, []byte) {
    // Calculate the number of theoretical rows (we use one buffer nonetheless)
    rows := uint32(size / mixBytes)

    // Combine header+nonce into a 64 byte seed
    seed := make([]byte, 40)
    copy(seed, hash)
    binary.LittleEndian.PutUint64(seed[32:], nonce)

    seed = crypto.Keccak512(seed)
    seedHead := binary.LittleEndian.Uint32(seed)

    // Start the mix with replicated seed
    mix := make([]uint32, mixBytes/4)
    for i := 0; i < len(mix); i++ {
        mix[i] = binary.LittleEndian.Uint32(seed[i%16*4:])
    }
    // Mix in random dataset nodes
    temp := make([]uint32, len(mix))

    for i := 0; i < loopAccesses; i++ {
        parent := fnv(uint32(i)^seedHead, mix[i%len(mix)]) % rows
        for j := uint32(0); j < mixBytes/hashBytes; j++ {
            copy(temp[j*hashWords:], lookup(2*parent+j))
        }
        fnvHash(mix, temp)
    }
    // Compress mix
    for i := 0; i < len(mix); i += 4 {
        mix[i/4] = fnv(fnv(fnv(mix[i], mix[i+1]), mix[i+2]), mix[i+3])
    }
    mix = mix[:len(mix)/4]

    digest := make([]byte, common.HashLength)
    for i, val := range mix {
        binary.LittleEndian.PutUint32(digest[i*4:], val)
    }
    return digest, crypto.Keccak256(append(seed, digest...))
}

```

 可以看到,该方法是不断的进行sha256的hash运算,然后返回进行hash值难度的对比,如果hash的十六进制大小小于等于预定的难度,那么这个hash就是符合产块要求的

产生一个随机seed,赋给nonce随机数，然后进行sha256的hash运算,如果算出的hash难度不符合目标难度,则nonce+1，继续运算



worker.go/wait()
```
func (self *worker) wait() {
    for {
        mustCommitNewWork := true
        for result := range self.recv {
            atomic.AddInt32(&self.atWork, -1)

            if result == nil {
                continue
            }

```
agent.go/mine()方法

```
func (self *CpuAgent) mine(work *Work, stop <-chan struct{}) {
    if result, err := self.engine.Seal(self.chain, work.Block, stop); result != nil {
        log.Info("Successfully sealed new block", "number", result.Number(), "hash", result.Hash())
        self.returnCh <- &Result{work, result}
    } else {
        if err != nil {
            log.Warn("Block sealing failed", "err", err)
        }
        self.returnCh <- nil
    }
}
```
如果挖到一个新块，则将结果写到self的return管道中


写块的方法WriteBlockAndState

wait方法接收self.recv管道的结果，如果有结果，说明本地挖到新块了，则将新块进行存储，
并把该块放到待确认的block判定区

miner.go/update方法，如果有新块出来，则停止挖矿进行下载同步新块，如果下载完成或失败的事件，则继续开始挖矿.


```
/geth/main.go/geth　--> makeFullNode --> utils.RegisterEthService

--> eth.New(ctx, cfg)　--> miner.New(eth, eth.chainConfig, eth.EventMux(), eth.engine)
```

这个是启动链后到挖矿，共识代码的整个调用栈，开始分析核心方法

```
func New(eth Backend, config *params.ChainConfig, mux *event.TypeMux, engine consensus.Engine) *Miner {
    miner := &Miner{
        eth:      eth,
        mux:      mux,
        engine:   engine,
        worker:   newWorker(config, engine, common.Address{}, eth, mux),
        canStart: 1,
    }
    miner.Register(NewCpuAgent(eth.BlockChain(), engine))
    go miner.update()

    return miner
}
```
从miner.Update()的逻辑可以看出，对于任何一个Ethereum网络中的节点来说，挖掘一个新区块和从其他节点下载、同步一个新区块，根本是相互冲突的。这样的规定，保证了在某个节点上，一个新区块只可能有一种来源，这可以大大降低可能出现的区块冲突，并避免全网中计算资源的浪费。

首先是:
```
func (self *Miner) Register(agent Agent) {
    if self.Mining() {
        agent.Start()
    }
    self.worker.register(agent)
}

func (self *worker) register(agent Agent) {
    self.mu.Lock()
    defer self.mu.Unlock()
    self.agents[agent] = struct{}{}
    agent.SetReturnCh(self.recv)
}
```
该方法中将self的recv管道绑定在了agent的return管道


然后是newWorker方法
```
func newWorker(config *params.ChainConfig, engine consensus.Engine, coinbase common.Address, eth Backend, mux *event.TypeMux) *worker {
    worker := &worker{
        config:         config,
        engine:         engine,
        eth:            eth,
        mux:            mux,
        txCh:           make(chan core.TxPreEvent, txChanSize),
        chainHeadCh:    make(chan core.ChainHeadEvent, chainHeadChanSize),
        chainSideCh:    make(chan core.ChainSideEvent, chainSideChanSize),
        chainDb:        eth.ChainDb(),
        recv:           make(chan *Result, resultQueueSize),
        chain:          eth.BlockChain(),
        proc:           eth.BlockChain().Validator(),
        possibleUncles: make(map[common.Hash]*types.Block),
        coinbase:       coinbase,
        agents:         make(map[Agent]struct{}),
        unconfirmed:    newUnconfirmedBlocks(eth.BlockChain(), miningLogAtDepth),
    }
    // Subscribe TxPreEvent for tx pool
    worker.txSub = eth.TxPool().SubscribeTxPreEvent(worker.txCh)
    // Subscribe events for blockchain
    worker.chainHeadSub = eth.BlockChain().SubscribeChainHeadEvent(worker.chainHeadCh)
    worker.chainSideSub = eth.BlockChain().SubscribeChainSideEvent(worker.chainSideCh)
    go worker.update()

    go worker.wait()
    worker.commitNewWork()

    return worker
}

```
该方法中绑定了三个管道,额外启动了两个goroutine执行update和wait方法,
```
func (self *worker) update() {
    defer self.txSub.Unsubscribe()
    defer self.chainHeadSub.Unsubscribe()
    defer self.chainSideSub.Unsubscribe()

    for {
        // A real event arrived, process interesting content
        select {
        // Handle ChainHeadEvent
        case <-self.chainHeadCh:
            self.commitNewWork()

        // Handle ChainSideEvent
        case ev := <-self.chainSideCh:
            self.uncleMu.Lock()
            self.possibleUncles[ev.Block.Hash()] = ev.Block
            self.uncleMu.Unlock()

        // Handle TxPreEvent
        case ev := <-self.txCh:
            // Apply transaction to the pending state if we're not mining
            if atomic.LoadInt32(&self.mining) == 0 {
                self.currentMu.Lock()
                acc, _ := types.Sender(self.current.signer, ev.Tx)
                txs := map[common.Address]types.Transactions{acc: {ev.Tx}}
                txset := types.NewTransactionsByPriceAndNonce(self.current.signer, txs)

                self.current.commitTransactions(self.mux, txset, self.chain, self.coinbase)
                self.currentMu.Unlock()
            } else {
                // If we're mining, but nothing is being processed, wake on new transactions
                if self.config.Clique != nil && self.config.Clique.Period == 0 {
                    self.commitNewWork()
                }
            }

        // System stopped
        case <-self.txSub.Err():
            return
        case <-self.chainHeadSub.Err():
            return
        case <-self.chainSideSub.Err():
            return
        }
    }
}


```
worker.update方法中接收各种事件，并且是永久循环，如果有错误事件发生，则终止，如果有新的交易事件，则执行commitTransactions验证提交交易到本地的trx判定池中,供下次出块使用worker.wait的方法接收self.recv管道的结果，也就是本地新挖出的块，如果有挖出，则写入块数据，并广播一个chainHeadEvent事件,同时将该块添加到待确认列表中，并且提交一个新的工作量，commitNewWork方法相当于共识的第一个阶段，它会组装一个标准的块，其他包含产出该块需要的难度，然后将产出该块的工作以及块信息广播给所有代理，接着agent.go中的update方法监听到广播新块工作量的任务，开始挖矿，抢该块的出块权
```
func (self *CpuAgent) mine(work *Work, stop <-chan struct{}) {
    if result, err := self.engine.Seal(self.chain, work.Block, stop); result != nil {
        log.Info("Successfully sealed new block", "number", result.Number(), "hash", result.Hash())
        self.returnCh <- &Result{work, result}
    } else {
        if err != nil {
            log.Warn("Block sealing failed", "err", err)
        }
        self.returnCh <- nil
    }
}
```
该方法中开始进行块的hash难度计算，如果返回的result结果不为空，说明挖矿成功，将结果写入到returnCh通道中

然后worker.go中的wait方法又接收到了信息开始处理.


如果不是组装好带有随机数hash的，那么存储块将会返回错误,
```
    stat, err := self.chain.WriteBlockAndState(block, work.receipts, work.state)
            if err != nil {
                log.Error("Failed writing block to chain", "err", err)
                continue
            }
            
 ```           
remote_agent 提供了一套RPC接口，可以实现远程矿工进行采矿的功能。 比如我有一个矿机，矿机内部没有运行以太坊节点，矿机首先从remote_agent获取当前的任务，然后进行挖矿计算，当挖矿完成后，提交计算结果，完成挖矿。
## eth共识算法分析,从本地节点挖到块开始分析


### 首先目前生产环境上面，肯定不是以CPU的形式挖矿的,那么就是`remoteAgent`这种形式,也就是矿机通过网络请求从以太的节点获取当前节点的出块任务,

然后矿机根据算出符合该块难度hash值,提交给节点,也就是对应的以下方法.

```
func (a *RemoteAgent) SubmitWork(nonce types.BlockNonce, mixDigest, hash common.Hash) bool {
    a.mu.Lock()
    defer a.mu.Unlock()

    // Make sure the work submitted is present
    work := a.work[hash]
    if work == nil {
        log.Info("Work submitted but none pending", "hash", hash)
        return false
    }
    // Make sure the Engine solutions is indeed valid
    result := work.Block.Header()
    result.Nonce = nonce
    result.MixDigest = mixDigest

    if err := a.engine.VerifySeal(a.chain, result); err != nil {
        log.Warn("Invalid proof-of-work submitted", "hash", hash, "err", err)
        return false
    }
    block := work.Block.WithSeal(result)

    // Solutions seems to be valid, return to the miner and notify acceptance
    a.returnCh <- &Result{work, block}
    delete(a.work, hash)

    return true
}

```

该方法会校验提交过来的块的hash难度,如果是正常的话,则会将该生成的块写到管道中,管道接收的方法在/miner/worker.go/Wait方法中

```
func (self *worker) wait() {
    for {
        mustCommitNewWork := true
        for result := range self.recv {
            atomic.AddInt32(&self.atWork, -1)

            if result == nil {
                continue
            }
            block := result.Block
            work := result.Work

            // Update the block hash in all logs since it is now available and not when the
            // receipt/log of individual transactions were created.
            for _, r := range work.receipts {
                for _, l := range r.Logs {
                    l.BlockHash = block.Hash()
                }
            }
            for _, log := range work.state.Logs() {
                log.BlockHash = block.Hash()
            }
            stat, err := self.chain.WriteBlockAndState(block, work.receipts, work.state)
            if err != nil {
                log.Error("Failed writing block to chain", "err", err)
                continue
            }
            // check if canon block and write transactions
            if stat == core.CanonStatTy {
                // implicit by posting ChainHeadEvent
                mustCommitNewWork = false
            }
            // Broadcast the block and announce chain insertion event
            //　通过p2p的形式将块广播到连接的节点,走的还是channel
            self.mux.Post(core.NewMinedBlockEvent{Block: block})
            var (
                events []interface{}
                logs   = work.state.Logs()
            )
            events = append(events, core.ChainEvent{Block: block, Hash: block.Hash(), Logs: logs})
            if stat == core.CanonStatTy {
                events = append(events, core.ChainHeadEvent{Block: block})
            }
            self.chain.PostChainEvents(events, logs)

            // Insert the block into the set of pending ones to wait for confirmations
            self.unconfirmed.Insert(block.NumberU64(), block.Hash())

            if mustCommitNewWork {
                self.commitNewWork()
            }
        }
    }
}

```

这里发送了一个新挖到块的事件,接着跟,调用栈是
```
/geth/main.go/geth　--> startNode　--> utils.StartNode(stack)
--> stack.Start()　--> /node/node.go/Start() --> service.Start(running)
--> /eth/backend.go/Start() --> /eth/handler.go/Start()

```
好了核心逻辑在handler.go/Start()里面

```
func (pm *ProtocolManager) Start(maxPeers int) {
    pm.maxPeers = maxPeers

    // broadcast transactions
    // 广播交易的通道。 txCh会作为txpool的TxPreEvent订阅通道。txpool有了这种消息会通知给这个txCh。 广播交易的goroutine会把这个消息广播出去。
    pm.txCh = make(chan core.TxPreEvent, txChanSize)
    // 订阅的回执
    pm.txSub = pm.txpool.SubscribeTxPreEvent(pm.txCh)
    go pm.txBroadcastLoop()

    // 订阅挖矿消息。当新的Block被挖出来的时候会产生消息。 这个订阅和上面的那个订阅采用了两种不同的模式，这种是标记为Deprecated的订阅方式。
    // broadcast mined blocks
    pm.minedBlockSub = pm.eventMux.Subscribe(core.NewMinedBlockEvent{})
    //　挖矿广播 goroutine 当挖出来的时候需要尽快的广播到网络上面去 本地挖出的块通过这种形式广播出去
    go pm.minedBroadcastLoop()
    // 同步器负责周期性地与网络同步，下载散列和块以及处理通知处理程序。
    // start sync handlers
    go pm.syncer()
    // txsyncLoop负责每个新连接的初始事务同步。 当新的peer出现时，我们转发所有当前待处理的事务。 为了最小化出口带宽使用，我们一次只发送一个小包。
    go pm.txsyncLoop()
}

```
`pm.minedBroadcastLoop()`里面就有管道接收到上面post出来的出块消息,跟进去将会看到通过p2p网络发送给节点的逻辑

```
// BroadcastBlock will either propagate a block to a subset of it's peers, or
// will only announce it's availability (depending what's requested).
func (pm *ProtocolManager) BroadcastBlock(block *types.Block, propagate bool) {
    hash := block.Hash()
    peers := pm.peers.PeersWithoutBlock(hash)

    // If propagation is requested, send to a subset of the peer
    if propagate {
        // Calculate the TD of the block (it's not imported yet, so block.Td is not valid)
        var td *big.Int
        if parent := pm.blockchain.GetBlock(block.ParentHash(), block.NumberU64()-1); parent != nil {
            td = new(big.Int).Add(block.Difficulty(), pm.blockchain.GetTd(block.ParentHash(), block.NumberU64()-1))
        } else {
            log.Error("Propagating dangling block", "number", block.Number(), "hash", hash)
            return
        }
        // Send the block to a subset of our peers
        transfer := peers[:int(math.Sqrt(float64(len(peers))))]
        for _, peer := range transfer {
            peer.SendNewBlock(block, td)
        }
        log.Trace("Propagated block", "hash", hash, "recipients", len(transfer), "duration", common.PrettyDuration(time.Since(block.ReceivedAt)))
        return
    }
    // Otherwise if the block is indeed in out own chain, announce it
    if pm.blockchain.HasBlock(hash, block.NumberU64()) {
        for _, peer := range peers {
            peer.SendNewBlockHashes([]common.Hash{hash}, []uint64{block.NumberU64()})
        }
        log.Trace("Announced block", "hash", hash, "recipients", len(peers), "duration", common.PrettyDuration(time.Since(block.ReceivedAt)))
    }
}
```

这里面会发送两种时间，一种是`NewBlockMsg`,另外一种是`NewBlockHashesMsg`,好了到此本地节点挖到的块就通过p2p网络的形式开始扩散出去了
接着看下一个重要的方法

```
// NewProtocolManager returns a new ethereum sub protocol manager. The Ethereum sub protocol manages peers capable
// with the ethereum network.
func NewProtocolManager(config *params.ChainConfig, mode downloader.SyncMode, networkId uint64, mux *event.TypeMux, txpool txPool, engine consensus.Engine, blockchain *core.BlockChain, chaindb ethdb.Database) (*ProtocolManager, error) {
    // Create the protocol manager with the base fields
    manager := &ProtocolManager{
        networkId:   networkId,
        eventMux:    mux,
        txpool:      txpool,
        blockchain:  blockchain,
        chaindb:     chaindb,
        chainconfig: config,
        peers:       newPeerSet(),
        newPeerCh:   make(chan *peer),
        noMorePeers: make(chan struct{}),
        txsyncCh:    make(chan *txsync),
        quitSync:    make(chan struct{}),
    }
    // Figure out whether to allow fast sync or not
    if mode == downloader.FastSync && blockchain.CurrentBlock().NumberU64() > 0 {
        log.Warn("Blockchain not empty, fast sync disabled")
        mode = downloader.FullSync
    }
    if mode == downloader.FastSync {
        manager.fastSync = uint32(1)
    }
    // Initiate a sub-protocol for every implemented version we can handle
    manager.SubProtocols = make([]p2p.Protocol, 0, len(ProtocolVersions))
    for i, version := range ProtocolVersions {
        // Skip protocol version if incompatible with the mode of operation
        if mode == downloader.FastSync && version < eth63 {
            continue
        }
        // Compatible; initialise the sub-protocol
        version := version // Closure for the run
        manager.SubProtocols = append(manager.SubProtocols, p2p.Protocol{
            Name:    ProtocolName,
            Version: version,
            Length:  ProtocolLengths[i],
            Run: func(p *p2p.Peer, rw p2p.MsgReadWriter) error {
                peer := manager.newPeer(int(version), p, rw)
                select {
                case manager.newPeerCh <- peer:
                    manager.wg.Add(1)
                    defer manager.wg.Done()
                    return manager.handle(peer)
                case <-manager.quitSync:
                    return p2p.DiscQuitting
                }
            },
            NodeInfo: func() interface{} {
                return manager.NodeInfo()
            },
            PeerInfo: func(id discover.NodeID) interface{} {
                if p := manager.peers.Peer(fmt.Sprintf("%x", id[:8])); p != nil {
                    return p.Info()
                }
                return nil
            },
        })
    }
    if len(manager.SubProtocols) == 0 {
        return nil, errIncompatibleConfig
    }
    // downloader是负责从其他的peer来同步自身数据。
    // downloader是全链同步工具
    // Construct the different synchronisation mechanisms
    manager.downloader = downloader.New(mode, chaindb, manager.eventMux, blockchain, nil, manager.removePeer)

    validator := func(header *types.Header) error {
        return engine.VerifyHeader(blockchain, header, true)
    }
    heighter := func() uint64 {
        return blockchain.CurrentBlock().NumberU64()
    }
    inserter := func(blocks types.Blocks) (int, error) {
        // If fast sync is running, deny importing weird blocks
        if atomic.LoadUint32(&manager.fastSync) == 1 {
            log.Warn("Discarded bad propagated block", "number", blocks[0].Number(), "hash", blocks[0].Hash())
            return 0, nil
        }
        // 设置开始接收交易
        atomic.StoreUint32(&manager.acceptTxs, 1) // Mark initial sync done on any fetcher import
        return manager.blockchain.InsertChain(blocks)
    }
    // 生成一个fetcher
    // Fetcher负责积累来自各个peer的区块通知并安排进行检索。
    manager.fetcher = fetcher.New(blockchain.GetBlockByHash, validator, manager.BroadcastBlock, heighter, inserter, manager.removePeer)

    return manager, nil
}

```
该方法是用来管理以太坊协议下的多个子协议,其中的`Run`方法在每个节点启动的时候就会调用,可以看到是阻塞的,跟进`handler`方法能看到这样的一块关键代码

```
for {
        if err := pm.handleMsg(p); err != nil {
            p.Log().Debug("Ethereum message handling failed", "err", err)
            return err
        }
    }

```

死循环,处理p2p网络过来的消息,接着看`handleMsg`方法

```
func (pm *ProtocolManager) handleMsg(p *peer) error {
    // Read the next message from the remote peer, and ensure it's fully consumed
    msg, err := p.rw.ReadMsg()
    if err != nil {
        return err
    }
    if msg.Size > ProtocolMaxMsgSize {
        return errResp(ErrMsgTooLarge, "%v > %v", msg.Size, ProtocolMaxMsgSize)
    }
    defer msg.Discard()

    // Handle the message depending on its contents
    switch {
    case msg.Code == StatusMsg:
        // Status messages should never arrive after the handshake
        return errResp(ErrExtraStatusMsg, "uncontrolled status message")

    // Block header query, collect the requested headers and reply
    case msg.Code == GetBlockHeadersMsg:
        // Decode the complex header query
        var query getBlockHeadersData
        if err := msg.Decode(&query); err != nil {
            return errResp(ErrDecode, "%v: %v", msg, err)
        }
        hashMode := query.Origin.Hash != (common.Hash{})

        // Gather headers until the fetch or network limits is reached
        var (
            bytes   common.StorageSize
            headers []*types.Header
            unknown bool
        )
        for !unknown && len(headers) < int(query.Amount) && bytes < softResponseLimit && len(headers) < downloader.MaxHeaderFetch {
            // Retrieve the next header satisfying the query
            var origin *types.Header
            if hashMode {
                origin = pm.blockchain.GetHeaderByHash(query.Origin.Hash)
            } else {
                origin = pm.blockchain.GetHeaderByNumber(query.Origin.Number)
            }
            if origin == nil {
                break
            }
            number := origin.Number.Uint64()
            headers = append(headers, origin)
            bytes += estHeaderRlpSize

            // Advance to the next header of the query
            switch {
            case query.Origin.Hash != (common.Hash{}) && query.Reverse:
                // Hash based traversal towards the genesis block
                for i := 0; i < int(query.Skip)+1; i++ {
                    if header := pm.blockchain.GetHeader(query.Origin.Hash, number); header != nil {
                        query.Origin.Hash = header.ParentHash
                        number--
                    } else {
                        unknown = true
                        break
                    }
                }
            case query.Origin.Hash != (common.Hash{}) && !query.Reverse:
                // Hash based traversal towards the leaf block
                var (
                    current = origin.Number.Uint64()
                    next    = current + query.Skip + 1
                )
                if next <= current {
                    infos, _ := json.MarshalIndent(p.Peer.Info(), "", "  ")
                    p.Log().Warn("GetBlockHeaders skip overflow attack", "current", current, "skip", query.Skip, "next", next, "attacker", infos)
                    unknown = true
                } else {
                    if header := pm.blockchain.GetHeaderByNumber(next); header != nil {
                        if pm.blockchain.GetBlockHashesFromHash(header.Hash(), query.Skip+1)[query.Skip] == query.Origin.Hash {
                            query.Origin.Hash = header.Hash()
                        } else {
                            unknown = true
                        }
                    } else {
                        unknown = true
                    }
                }
            case query.Reverse:
                // Number based traversal towards the genesis block
                if query.Origin.Number >= query.Skip+1 {
                    query.Origin.Number -= (query.Skip + 1)
                } else {
                    unknown = true
                }

            case !query.Reverse:
                // Number based traversal towards the leaf block
                query.Origin.Number += (query.Skip + 1)
            }
        }
        return p.SendBlockHeaders(headers)

    case msg.Code == BlockHeadersMsg:
        // A batch of headers arrived to one of our previous requests
        var headers []*types.Header
        if err := msg.Decode(&headers); err != nil {
            return errResp(ErrDecode, "msg %v: %v", msg, err)
        }
        // If no headers were received, but we're expending a DAO fork check, maybe it's that
        if len(headers) == 0 && p.forkDrop != nil {
            // Possibly an empty reply to the fork header checks, sanity check TDs
            verifyDAO := true

            // If we already have a DAO header, we can check the peer's TD against it. If
            // the peer's ahead of this, it too must have a reply to the DAO check
            if daoHeader := pm.blockchain.GetHeaderByNumber(pm.chainconfig.DAOForkBlock.Uint64()); daoHeader != nil {
                if _, td := p.Head(); td.Cmp(pm.blockchain.GetTd(daoHeader.Hash(), daoHeader.Number.Uint64())) >= 0 {
                    verifyDAO = false
                }
            }
            // If we're seemingly on the same chain, disable the drop timer
            if verifyDAO {
                p.Log().Debug("Seems to be on the same side of the DAO fork")
                p.forkDrop.Stop()
                p.forkDrop = nil
                return nil
            }
        }
        // Filter out any explicitly requested headers, deliver the rest to the downloader
        filter := len(headers) == 1
        if filter {
            // If it's a potential DAO fork check, validate against the rules
            if p.forkDrop != nil && pm.chainconfig.DAOForkBlock.Cmp(headers[0].Number) == 0 {
                // Disable the fork drop timer
                p.forkDrop.Stop()
                p.forkDrop = nil

                // Validate the header and either drop the peer or continue
                if err := misc.VerifyDAOHeaderExtraData(pm.chainconfig, headers[0]); err != nil {
                    p.Log().Debug("Verified to be on the other side of the DAO fork, dropping")
                    return err
                }
                p.Log().Debug("Verified to be on the same side of the DAO fork")
                return nil
            }
            // Irrelevant of the fork checks, send the header to the fetcher just in case
            headers = pm.fetcher.FilterHeaders(p.id, headers, time.Now())
        }
        if len(headers) > 0 || !filter {
            err := pm.downloader.DeliverHeaders(p.id, headers)
            if err != nil {
                log.Debug("Failed to deliver headers", "err", err)
            }
        }

    case msg.Code == GetBlockBodiesMsg:
        // Decode the retrieval message
        msgStream := rlp.NewStream(msg.Payload, uint64(msg.Size))
        if _, err := msgStream.List(); err != nil {
            return err
        }
        // Gather blocks until the fetch or network limits is reached
        var (
            hash   common.Hash
            bytes  int
            bodies []rlp.RawValue
        )
        for bytes < softResponseLimit && len(bodies) < downloader.MaxBlockFetch {
            // Retrieve the hash of the next block
            if err := msgStream.Decode(&hash); err == rlp.EOL {
                break
            } else if err != nil {
                return errResp(ErrDecode, "msg %v: %v", msg, err)
            }
            // Retrieve the requested block body, stopping if enough was found
            if data := pm.blockchain.GetBodyRLP(hash); len(data) != 0 {
                bodies = append(bodies, data)
                bytes += len(data)
            }
        }
        return p.SendBlockBodiesRLP(bodies)

    case msg.Code == BlockBodiesMsg:
        // A batch of block bodies arrived to one of our previous requests
        var request blockBodiesData
        if err := msg.Decode(&request); err != nil {
            return errResp(ErrDecode, "msg %v: %v", msg, err)
        }
        // Deliver them all to the downloader for queuing
        trasactions := make([][]*types.Transaction, len(request))
        uncles := make([][]*types.Header, len(request))

        for i, body := range request {
            trasactions[i] = body.Transactions
            uncles[i] = body.Uncles
        }
        // Filter out any explicitly requested bodies, deliver the rest to the downloader
        filter := len(trasactions) > 0 || len(uncles) > 0
        if filter {
            trasactions, uncles = pm.fetcher.FilterBodies(p.id, trasactions, uncles, time.Now())
        }
        if len(trasactions) > 0 || len(uncles) > 0 || !filter {
            err := pm.downloader.DeliverBodies(p.id, trasactions, uncles)
            if err != nil {
                log.Debug("Failed to deliver bodies", "err", err)
            }
        }

    case p.version >= eth63 && msg.Code == GetNodeDataMsg:
        // Decode the retrieval message
        msgStream := rlp.NewStream(msg.Payload, uint64(msg.Size))
        if _, err := msgStream.List(); err != nil {
            return err
        }
        // Gather state data until the fetch or network limits is reached
        var (
            hash  common.Hash
            bytes int
            data  [][]byte
        )
        for bytes < softResponseLimit && len(data) < downloader.MaxStateFetch {
            // Retrieve the hash of the next state entry
            if err := msgStream.Decode(&hash); err == rlp.EOL {
                break
            } else if err != nil {
                return errResp(ErrDecode, "msg %v: %v", msg, err)
            }
            // Retrieve the requested state entry, stopping if enough was found
            if entry, err := pm.chaindb.Get(hash.Bytes()); err == nil {
                data = append(data, entry)
                bytes += len(entry)
            }
        }
        return p.SendNodeData(data)

    case p.version >= eth63 && msg.Code == NodeDataMsg:
        // A batch of node state data arrived to one of our previous requests
        var data [][]byte
        if err := msg.Decode(&data); err != nil {
            return errResp(ErrDecode, "msg %v: %v", msg, err)
        }
        // Deliver all to the downloader
        if err := pm.downloader.DeliverNodeData(p.id, data); err != nil {
            log.Debug("Failed to deliver node state data", "err", err)
        }

    case p.version >= eth63 && msg.Code == GetReceiptsMsg:
        // Decode the retrieval message
        msgStream := rlp.NewStream(msg.Payload, uint64(msg.Size))
        if _, err := msgStream.List(); err != nil {
            return err
        }
        // Gather state data until the fetch or network limits is reached
        var (
            hash     common.Hash
            bytes    int
            receipts []rlp.RawValue
        )
        for bytes < softResponseLimit && len(receipts) < downloader.MaxReceiptFetch {
            // Retrieve the hash of the next block
            if err := msgStream.Decode(&hash); err == rlp.EOL {
                break
            } else if err != nil {
                return errResp(ErrDecode, "msg %v: %v", msg, err)
            }
            // Retrieve the requested block's receipts, skipping if unknown to us
            results := core.GetBlockReceipts(pm.chaindb, hash, core.GetBlockNumber(pm.chaindb, hash))
            if results == nil {
                if header := pm.blockchain.GetHeaderByHash(hash); header == nil || header.ReceiptHash != types.EmptyRootHash {
                    continue
                }
            }
            // If known, encode and queue for response packet
            if encoded, err := rlp.EncodeToBytes(results); err != nil {
                log.Error("Failed to encode receipt", "err", err)
            } else {
                receipts = append(receipts, encoded)
                bytes += len(encoded)
            }
        }
        return p.SendReceiptsRLP(receipts)

    case p.version >= eth63 && msg.Code == ReceiptsMsg:
        // A batch of receipts arrived to one of our previous requests
        var receipts [][]*types.Receipt
        if err := msg.Decode(&receipts); err != nil {
            return errResp(ErrDecode, "msg %v: %v", msg, err)
        }
        // Deliver all to the downloader
        if err := pm.downloader.DeliverReceipts(p.id, receipts); err != nil {
            log.Debug("Failed to deliver receipts", "err", err)
        }

    case msg.Code == NewBlockHashesMsg:
        var announces newBlockHashesData
        if err := msg.Decode(&announces); err != nil {
            return errResp(ErrDecode, "%v: %v", msg, err)
        }
        // Mark the hashes as present at the remote node
        for _, block := range announces {
            p.MarkBlock(block.Hash)
        }
        // Schedule all the unknown hashes for retrieval
        unknown := make(newBlockHashesData, 0, len(announces))
        for _, block := range announces {
            if !pm.blockchain.HasBlock(block.Hash, block.Number) {
                unknown = append(unknown, block)
            }
        }
        for _, block := range unknown {
            pm.fetcher.Notify(p.id, block.Hash, block.Number, time.Now(), p.RequestOneHeader, p.RequestBodies)
        }

    case msg.Code == NewBlockMsg:
        // Retrieve and decode the propagated block
        var request newBlockData
        if err := msg.Decode(&request); err != nil {
            return errResp(ErrDecode, "%v: %v", msg, err)
        }
        request.Block.ReceivedAt = msg.ReceivedAt
        request.Block.ReceivedFrom = p

        // Mark the peer as owning the block and schedule it for import
        p.MarkBlock(request.Block.Hash())
        pm.fetcher.Enqueue(p.id, request.Block)

        // Assuming the block is importable by the peer, but possibly not yet done so,
        // calculate the head hash and TD that the peer truly must have.
        var (
            trueHead = request.Block.ParentHash()
            trueTD   = new(big.Int).Sub(request.TD, request.Block.Difficulty())
        )
        // Update the peers total difficulty if better than the previous
        if _, td := p.Head(); trueTD.Cmp(td) > 0 {
            p.SetHead(trueHead, trueTD)

            // Schedule a sync if above ours. Note, this will not fire a sync for a gap of
            // a singe block (as the true TD is below the propagated block), however this
            // scenario should easily be covered by the fetcher.
            currentBlock := pm.blockchain.CurrentBlock()
            if trueTD.Cmp(pm.blockchain.GetTd(currentBlock.Hash(), currentBlock.NumberU64())) > 0 {
                go pm.synchronise(p)
            }
        }

    case msg.Code == TxMsg:
        // Transactions arrived, make sure we have a valid and fresh chain to handle them
        if atomic.LoadUint32(&pm.acceptTxs) == 0 {
            break
        }
        // Transactions can be processed, parse all of them and deliver to the pool
        var txs []*types.Transaction
        if err := msg.Decode(&txs); err != nil {
            return errResp(ErrDecode, "msg %v: %v", msg, err)
        }
        for i, tx := range txs {
            // Validate and mark the remote transaction
            if tx == nil {
                return errResp(ErrDecode, "transaction %d is nil", i)
            }
            p.MarkTransaction(tx.Hash())
        }
        pm.txpool.AddRemotes(txs)

    default:
        return errResp(ErrInvalidMsgCode, "%v", msg.Code)
    }
    return nil
}
```

该方法中就解码了p2p网络过来的消息，并且处理了`NewBlockMsg`和`NewBlockHashesMsg`这两种事件,如`NewBlockMsg`中的处理逻辑是直接通过管道发送到本地了,`pm.fetcher.Enqueue(p.id, request.Block)`
,对应的管道名是:`f.inject`,其中是一个队列,/fetcher.go/enqueue方法中写入了一个FIFO队列中

```
func (f *Fetcher) enqueue(peer string, block *types.Block) {
    hash := block.Hash()

    // Ensure the peer isn't DOSing us
    count := f.queues[peer] + 1
    if count > blockLimit {
        log.Debug("Discarded propagated block, exceeded allowance", "peer", peer, "number", block.Number(), "hash", hash, "limit", blockLimit)
        propBroadcastDOSMeter.Mark(1)
        f.forgetHash(hash)
        return
    }
    // Discard any past or too distant blocks
    if dist := int64(block.NumberU64()) - int64(f.chainHeight()); dist < -maxUncleDist || dist > maxQueueDist {
        log.Debug("Discarded propagated block, too far away", "peer", peer, "number", block.Number(), "hash", hash, "distance", dist)
        propBroadcastDropMeter.Mark(1)
        f.forgetHash(hash)
        return
    }
    // Schedule the block for future importing
    if _, ok := f.queued[hash]; !ok {
        op := &inject{
            origin: peer,
            block:  block,
        }
        f.queues[peer] = count
        f.queued[hash] = op
        f.queue.Push(op, -float32(block.NumberU64()))
        if f.queueChangeHook != nil {
            f.queueChangeHook(op.block.Hash(), true)
        }
        log.Debug("Queued propagated block", "peer", peer, "number", block.Number(), "hash", hash, "queued", f.queue.Size())
    }
}

```

该队列的消费端在/fetcher.go/loop中,是一个死循环,核心代码

```
for !f.queue.Empty() {
            op := f.queue.PopItem().(*inject)
            if f.queueChangeHook != nil {
                f.queueChangeHook(op.block.Hash(), false)
            }
            // If too high up the chain or phase, continue later
            number := op.block.NumberU64()
            if number > height+1 {
                f.queue.Push(op, -float32(op.block.NumberU64()))
                if f.queueChangeHook != nil {
                    f.queueChangeHook(op.block.Hash(), true)
                }
                break
            }
            // Otherwise if fresh and still unknown, try and import
            hash := op.block.Hash()
            if number+maxUncleDist < height || f.getBlock(hash) != nil {
                f.forgetBlock(hash)
                continue
            }
            f.insert(op.origin, op.block)
        }

```

从队列中取出,接着看`insert`方法

```
func (f *Fetcher) insert(peer string, block *types.Block) {
    hash := block.Hash()

    // Run the import on a new thread
    log.Debug("Importing propagated block", "peer", peer, "number", block.Number(), "hash", hash)
    go func() {
        defer func() { f.done <- hash }()

        // If the parent's unknown, abort insertion
        parent := f.getBlock(block.ParentHash())
        if parent == nil {
            log.Debug("Unknown parent of propagated block", "peer", peer, "number", block.Number(), "hash", hash, "parent", block.ParentHash())
            return
        }
        // Quickly validate the header and propagate the block if it passes
        switch err := f.verifyHeader(block.Header()); err {
        case nil:
            // All ok, quickly propagate to our peers
            propBroadcastOutTimer.UpdateSince(block.ReceivedAt)
            go f.broadcastBlock(block, true)

        case consensus.ErrFutureBlock:
            // Weird future block, don't fail, but neither propagate

        default:
            // Something went very wrong, drop the peer
            log.Debug("Propagated block verification failed", "peer", peer, "number", block.Number(), "hash", hash, "err", err)
            f.dropPeer(peer)
            return
        }
        // Run the actual import and log any issues
        if _, err := f.insertChain(types.Blocks{block}); err != nil {
            log.Debug("Propagated block import failed", "peer", peer, "number", block.Number(), "hash", hash, "err", err)
            return
        }
        // If import succeeded, broadcast the block
        propAnnounceOutTimer.UpdateSince(block.ReceivedAt)
        go f.broadcastBlock(block, false)

        // Invoke the testing hook if needed
        if f.importedHook != nil {
            f.importedHook(block)
        }
    }()
}


```

可以看到,该方法会调用`verifyHeader`方法去校验区块，如果没问题的话就通过p2p的形式广播出去,然后调用`insertChain`方法插入到本地的leveldb中,插入没问题的话，会再广播一次,不过这次只会广播block的hash,

如此，通过一个对等网络,只要块合法,那么就会被全网采纳,其中的`verifyHeader`,`insertChain`方法都是在`/handler.go/NewProtocolManager`中定义传过来的,所有启动的逻辑都是`handler.go/Start`方法中.

fetch.go的start方法在`syncer`方法中用一个单独的协程触发的

`/handler.go/handleMsg --> go pm.synchronise(p) --> pm.downloader.Synchronise(peer.id, pHead, pTd, mode) --> d.synchronise(id, head, td, mode)
--> d.syncWithPeer(p, hash, td)`,让我们看下核心方法

```
func (d *Downloader) syncWithPeer(p *peerConnection, hash common.Hash, td *big.Int) (err error) {
    d.mux.Post(StartEvent{})
    defer func() {
        // reset on error
        if err != nil {
            d.mux.Post(FailedEvent{err})
        } else {
            d.mux.Post(DoneEvent{})
        }
    }()
    if p.version < 62 {
        return errTooOld
    }

    log.Debug("Synchronising with the network", "peer", p.id, "eth", p.version, "head", hash, "td", td, "mode", d.mode)
    defer func(start time.Time) {
        log.Debug("Synchronisation terminated", "elapsed", time.Since(start))
    }(time.Now())

    // Look up the sync boundaries: the common ancestor and the target block
    latest, err := d.fetchHeight(p)
    if err != nil {
        return err
    }
    height := latest.Number.Uint64()

    origin, err := d.findAncestor(p, height)
    if err != nil {
        return err
    }
    d.syncStatsLock.Lock()
    if d.syncStatsChainHeight <= origin || d.syncStatsChainOrigin > origin {
        d.syncStatsChainOrigin = origin
    }
    d.syncStatsChainHeight = height
    d.syncStatsLock.Unlock()

    // Initiate the sync using a concurrent header and content retrieval algorithm
    pivot := uint64(0)
    switch d.mode {
    case LightSync:
        pivot = height
    case FastSync:
        // Calculate the new fast/slow sync pivot point
        if d.fsPivotLock == nil {
            pivotOffset, err := rand.Int(rand.Reader, big.NewInt(int64(fsPivotInterval)))
            if err != nil {
                panic(fmt.Sprintf("Failed to access crypto random source: %v", err))
            }
            if height > uint64(fsMinFullBlocks)+pivotOffset.Uint64() {
                pivot = height - uint64(fsMinFullBlocks) - pivotOffset.Uint64()
            }
        } else {
            // Pivot point locked in, use this and do not pick a new one!
            pivot = d.fsPivotLock.Number.Uint64()
        }
        // If the point is below the origin, move origin back to ensure state download
        if pivot < origin {
            if pivot > 0 {
                origin = pivot - 1
            } else {
                origin = 0
            }
        }
        log.Debug("Fast syncing until pivot block", "pivot", pivot)
    }
    d.queue.Prepare(origin+1, d.mode, pivot, latest)
    if d.syncInitHook != nil {
        d.syncInitHook(origin, height)
    }

    fetchers := []func() error{
        func() error { return d.fetchHeaders(p, origin+1) }, // Headers are always retrieved
        func() error { return d.fetchBodies(origin + 1) },   // Bodies are retrieved during normal and fast sync
        func() error { return d.fetchReceipts(origin + 1) }, // Receipts are retrieved during fast sync
        func() error { return d.processHeaders(origin+1, td) },
    }
    if d.mode == FastSync {
        fetchers = append(fetchers, func() error { return d.processFastSyncContent(latest) })
    } else if d.mode == FullSync {
        fetchers = append(fetchers, d.processFullSyncContent)
    }
    err = d.spawnSync(fetchers)
    if err != nil && d.mode == FastSync && d.fsPivotLock != nil {
        // If sync failed in the critical section, bump the fail counter.
        atomic.AddUint32(&d.fsPivotFails, 1)
    }
    return err
}
```

由于上述整个调用栈是在`newBlockMsg`的条件中触发的,这里的`StartEvent`会通过通道的形式传递到miner.go/update中
```
func (self *Miner) update() {
    events := self.mux.Subscribe(downloader.StartEvent{}, downloader.DoneEvent{}, downloader.FailedEvent{})
out:
    for ev := range events.Chan() {
        switch ev.Data.(type) {
        case downloader.StartEvent:
            atomic.StoreInt32(&self.canStart, 0)
            if self.Mining() {
                self.Stop()
                atomic.StoreInt32(&self.shouldStart, 1)
                log.Info("Mining aborted due to sync")
            }
        case downloader.DoneEvent, downloader.FailedEvent:
            shouldStart := atomic.LoadInt32(&self.shouldStart) == 1

            atomic.StoreInt32(&self.canStart, 1)
            atomic.StoreInt32(&self.shouldStart, 0)
            if shouldStart {
                self.Start(self.coinbase)
            }
            // unsubscribe. we're only interested in this event once
            events.Unsubscribe()
            // stop immediately and ignore all further pending events
            break out
        }
    }
}

```

可以看到接收到这个`StartEvent`就会通知所有的代理，调用`stop`停止当前相同块的挖矿,`remote_Agent`中的`stop`方法


最后再看一下新块如何广播给其他节点的,处理的方法在`/eth/handle.go/BroadcastBlock`

```
func (pm *ProtocolManager) BroadcastBlock(block *types.Block, propagate bool) {
    hash := block.Hash()
    peers := pm.peers.PeersWithoutBlock(hash)

    // If propagation is requested, send to a subset of the peer
    if propagate {
        // Calculate the TD of the block (it's not imported yet, so block.Td is not valid)
        var td *big.Int
        if parent := pm.blockchain.GetBlock(block.ParentHash(), block.NumberU64()-1); parent != nil {
            td = new(big.Int).Add(block.Difficulty(), pm.blockchain.GetTd(block.ParentHash(), block.NumberU64()-1))
        } else {
            log.Error("Propagating dangling block", "number", block.Number(), "hash", hash)
            return
        }
        // Send the block to a subset of our peers
        transfer := peers[:int(math.Sqrt(float64(len(peers))))]
        for _, peer := range transfer {
            peer.SendNewBlock(block, td)
        }
        log.Trace("Propagated block", "hash", hash, "recipients", len(transfer), "duration", common.PrettyDuration(time.Since(block.ReceivedAt)))
        return
    }
    // Otherwise if the block is indeed in out own chain, announce it
    if pm.blockchain.HasBlock(hash, block.NumberU64()) {
        for _, peer := range peers {
            peer.SendNewBlockHashes([]common.Hash{hash}, []uint64{block.NumberU64()})
        }
        log.Trace("Announced block", "hash", hash, "recipients", len(peers), "duration", common.PrettyDuration(time.Since(block.ReceivedAt)))
    }
}

```


可以看到该方法中循环每个连接的peer节点,调用`peer.SendNewBlock`发送产块消息过去

```
func (p *peer) SendNewBlock(block *types.Block, td *big.Int) error {
    p.knownBlocks.Add(block.Hash())
    return p2p.Send(p.rw, NewBlockMsg, []interface{}{block, td})
}

```

```
func Send(w MsgWriter, msgcode uint64, data interface{}) error {
    size, r, err := rlp.EncodeToReader(data)
    if err != nil {
        return err
    }
    return w.WriteMsg(Msg{Code: msgcode, Size: uint32(size), Payload: r})
}

```

可以看到通过`writeMsg`写入该节点里,该方法的实现是`rw *netWrapper) WriteMsg(msg Msg)`

```
func (rw *netWrapper) WriteMsg(msg Msg) error {
    rw.wmu.Lock()
    defer rw.wmu.Unlock()
    rw.conn.SetWriteDeadline(time.Now().Add(rw.wtimeout))
    return rw.wrapped.WriteMsg(msg)
}

```

该方法设置了一个超时时间,底层调用了net.go的`Write(b []byte) (n int, err error)`,通过网络写给对应的节点了,然后接收端的方法为`ReadMsg`

```
func (pm *ProtocolManager) handleMsg(p *peer) error {
    // Read the next message from the remote peer, and ensure it's fully consumed
    msg, err := p.rw.ReadMsg()
    if err != nil {
        return err
    }
    if msg.Size > ProtocolMaxMsgSize {
        return errResp(ErrMsgTooLarge, "%v > %v", msg.Size, ProtocolMaxMsgSize)
    }
    defer msg.Discard()


```

可以看到在这边读取网络写入来的消息,然后根据不同的`msgCode`作不同的处理,由于`handleMsg`是在一个死循环中调用的,所以就能一直接收到节点广播过来的消息

```
//eth/handler.go
func (pm *ProtocolManager) handle(p *peer) error {
    td, head, genesis := pm.blockchain.Status()
    p.Handshake(pm.networkId, td, head, genesis)

    if rw, ok := p.rw.(*meteredMsgReadWriter); ok {
        rm.Init(p.version)
    }

    pm.peers.Register(p)
    defer pm.removePeer(p.id)

    pm.downloader.RegisterPeer(p.id, p.version, p)

    pm.syncTransactions(p)
    ...
    for {
        if err := pm.handleMsg(p); err != nil {
            return err
        }
    }
}


```

handle()函数针对一个新peer做了如下几件事：
- 握手，与对方peer沟通己方的区块链状态
- 初始化一个读写通道，用以跟对方peer相互数据传输。
- 注册对方peer，存入己方peer列表；只有handle()函数退出时，才会将这个peer移除出列表。
- Downloader成员注册这个新peer；Downloader会自己维护一个相邻peer列表。
- 调用syncTransactions()，用当前txpool中新累计的tx对象组装成一个txsync{}对象，推送到内部通道txsyncCh。还记得Start()启动的四个函数么?
- 其中第四项txsyncLoop()中用以等待txsync{}数据的通道txsyncCh，正是在这里被推入txsync{}的。
- 在无限循环中启动handleMsg()，当对方peer发出任何msg时，handleMsg()可以捕捉相应类型的消息并在己方进行处理。

