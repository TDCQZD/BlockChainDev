package main

import (
	"fmt"
)

func (cli *CLI) printUsage() {
	fmt.Println("Usage: ")
	fmt.Println("  addblock -data BLOCK_DATA - add a block to the blockchain")
	fmt.Println("  printchain - print all the blocks of the blockchain")
}
