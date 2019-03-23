package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/rand"
	"strconv"
	"time"
)

// POS 共识算法 go 实现

type Block struct {
	Hight     int
	Timestamp string
	BPM       int
	HashCode  string
	PrevHash  string
	Validator string
}

var blockChain []Block

func NewBlock(prevBlock Block, bpm int, address string) Block {
	block := Block{}
	block.Hight = prevBlock.Hight + 1
	block.Timestamp = time.Now().String()
	block.PrevHash = prevBlock.HashCode
	block.Validator = address
	block.BPM = bpm
	block.HashCode = block.SetHash()
	return block

}

func (block *Block) SetHash() string {
	hashCode := block.PrevHash +
		block.HashCode +
		block.Timestamp +
		block.Validator +
		strconv.Itoa(block.BPM) +
		strconv.Itoa(block.Hight)

	sha := sha256.New()
	sha.Write([]byte(hashCode))
	return hex.EncodeToString(sha.Sum(nil))
}

type Node struct {
	tokens  int
	address string
}

var n [2]Node
var addr [3000]string

func main() {
	n[0] = Node{1000, "abc123"}
	n[1] = Node{2000, "def123"}

	count := 0
	for i := 0; i < 2; i++ {
		for j := 0; j < n[i].tokens; j++ {
			addr[count] = n[i].address
			count++
		}
	}

	rand.Seed(time.Now().Unix())
	rd := rand.Intn(3000)
	adds := addr[rd]

	geneisBlock := Block{}
	geneisBlock.BPM = 100
	geneisBlock.PrevHash = "0"
	geneisBlock.Timestamp = time.Now().String()
	geneisBlock.Validator = "abc123"
	geneisBlock.Hight = 1
	geneisBlock.HashCode = geneisBlock.SetHash()

	blockChain = append(blockChain, geneisBlock)
	newBlock := NewBlock(geneisBlock, 200, adds)
	blockChain = append(blockChain, newBlock)

	for _, block := range blockChain {

		fmt.Printf("Hight:%d\n", block.Hight)
		fmt.Printf("PrevBlock.Hash:%x\n", block.PrevHash)
		fmt.Printf("BPM: %d\n", block.BPM)
		fmt.Printf("Hash: %s\n", block.HashCode)
		fmt.Printf("Validator: %s\n", block.Validator)
		fmt.Printf("---------------block-------------------\n")
	}

}
