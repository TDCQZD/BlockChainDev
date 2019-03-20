package main

import (
	"bytes"
	"crypto/sha256"
	"fmt"
	"math"
	"math/big"
)

var maxNOnce = math.MaxInt64

const tartgetBits = 12

/*ProofOfWork 表示工作量证明*/
type ProofOfWork struct {
	block  *Block
	target *big.Int
}

/*NewProofOfWork 构建并返回ProofOfWork*/
func NewProofOfWork(b *Block) *ProofOfWork {
	// 将 big.Int 初始化为 1
	target := big.NewInt(1)
	// 将1 左移 256 - targetBits
	target.Lsh(target, uint(256-tartgetBits))
	pow := &ProofOfWork{b, target}
	return pow
}

/*Run pow核心*/
func (pow *ProofOfWork) Run() (int, []byte) {
	//大整数
	var hashInt big.Int
	// 区块hash
	var hash [32]byte
	//随机数
	nonce := 0
	fmt.Printf("Mining the block containing \"%s\"\n", pow.block.Data)
	//计算nonce
	for nonce < maxNOnce {
		data := pow.prepareData(nonce)
		hash = sha256.Sum256(data)
		fmt.Printf("\r%x", hash)
		//将hash值格式化为大整数并返回给hashInt
		hashInt.SetBytes(hash[:])
		// 比较区块hash与pow的目标
		if hashInt.Cmp(pow.target) == -1 {
			break
		} else {
			nonce++
		}
	}
	fmt.Print("\n\n")

	return nonce, hash[:]
}

/*Validate 验证block的POW*/
func (pow *ProofOfWork) Validate() bool {
	var hashInt big.Int
	data := pow.prepareData(pow.block.Nonce)
	hash := sha256.Sum256(data)
	hashInt.SetBytes(hash[:])
	validate := hashInt.Cmp(pow.target) == -1
	return validate

}

func (pow *ProofOfWork) prepareData(nonce int) []byte {
	data := bytes.Join(
		[][]byte{ //第一个[]：数组;第二个[]：切片
			pow.block.PrevBlockHash,
			pow.block.Data,
			IntToHex(pow.block.Timestamp),
			IntToHex(int64(tartgetBits)),
			IntToHex(int64(nonce)),
		},
		[]byte{},
	)

	return data
}
