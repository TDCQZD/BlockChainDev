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


