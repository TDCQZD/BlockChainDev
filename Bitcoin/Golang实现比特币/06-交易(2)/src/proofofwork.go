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
	target := big.NewInt(1)
	target.Lsh(target, uint(256-tartgetBits))
	pow := &ProofOfWork{b, target}
	return pow
}

/*Run pow核心*/
func (pow *ProofOfWork) Run() (int, []byte) {
	var hashInt big.Int
	var hash [32]byte
	nonce := 0
	fmt.Printf("Mining a new block")
	for nonce < maxNOnce {
		data := pow.prepareData(nonce)
		hash = sha256.Sum256(data)
		fmt.Printf("\r%x", hash)
		hashInt.SetBytes(hash[:])

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
		[][]byte{
			pow.block.PrevBlockHash,
			pow.block.HashTransactions(),
			IntToHex(pow.block.Timestamp),
			IntToHex(int64(tartgetBits)),
			IntToHex(int64(nonce)),
		},
		[]byte{},
	)

	return data
}

/*说明
big.Int 大整数
// Int表示带符号的多精度整数。
// Int的零值表示值0。
type Int struct {
	neg bool // 标志
	abs nat  // 整数的绝对值
}

func (z *Int) SetBytes(buf []byte) *Int
将buf视为一个大端在前的无符号整数，将z设为该值，并返回z。

func (x *Int) Cmp(y *Int) (r int)
比较x和y的大小。x<y时返回-1；x>y时返回+1；否则返回0。

math.MaxInt64：整数的取值极限。


func NewInt(x int64) *Int
创建一个值为x的*Int。

func (z *Int) Lsh(x *Int, n uint) *Int
将z设为x << n并返回z（左位移运算）。
*/
