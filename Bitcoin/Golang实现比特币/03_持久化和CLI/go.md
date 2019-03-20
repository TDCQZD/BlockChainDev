# GO 知识点
整理GO使用中不熟悉的语法


## block.go
```
func NewReader(b []byte) *Reader
NewReader创建一个从s读取数据的Reader。

func NewEncoder(w io.Writer) *Encoder
NewEncoder返回一个将编码后数据写入w的*Encoder。

func (enc *Encoder) Encode(e interface{}) error
Encode方法将e编码后发送，并且会保证所有的类型信息都先发送。



func NewDecoder(r io.Reader) *Decoder
函数返回一个从r读取数据的*Decoder，如果r不满足io.ByteReader接口，则会包装r为bufio.Reader。

func (dec *Decoder) Decode(e interface{}) error
Decode从输入流读取下一个之并将该值存入e。如果e是nil，将丢弃该值；否则e必须是可接收该值的类型的指针。如果输入结束，方法会返回io.EOF并且不修改e（指向的值）。
```
## blcokchain.go
```
func Open(path string, mode os.FileMode, options *Options) (*DB, error) {}
					Open在给定路径创建并打开数据库。
					如果文件不存在，则会自动创建。
					传入nil选项将导致Bolt使用默认选项打开数据库。
		os.FileMode:FileMode代表文件的模式和权限位
		Options:表示打开数据库时可以设置的选项。


func (db *DB) Update(fn func(*Tx) error) error {}
					在读写托管事务的上下文中执行函数。
					如果函数没有返回错误，则提交事务。
					如果返回错误，则回滚整个事务。
					从函数返回或从提交返回的任何错误都是
					从Update（）方法返回。

		注意：尝试在函数中手动提交或回滚将导致恐慌。


func (tx *Tx) Bucket(name []byte) *Bucket {}
					按名称检索存储桶。
					如果存储桶不存在，则返回nil。
					存储桶实例仅在事务的生命周期内有效。

func (b *Bucket) Put(key []byte, value []byte) error {}
					设置桶中密钥的值。
					如果密钥存在，则其先前的值将被覆盖。
					提供的值必须在交易的整个生命周期内保持有效。
					如果存储桶是从只读事务创建的，如果密钥为空，密钥太大，或者值太大，则返回错误。



func (b *Bucket) Get(key []byte) []byte {}
					获取检索存储桶中密钥的值。
					如果密钥不存在或密钥是嵌套存储桶，则返回nil值。
					返回的值仅在事务的生命周期内有效。


func (db *DB) View(fn func(*Tx) error) error {}
					在托管只读事务的上下文中执行函数。
					从View（）方法返回从函数返回的任何错误。

		注意：尝试在函数内手动回滚会引起恐慌。
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

## proofofwork.go

```
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
```

## cli.go
```
说明:重点补充flag命令行参数和OS包

func Exit(code int)
Exit让当前程序以给出的状态码code退出。
一般来说，状态码0表示成功，非0表示出错。程序会立刻终止，defer的函数不会被执行。

func NewFlagSet(name string, errorHandling ErrorHandling) *FlagSet
NewFlagSet创建一个新的、名为name，采用errorHandling为错误处理策略的FlagSet。

func (f *FlagSet) String(name string, value string, usage string) *string
String用指定的名称、默认值、使用信息注册一个string类型flag。
返回一个保存了该flag的值的指针。

func (f *FlagSet) Parse(arguments []string) error
从arguments中解析注册的flag。必须在所有flag都注册好而未访问其值时执行。
未注册却使用flag -help时，会返回ErrHelp。

func (f *FlagSet) Parsed() bool
返回是否f.Parse已经被调用过。

func Args() []string
返回解析之后剩下的非flag参数。（不包括命令名）
var Args []string
Args持有命令行参数，从程序名称开始。
```