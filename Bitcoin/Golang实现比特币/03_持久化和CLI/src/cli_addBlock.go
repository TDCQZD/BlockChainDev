package main

import (
	"fmt"
)

func (cli *CLI) addBlock(data string) {
	cli.bc.MineBlock(data)
	fmt.Println("AddBlock Success!")
}
