package main

import (
	"log"

	"github.com/boltdb/bolt"
)

/*BlockchainIterator 用于迭代区块链块*/
type BlockchainIterator struct {
	currentBlockHash []byte
	db               *bolt.DB
}

/*Next 返回下一个区块*/
func (bci *BlockchainIterator) Next() *Block {
	var block *Block
	err := bci.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(blocksBucket))
		encoderBlock := b.Get(bci.currentBlockHash)
		block = DeserializeBlock(encoderBlock)
		return nil
	})
	if err != nil {
		log.Panic(err)
	}
	bci.currentBlockHash = block.PrevBlockHash
	return block
}
