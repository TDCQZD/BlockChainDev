package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strconv"
	"strings"
	"time"
)

// POW 共识算法 go 实现
type Block struct {
	PrevBlockHash string
	Hash          string
	TimeStamp     string
	Diff          int
	Data          string
	Hight         int
	Nonce         int
}

func (block *Block) HashData() string {
	hashData := strconv.Itoa(block.Hight) +
		strconv.Itoa(block.Nonce) +
		strconv.Itoa(block.Diff)
	shaHash := sha256.New()
	shaHash.Write([]byte(hashData))
	return hex.EncodeToString(shaHash.Sum(nil))
}
func NewGenesisBlock(data string) *Block {
	genesisBlock := &Block{}
	genesisBlock.PrevBlockHash = "0"
	genesisBlock.TimeStamp = time.Now().String()
	genesisBlock.Diff = 4
	genesisBlock.Data = data
	genesisBlock.Hight = 1
	genesisBlock.Nonce = 0
	genesisBlock.Hash = genesisBlock.HashData()
	return genesisBlock
}

func NewBlock(data string, prevBlockHash string) *Block {
	block := &Block{}
	block.PrevBlockHash = prevBlockHash
	block.TimeStamp = time.Now().String()
	block.Diff = 5
	block.Data = data
	block.Hight = 2
	block.Nonce = 0
	block.Hash = pow(block.Diff, block)
	return block
}
func pow(diff int, block *Block) string {
	for {
		hash := block.HashData()
		if strings.HasPrefix(hash, strings.Repeat("0", diff)) {
			fmt.Println("Miner Success!")
			fmt.Println("Block Hash : ", hash)
			return hash
		} else {
			block.Nonce++
		}
	}
}
func main() {
	genesisBlock := NewGenesisBlock("Genesis Block")
	fmt.Println(genesisBlock.Data)

	NewBlock("new block", genesisBlock.Hash)
}
