package main

import (
	"fmt"
	"strconv"
)

func main() {
	bc := NewBlockchain()

	bc.MineBlock("send 1 BTC to Ivan")
	bc.MineBlock("send 3 BTC to Ivan")
	bc.MineBlock("send 5 BTC to Ivan")

	for _, block := range bc.blocks {
		fmt.Printf("PrevBlock.Hash:%x\n", block.PrevBlockHash)
		fmt.Printf("Data: %s\n", block.Data)
		fmt.Printf("Hash: %x\n", block.Hash)
		pow := NewProofOfWork(block)
		fmt.Printf("PoW: %s\n", strconv.FormatBool(pow.Validate()))
		fmt.Println()
	}
}
