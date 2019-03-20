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

## wallet.go
```
import "crypto/elliptic"
elliptic包实现了几条覆盖素数有限域的标准椭圆曲线。

func P256() Curve
返回一个实现了P-256的曲线。（参见FIPS 186-3, section D.2.3）

func GenerateKey(curve Curve, rand io.Reader) (priv []byte, x, y *big.Int, err error)
GenerateKey返回一个公钥/私钥对。priv是私钥，而(x,y)是公钥。密钥对是通过提供的随机数读取器来生成的，该io.Reader接口必须返回随机数据。
```

```
import "crypto/ecdsa"
ecdsa包实现了椭圆曲线数字签名算法，参见FIPS 186-3。

type PublicKey struct {
    elliptic.Curve
    X, Y *big.Int
}
PrivateKey代表一个ECDSA公钥。


type PrivateKey struct {
    PublicKey
    D   *big.Int
}
PrivateKey代表一个ECDSA私钥。


func GenerateKey(c elliptic.Curve, rand io.Reader) (priv *PrivateKey, err error)
GenerateKey函数生成一对公钥/私钥。


func Sign(rand io.Reader, priv *PrivateKey, hash []byte) (r, s *big.Int, err error)
使用私钥对任意长度的hash值（必须是较大信息的hash结果）进行签名，返回签名结果（一对大整数）。私钥的安全性取决于密码读取器的熵度（随机程度）。


func Verify(pub *PublicKey, hash []byte, r, s *big.Int) bool
使用公钥验证hash值和两个大整数r、s构成的签名，并返回签名是否合法。
```

```
import "crypto/rand"
rand包实现了用于加解密的更安全的随机数生成器。
func Read(b []byte) (n int, err error)
本函数是一个使用io.ReadFull调用Reader.Read的辅助性函数。当且仅当err == nil时，返回值n == len(b)。
```

```
crypto/ripemd160

digest表示校验和的部分评估。
type digest struct {
	s  [5]uint32       // running context
	x  [BlockSize]byte // temporary buffer
	nx int             // index into x
	tc uint64          // total count of bytes processed
}

func New() hash.Hash {
	result := new(digest)
	result.Reset()
	return result
}
返回一个新的hash.Hash计算校验和。

func (d *digest) Write(p []byte) (nn int, err error) {
	nn = len(p)
	d.tc += uint64(nn)
	if d.nx > 0 {
		n := len(p)
		if n > BlockSize-d.nx {
			n = BlockSize - d.nx
		}
		for i := 0; i < n; i++ {
			d.x[d.nx+i] = p[i]
		}
		d.nx += n
		if d.nx == BlockSize {
			_Block(d, d.x[0:])
			d.nx = 0
		}
		p = p[n:]
	}
	n := _Block(d, p)
	p = p[n:]
	if len(p) > 0 {
		d.nx = copy(d.x[:], p)
	}
	return
}

func (d0 *digest) Sum(in []byte) []byte {
	// Make a copy of d0 so that caller can keep writing and summing.
	d := *d0

	// Padding.  Add a 1 bit and 0 bits until 56 bytes mod 64.
	tc := d.tc
	var tmp [64]byte
	tmp[0] = 0x80
	if tc%64 < 56 {
		d.Write(tmp[0 : 56-tc%64])
	} else {
		d.Write(tmp[0 : 64+56-tc%64])
	}

	// Length in bits.
	tc <<= 3
	for i := uint(0); i < 8; i++ {
		tmp[i] = byte(tc >> (8 * i))
	}
	d.Write(tmp[0:8])

	if d.nx != 0 {
		panic("d.nx != 0")
	}

	var digest [Size]byte
	for i, s := range d.s {
		digest[i*4] = byte(s)
		digest[i*4+1] = byte(s >> 8)
		digest[i*4+2] = byte(s >> 16)
		digest[i*4+3] = byte(s >> 24)
	}

	return append(in, digest[:]...)
}


```



## wallets.go
```
func Stat(name string) (fi FileInfo, err error)
Stat返回一个描述name指定的文件对象的FileInfo。如果指定的文件对象是一个符号链接，返回的FileInfo描述该符号链接指向的文件的信息，本函数会尝试跳转该链接。如果出错，返回的错误值为*PathError类型。


func IsExist(err error) bool
返回一个布尔值说明该错误是否表示一个文件或目录已经存在。ErrExist和一些系统调用错误会使它返回真。

func IsNotExist(err error) bool
返回一个布尔值说明该错误是否表示一个文件或目录不存在。ErrNotExist和一些系统调用错误会使它返回真。
```