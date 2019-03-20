package main

/*Blockchain 表示区块链，保存区块*/
type Blockchain struct {
	blocks []*Block
}

/*MineBlock 给区块链中添加新区块*/
func (bc *Blockchain) MineBlock(data string) {
	prevBlock := bc.blocks[len(bc.blocks)-1]
	newBlock := NewBlock(data, prevBlock.Hash)
	bc.blocks = append(bc.blocks, newBlock)
}

/*NewBlockchain 创建并返回一个带创世区块是区块链*/
func NewBlockchain() *Blockchain {
	return &Blockchain{[]*Block{NewGenesisBlock()}}
}
