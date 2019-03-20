package main

/*TXInput 表示交易输入*/
type TXInput struct {
	Txid      []byte
	Vout      int
	ScriptSig string
}

/*CanUnlockOutputWith 检查地址是否创建了交易*/
func (in *TXInput) CanUnlockOutputWith(unlockingData string) bool {
	return in.ScriptSig == unlockingData

}
