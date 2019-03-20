package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/gob"
	"encoding/hex"
	"fmt"
	"log"
)

const subsidy = 10

/*Transaction 表示交易*/
type Transaction struct {
	ID   []byte
	Vin  []TXInput
	Vout []TXOutput
}

/*SetTXID 设置交易ID*/
func (tx *Transaction) SetTXID() {
	var encoded bytes.Buffer
	var hash [32]byte

	encoder := gob.NewEncoder(&encoded)
	err := encoder.Encode(tx)
	if err != nil {
		log.Panic(err)
	}
	hash = sha256.Sum256(encoded.Bytes())
	tx.ID = hash[:]
}

/*IsCoinbaseTX 判断交易是否是币基交易*/
func (tx *Transaction) IsCoinbaseTX() bool {
	return len(tx.Vin) == 1 && len(tx.Vin[0].Txid) == 0 && tx.Vin[0].Vout == -1
}

/*NewCoinbaseTX 创建并返回币基交易*/
func NewCoinbaseTX(to, data string) *Transaction {
	if data == "" {
		data = fmt.Sprintf("Reward to '%s'", to)
	}
	txin := TXInput{[]byte{}, -1, data}
	txout := TXOutput{subsidy, to}
	tx := &Transaction{nil, []TXInput{txin}, []TXOutput{txout}}
	tx.SetTXID()
	return tx
}

/*NewUXTOTX 创建并返回交易*/
func NewUXTOTX(from, to string, amount int, bc *Blockchain) *Transaction {
	var inputs []TXInput
	var outputs []TXOutput

	acc, validOutputs := bc.FindSpendableOutputs(from, amount)
	if acc < amount {
		log.Panic("ERROR: Not enough funds")
	}
	fmt.Println("acc:",acc)
	//创建交易的输入
	for txid, outs := range validOutputs {
		txID, err := hex.DecodeString(txid)
		if err != nil {
			log.Panic(err)
		}
		for _, out := range outs {
			input := TXInput{txID, out, from}
			inputs = append(inputs, input)
		}
	}
	//创建交易的输出
	outputs = append(outputs, TXOutput{amount, to})
	if acc > amount { //找零
		outputs = append(outputs, TXOutput{acc - amount, from})
	}
	fmt.Println("outputs:",outputs)

	tx := &Transaction{nil, inputs, outputs}
	tx.SetTXID()

	return tx
}
