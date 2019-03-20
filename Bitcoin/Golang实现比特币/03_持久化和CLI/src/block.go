package main

import (
	"bytes"
	"encoding/gob"
	"log"
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

/*持久化新增序列化和反序列化区块方法*/

/*SerializeBlock Block序列化*/
func (block *Block) SerializeBlock() []byte {
	var result bytes.Buffer
	encoder := gob.NewEncoder(&result)
	err := encoder.Encode(block)
	if err != nil {
		log.Panic(err)
	}

	return result.Bytes()
}

/*DeserializeBlock Block反序列化*/
func DeserializeBlock(data []byte) *Block {
	var block Block
	decoder := gob.NewDecoder(bytes.NewReader(data))
	err := decoder.Decode(&block)
	if err != nil {
		log.Panic(err)
	}

	return &block
}


