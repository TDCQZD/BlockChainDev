package main

import (
	"bytes"
	"crypto/sha256"
	"time"
)

/*Block 区块头信息*/
type Block struct {
	Timestamp     int64
	Data          []byte
	PrevBlockHash []byte //
	Hash          []byte
}

/*SetHash 区块头做Hash*/
func (b *Block) SetHash() {
	timstamp := IntToHex(b.Timestamp)
	blockHear := bytes.Join([][]byte{
		timstamp,
		b.Data,
		b.PrevBlockHash,
	}, []byte{})
	hash := sha256.Sum256(blockHear)
	b.Hash = hash[:]
}

/*NewBlock 创建并返回新区块*/
func NewBlock(data string, prevBlockHash []byte) *Block {

	block := &Block{
		time.Now().Unix(),
		[]byte(data),
		prevBlockHash,
		[]byte{},
	}
	block.SetHash()
	return block
}

/*NewGenesisBlock 创建并返回创世区块*/
func NewGenesisBlock() *Block {
	return NewBlock("Genesis Block", []byte{})
}


