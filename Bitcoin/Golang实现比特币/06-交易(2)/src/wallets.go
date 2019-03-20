package main

import (
	"bytes"
	"crypto/elliptic"
	"encoding/gob"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

/*Wallets 表示钱包集合 */
type Wallets struct {
	Wallets map[string]*Wallet
}

/*NewWallets 创建钱包并从文件中填充（如果存在）*/
func NewWallets() (*Wallets, error) {
	ws := &Wallets{}
	ws.Wallets = make(map[string]*Wallet)
	err := ws.LoadFromFile()
	return ws, err
}

/*LoadFromFile 从文件中加载钱包*/
func (ws *Wallets) LoadFromFile() error {
	if _, err := os.Stat(walletFile); os.IsNotExist(err) {
		return err
	}

	fileContent, err := ioutil.ReadFile(walletFile)
	if err != nil {
		log.Panic(err)
	}

	var wallets Wallets
	gob.Register(elliptic.P256())
	decoder := gob.NewDecoder(bytes.NewReader(fileContent))
	err = decoder.Decode(&wallets)
	if err != nil {
		log.Panic(err)
	}

	ws.Wallets = wallets.Wallets

	return nil
}

/*SaveToFile 将钱包保存到文件中*/
func (ws Wallets) SaveToFile() {
	var content bytes.Buffer

	gob.Register(elliptic.P256())

	encoder := gob.NewEncoder(&content)
	err := encoder.Encode(ws)
	if err != nil {
		log.Panic(err)
	}

	err = ioutil.WriteFile(walletFile, content.Bytes(), 0644)
	if err != nil {
		log.Panic(err)
	}
}

/*CreateWallet 把钱包增加到钱包集并返回地址*/
func (ws *Wallets) CreateWallet() string {
	wallet := NewWallet()
	address := fmt.Sprintf("%s", wallet.GetAddress())

	ws.Wallets[address] = wallet

	return address
}

/*GetAddresses 返回存储在钱包文件中的地址数组*/
func (ws *Wallets) GetAddresses() []string {
	var addresses []string

	for address := range ws.Wallets {
		addresses = append(addresses, address)
	}

	return addresses
}

/*GetWallet 按地址返回Wallet*/
func (ws Wallets) GetWallet(address string) Wallet {
	return *ws.Wallets[address]
}

/*说明：
os.Stat(walletFile)
 os.IsNotExist(err)
*/
