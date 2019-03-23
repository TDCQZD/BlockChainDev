package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/rand"
	"strconv"
	"time"
)

// DPOS 共识算法 go 实现
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

var delegate = []string{"zd", "qw", "as", "ers"}

func Randelegate() {
	rand.Seed(time.Now().Unix())
	r := rand.Intn(3)
	// t := delegate[r]
	// delegate[r] = delegate[3]
	// delegate[3] = t
	delegate[r], delegate[3] = delegate[3], delegate[r]
}

func main() {
	fmt.Println(delegate)
	Randelegate()
	fmt.Println(delegate)

	geneisBlock := Block{}
	geneisBlock.BPM = 100
	geneisBlock.PrevHash = "0"
	geneisBlock.Timestamp = time.Now().String()
	geneisBlock.Validator = "abc123"
	geneisBlock.Hight = 1
	geneisBlock.HashCode = geneisBlock.SetHash()

	blockChain = append(blockChain, geneisBlock)

	n := 0
	for {
		time.Sleep(time.Second * 3)
		newBlock := NewBlock(geneisBlock, 1, delegate[n])
		n++
		n = n % len(delegate)

		geneisBlock = newBlock
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

}
