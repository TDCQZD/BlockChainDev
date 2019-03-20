package main

import (
	"flag"
	"log"
	"os"
)

/*CLI 负责处理命令行参数*/
type CLI struct {
	bc *Blockchain
}

/*Run 解析命令行参数和处理命令*/
func (cli *CLI) Run() {
	//验证命令行参数
	cli.validateArgs()

	addBlockCmd := flag.NewFlagSet("addblock", flag.ExitOnError)
	printChainCmd := flag.NewFlagSet("printchain", flag.ExitOnError)
	/* 获取数据信息
	   func (f *FlagSet) String(name string, value string, usage string) *string
	   String用指定的名称、默认值、使用信息,注册一个string类型flag。返回一个保存了该flag的值的指针。
	*/
	addBlockData := addBlockCmd.String("data", "", "Block data")
	/*通过判断参数，执行不同的方法
	func Parse()
	从os.Args[1:]中解析注册的flag。
	必须在所有flag都注册好而未访问其值时执行。未注册却使用flag -help时，会返回ErrHelp。
	*/
	// os.Args的第一个元素，os.Args[0], 是命令本身的名字；其它的元素则是程序启动时传给它的参数
	switch os.Args[1] {
	case "addblock":
		err := addBlockCmd.Parse(os.Args[2:])
		if err != nil {
			log.Panic(err)
		}
	case "printchain":
		err := printChainCmd.Parse(os.Args[2:])
		if err != nil {
			log.Panic(err)
		}
	default:
		cli.printUsage()
		os.Exit(1)
	}
	/*
	   func Parsed() bool
	   返回是否Parse已经被调用过。
	*/
	if addBlockCmd.Parsed() {
		if *addBlockData == "" {
			addBlockCmd.Usage()
			os.Exit(1)
		}
		cli.addBlock(*addBlockData)
	}
	if printChainCmd.Parsed() {
		cli.printChain()
	}

}

//效验命令行参数
func (cli *CLI) validateArgs() {
	if len(os.Args) < 2 {
		cli.printUsage()
		os.Exit(1)
	}
}
