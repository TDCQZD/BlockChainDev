package main

import "bytes"

/*TXOutput 表示交易输出*/
type TXOutput struct {
	Value      int
	PubKeyHash []byte
}

/*Lock 交易输出签名,设置公钥Hash*/
func (out *TXOutput) Lock(address []byte) {
	pubKeyHash := Base58Decode(address)
	pubKeyHash = pubKeyHash[1 : len(pubKeyHash)-4]
	out.PubKeyHash = pubKeyHash
}

/*IsLockedWithKey 检查pubkey的所有者是否可以使用输出*/
func (out *TXOutput) IsLockedWithKey(pubKeyHash []byte) bool {
	return bytes.Compare(out.PubKeyHash, pubKeyHash) == 0

}

/*NewTXOutput 创建并返回交易输出*/
func NewTXOutput(value int, address string) *TXOutput {
	txout := &TXOutput{value, nil}
	txout.Lock([]byte(address))

	return txout
}
