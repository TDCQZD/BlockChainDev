package main

/*TXOutput 表示交易输出*/
type TXOutput struct {
	Value        int
	ScriptPubKey string
}

/*CanBeUnlockedWith 检查是否可以使用提供的数据解锁输出*/
func (out *TXOutput) CanBeUnlockedWith(unlockingData string) bool {
	return out.ScriptPubKey == unlockingData

}
