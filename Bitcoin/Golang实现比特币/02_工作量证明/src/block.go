package main

import (
	"time"
)

/*Block 区块头信息*/
type Block struct {
	Timestamp     int64
	Data          []byte
	PrevBlockHash []byte
	Hash          []byte
	Nonce         int
}

/*NewBlock 创建并返回新区块*/
func NewBlock(data string, prevBlockHash []byte) *Block {

	block := &Block{
		time.Now().Unix(),
		[]byte(data),
		prevBlockHash,
		[]byte{},
		0,
	}
	pow := NewProofOfWork(block)
	nonce, hash := pow.Run()
	block.Nonce = nonce
	block.Hash = hash[:]
	return block
}

/*NewGenesisBlock 创建并返回创世区块*/
func NewGenesisBlock() *Block {
	return NewBlock("Genesis Block", []byte{})
}

