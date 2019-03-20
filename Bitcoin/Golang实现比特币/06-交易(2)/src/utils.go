package main

import (
	"bytes"
	"encoding/binary"
	"log"
)

/*IntToHex int64装换为byte*/
func IntToHex(data int64) []byte {
	buff := new(bytes.Buffer)
	err := binary.Write(buff, binary.BigEndian, data)
	if err != nil {
		log.Panic(err)
	}
	return buff.Bytes()
}

/*ReverseBytes  反转一个字节数组*/
func ReverseBytes(data []byte) {
	for i, j := 0, len(data)-1; i < j; i, j = i+1, j-1 {
		data[i], data[j] = data[j], data[i]
	}
}
