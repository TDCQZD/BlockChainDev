# GO 知识点
整理GO使用中不熟悉的语法


## block.go
```
func Join(s [][]byte, sep []byte) []byte
		将一系列[]byte切片连接为一个[]byte切片，之间用sep来分隔，返回生成的新切片。

func Sum256(data []byte) [Size]byte
			返回数据的SHA256校验和。
```
## utils.go
```
Buffer :Buffer是一个可变大小的字节缓冲区，具有Read和Write方法。
  		Buffer的零值是一个可以使用的空缓冲区。

func Write(w io.Writer, order ByteOrder, data interface{}) error
			将数据的二进制表示写入w。
			将data的binary编码格式写入w，data必须是定长值、定长值的切片、定长值的指针。布尔值编码为一个字节：1表示true，0表示false。
			order指定写入数据的字节顺序进行编码，写入结构体时，名字中有'_'的字段会置为0。

func (b *Buffer) Bytes() []byte { return b.buf[b.off:] }:
返回长度为b.Len()的片段，其中包含缓冲区的未读部分。
```