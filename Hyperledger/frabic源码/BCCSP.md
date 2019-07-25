# BCCSP
- sw ：软件基础的加密服务实现
    - ECDSA
    - HASH
    - AES
    - RSA
- pkcs11 ：实现硬件基础的加密服务
    - ECDSA
- BCCSP工厂：factory
    - swFactory
    - pkcs11Factory


## BCCSP介绍
BCCSP（blockchain cryptographic service provider）：称之为区域链加密服务提供者。为Fabric提供加密标准和算法的实现，包括哈希、签名、校验、加解密等。BCCSP通过MSP（即Membership Service Provider成员关系服务提供者）给核心功能和客户端SDK提供加密算法相关服务。

另外BCCSP支持可插拔，提供多种CSP，支持自定义CSP。目前支持sw和pkcs11两种实现。

在Hyperledger Fabric中，BCCSP的主要作用是为Hyperledger Fabric提供加密、签名服务，包括如下：

* AES：一种分组加密实现算法，Hyperledger Fabric中主要用来对数据做加密解密处理。主要包含：AES128、AES192、AES256。
* ECDSA：一种椭圆曲线加密算法，Hyperledger Fabric中主要用于签名与验签。主要包含：ECDSAP256、ECDSAP384。
* RSA：一种非对称加密算法，是目前使用最广泛的公钥密码体制之一，Hyperledger Fabric中主要用于签名与验签。主要包含：RSA1024、RSA2048、RSA3072、RSA4096。
* HASH：哈希算法。主要包含：SHA256、SHA384、SHA3_256、SHA3_384。
* PKCS11：一套基于硬件的标准安全接口。
* HMAC： 密匙相关的哈希运算消息认证码

如上所有的支持的技术都被Hyperledger Fabric作为常量定义在hyperledger/fabric/bccsp/opts.go文件中：
```
package bccsp

const (
    ECDSA = "ECDSA"
    ECDSAP256 = "ECDSAP256"
    ECDSAP384 = "ECDSAP384"
    ECDSAReRand = "ECDSA_RERAND"

    RSA = "RSA"
    RSA1024 = "RSA1024"
    RSA2048 = "RSA2048"
    RSA3072 = "RSA3072"
    RSA4096 = "RSA4096"

    AES = "AES"
    AES128 = "AES128"
    AES192 = "AES192"
    AES256 = "AES256"

    HMAC = "HMAC"
    HMACTruncated256 = "HMAC_TRUNCATED_256"

    SHA = "SHA"
    SHA2 = "SHA2"
    SHA3 = "SHA3"

    SHA256 = "SHA256"
    SHA384 = "SHA384"
    SHA3_256 = "SHA3_256"
    SHA3_384 = "SHA3_384"

    X509Certificate = "X509Certificate"
)
```
## BCCSP目录结构
BCCSP服务目录结构如下：
```
hyperledger/fabric/bccsp
├── aesopts.go
├── bccsp.go
├── bccsp_test.go
├── ecdsaopts.go
├── factory
├── hashopts.go
├── idemixopts.go
├── keystore.go
├── mocks
├── opts.go
├── pkcs11
├── rsaopts.go
├── signer
├── sw
└── utils
```
目录解释：

- factory目录：为BCCSP的工厂目录，创建一个BCCSP实例（如sw或psck11）

- pkcs11目录：pkcs11的实现包

- signer目录：基于BCCSP的加密签名实现

- sw目录：基于软件的BCCSP实现包。

- util目录：BCCSP工具包。

- bccsp.go：定义了BCCSP及Key的接口，以及相应的xxxOpts接口。

- keystore.go：定义了key的管理存储接口。

- opts.go：定义了BCCSP所支持的各种技术选项。

- xxxopts.go：BCCSP服务所使用到的各种技术选项的实现。

## BCCSP接口
首先来看一下hyperledger/fabric/bccsp.go中定义的接口及对应解释：
```

type Key interface {

    Bytes() ([]byte, error)    // 将Key转换为字节形式

    SKI() []byte    // 全称为subject key identifier，此函数返回主题密钥标识符

    Symmetric() bool    // 如果为对称密钥，返回true，否则返回false

    Private() bool    // 如果此Key为私钥，返回true，否则返回false

    PublicKey() (Key, error)    // 返回非对称公钥/私钥对的对应公钥部分。如果为对称密钥返回错误
}

// 包含使用CSP生成Key的选项
type KeyGenOpts interface {

    Algorithm() string    // 返回要使用的密钥生成算法标识符

    Ephemeral() bool    // 如果要生成的键是临时性的，则返回true
}

// 包含使用CSP派生键的选项
type KeyDerivOpts interface {

    Algorithm() string    // 返回要使用的密钥派生算法标识符

    Ephemeral() bool    // 如果派生的键是临时性的，则返回true
}

// 包含使用CSP导入密钥的原材料的选项
type KeyImportOpts interface {

    Algorithm() string    // 返回密钥导入算法标识符

    Ephemeral() bool    // 如果生成的键是临时的，则返回true
}

// 包含使用CSP进行哈希的选项
type HashOpts interface {

    Algorithm() string    // 返回哈希算法标识符
}

// 包含与CSP签名的选项
type SignerOpts interface {
    crypto.SignerOpts
}

type EncrypterOpts interface{}    // 包含使用CSP加密的选项

type DecrypterOpts interface{}    // 包含使用CSP解密的选项

// BCCSP接口提供加密标准和算法的实现
type BCCSP interface {
    // 使用opts生成Key
    KeyGen(opts KeyGenOpts) (k Key, err error)
    // 使用opts从派生一个Key
    KeyDeriv(k Key, opts KeyDerivOpts) (dk Key, err error)
    // 使用opts从其原始表示中导入一个Key
    KeyImport(raw interface{}, opts KeyImportOpts) (k Key, err error)
    // 返回此CSP关联到的Key
    GetKey(ski []byte) (k Key, err error)
    // 根据哈希选项opts对一个msg消息进行哈希，如果opts为空，则使用默认选项
    Hash(msg []byte, opts HashOpts) (hash []byte, err error)
    // 根据选项opts获取一个Hash实例，如果opts为空，则使用默认选项
    GetHash(opts HashOpts) (h hash.Hash, err error)
    // 签名（根据opts选项使用k对digest进行签名）
    Sign(k Key, digest []byte, opts SignerOpts) (signature []byte, err error)
    // 验证签名（使用opts选项根据k和digest验证签名）
    Verify(k Key, signature, digest []byte, opts SignerOpts) (valid bool, err error)
    // 根据opts选项使用k对plaintext进行加密
    Encrypt(k Key, plaintext []byte, opts EncrypterOpts) (ciphertext []byte, err error)
    // 根据opts选项使用k对ciphertext进行解密
    Decrypt(k Key, ciphertext []byte, opts DecrypterOpts) (plaintext []byte, err error)
}
```
## SW实现
SW（SoftWare）是BCCSP的默认实现方式，我们可以从hyperledger/fabric/bccsp/factory/opts.go文件中的GetDefaultOpts函数中看出，该函数源码如下：
```
func GetDefaultOpts() *FactoryOpts {
    return &FactoryOpts{
        ProviderName: "SW",
        SwOpts: &SwOpts{
            HashFamily: "SHA2",
            SecLevel:   256,

            Ephemeral: true,
        },
    }
}
```
SW所有实现被定义在hyperledger/fabric/bccsp/sw包中，目录结构如下：

```
hyperledger/fabric/bccsp/sw
├── aes.go    # AES方式加密与解密的实现
├── aeskey.go    # AES类型的Key接口实现
├── conf.go    # BCCSP的SW实现的配置定义，主要设置SHA2或SHA3对应的SecurityLevel
├── dummyks.go    # dummy类型的KeyStore接口实现；临时性的Key，保存在内存中
├── ecdsa.go    # ECDSA类型的签名与验签实现
├── ecdsakey.go    # ECDSA类型的Key接口实现
├── fileks.go    # file类型的KeyStore接口实现，即fileBasedKeyStore；非临时性的Key，保存在文件中
├── hash.go    #Hash接口实现，即hasher
├── impl.go    # 提供基于BCCSP接口的通用实现    
├── internals.go    # 加密、解密，签名、验签的接口定义
├── keyderiv.go    # KeyDeriver接口实现
├── keygen.go    # KeyGenerator接口实现
├── keyimport.go    # KeyImporter接口实现
├── new.go    # 创建一个安全级别为256的基于软件的BCCSP的新实例，哈希族SHA2，并使用指定的KeyStore作为密钥库
├── rsa.go    # RSA类型的签名、验签实现
├── rsakey.go    # RSA类型的Key接口实现
```
### SW接口实现
#### CSP实例创建
BCCSP的接口实现被定义在hyperledger/fabric/bccsp/sw/impl.go源文件中，结构体定义如下：
```
type CSP struct {
    ks bccsp.KeyStore

    keyGenerators map[reflect.Type]KeyGenerator
    keyDerivers   map[reflect.Type]KeyDeriver
    keyImporters  map[reflect.Type]KeyImporter
    encryptors    map[reflect.Type]Encryptor
    decryptors    map[reflect.Type]Decryptor
    signers       map[reflect.Type]Signer
    verifiers     map[reflect.Type]Verifier
    hashers       map[reflect.Type]Hasher
}
```
CSP提供了基于包装器的BCCSP接口的通用实现。可以通过为以下基于算法的包装器提供实现来定制：KeyGenerator、KeyDeriver、KeyImporter、Encryptor、Decryptor、Signer、Verifier、Hasher。每个包装器都绑定到表示选项或key的goland类型。在impl.go源文件中实现了一个New函数，用于创建CSP实例，源码如下：
```
func New(keyStore bccsp.KeyStore) (*CSP, error) {
    if keyStore == nil {
        return nil, errors.Errorf("Invalid bccsp.KeyStore instance. It must be different from nil.")
    }

    encryptors := make(map[reflect.Type]Encryptor)
    decryptors := make(map[reflect.Type]Decryptor)
    signers := make(map[reflect.Type]Signer)
    verifiers := make(map[reflect.Type]Verifier)
    hashers := make(map[reflect.Type]Hasher)
    keyGenerators := make(map[reflect.Type]KeyGenerator)
    keyDerivers := make(map[reflect.Type]KeyDeriver)
    keyImporters := make(map[reflect.Type]KeyImporter)

    csp := &CSP{keyStore,
        keyGenerators, keyDerivers, keyImporters, encryptors,
        decryptors, signers, verifiers, hashers}

    return csp, nil
}
```
#### 接口实现
有了CSP实例，就可以进行密钥的生成、派生、导入、获取、签名、验签、加密、解密等一系列的操作。具体分别由下面的对应函数实现：

```
// KeyGen函数主要是负责生成Key
func (csp *CSP) KeyGen(opts bccsp.KeyGenOpts) (k bccsp.Key, err error) {
    // 验证opts
    if opts == nil {
        return nil, errors.New("Invalid Opts parameter. It must not be nil.")
    }
    // 根据指定的opes获取KeyGenerator
    keyGenerator, found := csp.keyGenerators[reflect.TypeOf(opts)]
    if !found {
        return nil, errors.Errorf("Unsupported 'KeyGenOpts' provided [%v]", opts)
    }
    // 调用KeyGen生成Key
    k, err = keyGenerator.KeyGen(opts)
    if err != nil {
        return nil, errors.Wrapf(err, "Failed generating key with opts [%v]", opts)
    }

    // 如果不是临时的，则调用StoreKey进行存储
    if !opts.Ephemeral() {
        // Store the key
        err = csp.ks.StoreKey(k)
        if err != nil {
            return nil, errors.Wrapf(err, "Failed storing key [%s]", opts.Algorithm())
        }
    }

    return k, nil

// 根据指定的opts派生key
func (csp *CSP) KeyDeriv(k bccsp.Key, opts bccsp.KeyDerivOpts) (dk bccsp.Key, err error)
// 使用opts从其原始表示中导入key
func (csp *CSP) KeyImport(raw interface{}, opts bccsp.KeyImportOpts) (k bccsp.Key, err error)
// 根据指定的ski获取对应的key
func (csp *CSP) GetKey(ski []byte) (k bccsp.Key, err error)
// 根据选项opts对一个msg消息进行哈希
func (csp *CSP) Hash(msg []byte, opts bccsp.HashOpts) (digest []byte, err error)
// 根据opts选项获取一个Hash
func (csp *CSP) GetHash(opts bccsp.HashOpts) (h hash.Hash, err error)
// 根据指定的opts使用k对digest进行签名
func (csp *CSP) Sign(k bccsp.Key, digest []byte, opts bccsp.SignerOpts) 
(signature []byte, err error)
// 根据指定的opts使用k与digest对signature验签
func (csp *CSP) Verify(k bccsp.Key, signature, digest []byte, opts bccsp.SignerOpts) (valid bool, err error)
// 根据指定的opts使用k对plaintext进行加密
func (csp *CSP) Encrypt(k bccsp.Key, plaintext []byte, opts bccsp.EncrypterOpts) (ciphertext []byte, err error)
// 根据指定的opts使用k对ciphertext进行解密
func (csp *CSP) Decrypt(k bccsp.Key, ciphertext []byte, opts bccsp.DecrypterOpts) (plaintext []byte, err error)
// 将传递的类型绑定到传递的包装器中
func (csp *CSP) AddWrapper(t reflect.Type, w interface{}) error
生成Key主要依赖于opts参数，可选使用到三种技术，分别为：ECDSA、RSA、AES。主要在hyperledger/fabric/bccsp/sw/new.go源文件中调用NewWithParams函数实现：

// 返回基于软件的BCCSP的新实例，该实例设置为已通过的安全级别、散列族和密钥存储
func NewWithParams(securityLevel int, hashFamily string, keyStore bccsp.KeyStore) (bccsp.BCCSP, error) {
    // 初始化配置
    conf := &config{}
    err := conf.setSecurityLevel(securityLevel, hashFamily)
    if err != nil {
        return nil, errors.Wrapf(err, "Failed initializing configuration at [%v,%v]", securityLevel, hashFamily)
    }
    // 创建一个CSP实例
    swbccsp, err := New(keyStore)
    if err != nil {
        return nil, err
    }

    // 设置加密
    swbccsp.AddWrapper(reflect.TypeOf(&aesPrivateKey{}), &aescbcpkcs7Encryptor{})

    // 设置解密
    swbccsp.AddWrapper(reflect.TypeOf(&aesPrivateKey{}), &aescbcpkcs7Decryptor{})

    // 设置签名者
    swbccsp.AddWrapper(reflect.TypeOf(&ecdsaPrivateKey{}), &ecdsaSigner{})
    swbccsp.AddWrapper(reflect.TypeOf(&rsaPrivateKey{}), &rsaSigner{})

    // 设置验证
    swbccsp.AddWrapper(reflect.TypeOf(&ecdsaPrivateKey{}), &ecdsaPrivateKeyVerifier{})
    swbccsp.AddWrapper(reflect.TypeOf(&ecdsaPublicKey{}), &ecdsaPublicKeyKeyVerifier{})
    swbccsp.AddWrapper(reflect.TypeOf(&rsaPrivateKey{}), &rsaPrivateKeyVerifier{})
    swbccsp.AddWrapper(reflect.TypeOf(&rsaPublicKey{}), &rsaPublicKeyKeyVerifier{})

    // 设置hashers
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.SHAOpts{}), &hasher{hash: conf.hashFunction})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.SHA256Opts{}), &hasher{hash: sha256.New})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.SHA384Opts{}), &hasher{hash: sha512.New384})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.SHA3_256Opts{}), &hasher{hash: sha3.New256})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.SHA3_384Opts{}), &hasher{hash: sha3.New384})

    // 设置Key生成器
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.ECDSAKeyGenOpts{}), &ecdsaKeyGenerator{curve: conf.ellipticCurve})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.ECDSAP256KeyGenOpts{}), &ecdsaKeyGenerator{curve: elliptic.P256()})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.ECDSAP384KeyGenOpts{}), &ecdsaKeyGenerator{curve: elliptic.P384()})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.AESKeyGenOpts{}), &aesKeyGenerator{length: conf.aesBitLength})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.AES256KeyGenOpts{}), &aesKeyGenerator{length: 32})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.AES192KeyGenOpts{}), &aesKeyGenerator{length: 24})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.AES128KeyGenOpts{}), &aesKeyGenerator{length: 16})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.RSAKeyGenOpts{}), &rsaKeyGenerator{length: conf.rsaBitLength})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.RSA1024KeyGenOpts{}), &rsaKeyGenerator{length: 1024})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.RSA2048KeyGenOpts{}), &rsaKeyGenerator{length: 2048})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.RSA3072KeyGenOpts{}), &rsaKeyGenerator{length: 3072})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.RSA4096KeyGenOpts{}), &rsaKeyGenerator{length: 4096})

    // 设置Key生成器
    swbccsp.AddWrapper(reflect.TypeOf(&ecdsaPrivateKey{}), &ecdsaPrivateKeyKeyDeriver{})
    swbccsp.AddWrapper(reflect.TypeOf(&ecdsaPublicKey{}), &ecdsaPublicKeyKeyDeriver{})
    swbccsp.AddWrapper(reflect.TypeOf(&aesPrivateKey{}), &aesPrivateKeyKeyDeriver{conf: conf})

    // 设置Key导入器
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.AES256ImportKeyOpts{}), &aes256ImportKeyOptsKeyImporter{})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.HMACImportKeyOpts{}), &hmacImportKeyOptsKeyImporter{})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.ECDSAPKIXPublicKeyImportOpts{}), &ecdsaPKIXPublicKeyImportOptsKeyImporter{})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.ECDSAPrivateKeyImportOpts{}), &ecdsaPrivateKeyImportOptsKeyImporter{})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.ECDSAGoPublicKeyImportOpts{}), &ecdsaGoPublicKeyImportOptsKeyImporter{})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.RSAGoPublicKeyImportOpts{}), &rsaGoPublicKeyImportOptsKeyImporter{})
    swbccsp.AddWrapper(reflect.TypeOf(&bccsp.X509PublicKeyImportOpts{}), &x509PublicKeyImportOptsKeyImporter{bccsp: swbccsp})

    return swbccsp, nil
}
```
#### Generators Key
生成Key调用了hyperledger/fabric/bccsp/sw/keygen.go源码文件中相应的函数来实现具体的功能。keygen.go文件源码如下所示：
```
type ecdsaKeyGenerator struct {
    curve elliptic.Curve
}
// 使用ECDSA技术生成Key，通过调用Go源码中crypto/ecdsa/ecdsa.go库中的GenerateKey函数来实现，返回hyperledger/fabric/bccsp/sw/ecdsakey.go/ecdsaPrivateKey对象
func (kg *ecdsaKeyGenerator) KeyGen(opts bccsp.KeyGenOpts) (k bccsp.Key, err error) {
    privKey, err := ecdsa.GenerateKey(kg.curve, rand.Reader)
    if err != nil {
        return nil, fmt.Errorf("Failed generating ECDSA key for [%v]: [%s]", kg.curve, err)
    }

    return &ecdsaPrivateKey{privKey}, nil
}

type aesKeyGenerator struct {
    length int
}

// 使用AES技术生成Key，通过调用hyperledger/fabric/bccsp/sw/aes.go源文件中的GetRandomBytes函数来实现，返回hyperledger/fabric/bccsp/sw/aeskey.go/aesPrivateKey对象
func (kg *aesKeyGenerator) KeyGen(opts bccsp.KeyGenOpts) (k bccsp.Key, err error) {
    lowLevelKey, err := GetRandomBytes(int(kg.length))
    if err != nil {
        return nil, fmt.Errorf("Failed generating AES %d key [%s]", kg.length, err)
    }

    return &aesPrivateKey{lowLevelKey, false}, nil
}

type rsaKeyGenerator struct {
    length int
}

// 使用RSA技术生成Key，通过调用Go源码中crypto/rsa/rsa.go库中的GenerateKey函数来实现，返回hyperledger/fabric/bccsp/sw/rsakey.go/rsaPrivateKey对象
func (kg *rsaKeyGenerator) KeyGen(opts bccsp.KeyGenOpts) (k bccsp.Key, err error) {
    lowLevelKey, err := rsa.GenerateKey(rand.Reader, int(kg.length))

    if err != nil {
        return nil, fmt.Errorf("Failed generating RSA %d key [%s]", kg.length, err)
    }

    return &rsaPrivateKey{lowLevelKey}, nil
}
```
#### Deriv Key
派生Key， 也就是将原有Key打乱之后重新生成一个Key。主要实现有两种方式：ecdsaPrivateKey/ecdsaPublicKey、aesPrivateKey， 源码实现在hyperledger/fabric/bccsp/sw/keyderiv.go文件中。

#### Signer & Verifier
签名与验证主要使用两种技术来实现：

* ecdsa
* rsa
签名主要是根据opts选项使用k对digest进行签名，分别调用对应的Sign(k bccsp.Key, digest []byte, opts bccsp.SignerOpts) (signature []byte, err error)函数进行处理。

验证根据不同的技术实现分为PrivateKeyVerifier、PublicKeyKeyVerifier两种形式，分别调用不同的函数来实现，以ECDSA方式为例，源码如下：
```
type ecdsaPrivateKeyVerifier struct{}

func (v *ecdsaPrivateKeyVerifier) Verify(k bccsp.Key, signature, digest []byte, opts bccsp.SignerOpts) (valid bool, err error) {
    return verifyECDSA(&(k.(*ecdsaPrivateKey).privKey.PublicKey), signature, digest, opts)
}

type ecdsaPublicKeyKeyVerifier struct{}

func (v *ecdsaPublicKeyKeyVerifier) Verify(k bccsp.Key, signature, digest []byte, opts bccsp.SignerOpts) (valid bool, err error) {
    return verifyECDSA(k.(*ecdsaPublicKey).pubKey, signature, digest, opts)
}
```
通过如上的源码可以看出，无论是ecdsaPrivateKeyVerifier，还是ecdsaPublicKeyKeyVerifier，都是调用了verifyECDSA函数并将其对应的公钥作为参数进行传递，最终在verifyECDSA函数中通过调用ecdsa.Verify函数来实现验证的功能。

#### Encrypt & Decrypt
对数据的加密与解密只有通过AES方式来实现。在Hyperledger Fabric中，AES方式的加密采用CBC模式。

CBC（Cipher-block chaining）：密码分组链接模式。每个明文块先与前一个密文块进行异或后，再进行加密。在这种方法中，每个密文块都依赖于它前面的所有明文块。同时，为了保证每条消息的唯一性，在第一个块中需要使用初始化向量。

加密源码：
```
func aesCBCEncryptWithRand(prng io.Reader, key, s []byte) ([]byte, error) {
    if len(s)%aes.BlockSize != 0 {
        return nil, errors.New("Invalid plaintext. It must be a multiple of the block size")
    }

    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    ciphertext := make([]byte, aes.BlockSize+len(s))
    iv := ciphertext[:aes.BlockSize]
    if _, err := io.ReadFull(prng, iv); err != nil {
        return nil, err
    }

    mode := cipher.NewCBCEncrypter(block, iv)    // 返回使用给定块以密码块链接模式加密的块模式，iv的长度必须与块的块大小相同
    mode.CryptBlocks(ciphertext[aes.BlockSize:], s)    // 加密

    return ciphertext, nil
}
```
解密源码：
```
func aesCBCDecrypt(key, src []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)    // 创建并返回一个新的加密块
    if err != nil {
        return nil, err
    }

    if len(src) < aes.BlockSize {
        return nil, errors.New("Invalid ciphertext. It must be a multiple of the block size")
    }
    iv := src[:aes.BlockSize]    // 向量
    src = src[aes.BlockSize:]    // 实际数据

    if len(src)%aes.BlockSize != 0 {
        return nil, errors.New("Invalid ciphertext. It must be a multiple of the block size")
    }

    // 返回一个块模式，该模式使用给定块以密码块链接模式解密。iv的长度必须与块的块大小相同，并且必须与用于加密数据的iv匹配
    mode := cipher.NewCBCDecrypter(block, iv)

    mode.CryptBlocks(src, src)    // 解密

    return src, nil
}
```
## pkcs11实现方式
pkcs11（PKCS，Public-Key Cryptography Standards）的实现形式与SW的实现大体相同，只不过pkcs11为fabric支持热插拔和个人安全硬件模块提供了服务。关于pkcs11的内容，可以参考如下的的两份文档：

* https://www.ibm.com/developerworks/cn/security/s-pkcs/
* https://docs.oracle.com/cd/E19253-01/819-7056/6n91eac56/index.html#chapter2-9

pkcs11包，即HSM基础的bccsp（the hsm-based BCCSP implementation），HSM是Hardware Security Modules，即硬件安全模块。
pckcs11是硬件基础的加密服务实现，sw是软件基础的加密服务实现。这个硬件基础的实现以 https://github.com/miekg/pkcs11 这个库为基础。

PKCS11称为Cyptoki，定义了一套独立于技术的程序设计接口，USBKey安全应用需要实现的接口。
在密码系统中，PKCS#11是公钥加密标准（PKCS, Public-Key Cryptography Standards）中的一份子，由RSA实验室(RSA Laboratories)发布，它为加密令牌定义了一组平台无关的API ，如硬件安全模块和智能卡。

pkcs11包主要内容是PKCS11标准的实现及椭圆曲线算法中以low-S算法为主导的go实现。同时也通过利用RSA的一些特性和算法，丰富了PKCS11加密体系。


### pkcs11目录结构：
```
hyperledger/fabric/bccsp/pkcs11/
├── conf.go
├── ecdsa.go
├── ecdsakey.go
├── impl.go
├── pkcs11.go
```
目录结构解释如下：

* conf.go：pkcs11的配置定义
* ecdsa.go：ECDSA算法实现的签名与验签
* ecdsakey.go：ECDSA类型的Key接口，实现了ecdsaPrivateKey、ecdsaPublicKey
* impl.go：pkcs11的实现
* pkcs11.go：以pkcs11为基础，实现了各种功能

### pkcs11结构
在hyperledger/fabric/bccsp/pkcs11/impl.go源码文件中定义了pkcs11的结构

```
type impl struct {
    bccsp.BCCSP    // 内嵌BCCSP接口

    conf *config    // conf配置
    ks   bccsp.KeyStore    // key存储对象，用于存储及获取key

    ctx      *pkcs11.Ctx    // pkcs11的context
    sessions chan pkcs11.SessionHandle    // 会话标识符通道，默认10（sessionCacheSize = 10）
    slot     uint    // 安全硬件外设连接插槽标识号

    lib          string    // 库所在路径
    noPrivImport bool    // 是否禁止导入私钥
    softVerify   bool    // 是否以软件方式验证签名
}
```
impl.go文件中有一个New函数，返回基于软件的BCCSP的新实例，该实例设置为已通过的安全级别、散列族和密钥存储，实现源码如下：
```
func New(opts PKCS11Opts, keyStore bccsp.KeyStore) (bccsp.BCCSP, error) {
    // 初始化配置
    conf := &config{}
    // 设置SecurityLevel，只支持SHA2(256,384)/SHA3(256,384)
    err := conf.setSecurityLevel(opts.SecLevel, opts.HashFamily)
    if err != nil {
        return nil, errors.Wrapf(err, "Failed initializing configuration")
    }
    // 返回BCCSP的实例
    swCSP, err := sw.NewWithParams(opts.SecLevel, opts.HashFamily, keyStore)
    if err != nil {
        return nil, errors.Wrapf(err, "Failed initializing fallback SW BCCSP")
    }

    // 检查 KeyStore
    if keyStore == nil {
        return nil, errors.New("Invalid bccsp.KeyStore instance. It must be different from nil.")
    }

    lib := opts.Library
    pin := opts.Pin
    label := opts.Label
    // 调用loadLib函数
    ctx, slot, session, err := loadLib(lib, pin, label)
    if err != nil {
        return nil, errors.Wrapf(err, "Failed initializing PKCS11 library %s %s",
            lib, label)
    }

    sessions := make(chan pkcs11.SessionHandle, sessionCacheSize)
    csp := &impl{swCSP, conf, keyStore, ctx, sessions, slot, lib, opts.Sensitive, opts.SoftVerify}
    csp.returnSession(*session)
    return csp, nil
}
```
在New函数中，其核心就是调用了hyperledger/fabric/bccsp/pkcs11/pkcs11.go中的loadLib函数建立与硬件安全模块的通信。loadLib函数的实现源码如下：
```
func loadLib(lib, pin, label string) (*pkcs11.Ctx, uint, *pkcs11.SessionHandle, error) {
    var slot uint = 0
    logger.Debugf("Loading pkcs11 library [%s]\n", lib)
    if lib == "" {
        return nil, slot, nil, fmt.Errorf("No PKCS11 library default")
    }

    ctx := pkcs11.New(lib)    // 创建一个新的ctx并初始化要使用的模块/库。
    if ctx == nil {
        return nil, slot, nil, fmt.Errorf("Instantiate failed [%s]", lib)
    }

    ctx.Initialize()    // 初始化
    slots, err := ctx.GetSlotList(true)        // 返回可用的插槽列表
    if err != nil {
        return nil, slot, nil, fmt.Errorf("Could not get Slot List [%s]", err)
    }
    found := false
    for _, s := range slots {
        info, err := ctx.GetTokenInfo(s)    // 获取令牌的信息
        if err != nil {
            continue
        }
        logger.Debugf("Looking for %s, found label %s\n", label, info.Label)
        if label == info.Label {
            found = true
            slot = s
            break
        }
    }
    if !found {
        return nil, slot, nil, fmt.Errorf("Could not find token with label %s", label)
    }

    var session pkcs11.SessionHandle
    for i := 0; i < 10; i++ {    // 尝试10次调用ctx.OpenSession打开一个会话session
        session, err = ctx.OpenSession(slot, pkcs11.CKF_SERIAL_SESSION|pkcs11.CKF_RW_SESSION)
        if err != nil {
            logger.Warningf("OpenSession failed, retrying [%s]\n", err)
        } else {
            break
        }
    }
    if err != nil {
        logger.Fatalf("OpenSession [%s]\n", err)
    }
    logger.Debugf("Created new pkcs11 session %+v on slot %d\n", session, slot)

    if pin == "" {
        return nil, slot, nil, fmt.Errorf("No PIN set\n")
    }
    err = ctx.Login(session, pkcs11.CKU_USER, pin)    // 登录会话
    if err != nil {
        if err != pkcs11.Error(pkcs11.CKR_USER_ALREADY_LOGGED_IN) {
            return nil, slot, nil, fmt.Errorf("Login failed [%s]\n", err)
        }
    }

    return ctx, slot, &session, nil        // 返回ctx, slot, session会话
}
```
## BCCSP工厂
通过factory可以获得两类BCCSP实例：sw和pkcs11。

BCCSP实例是通过工厂来提供的，sw包对应的工厂在swFactory.go中实现，pkcs11包对应的工厂在pkcs11Factory.go中实现，它们都共同实现了BCCSPFactory接口。

BCCSP实例通过Factory来创建并提供，实现了SW与pkcs11两种实例的提供，SW由swfactory.go提供，pkcs11由pkcs11factory.go提供；pluginfactory.go似乎有些问题，所以我们不需要去关注。
```
hyperledger/fabric/bccsp/factory/
├── factory.go
├── nopkcs11.go
├── opts.go
├── pkcs11factory.go
├── pkcs11.go
├── pkcs11_test.go
├── pluginfactory.go
├── race_test.go
├── swfactory.go
```
目录结构解释如下：

factory.go：定义了工厂接口，指定实现了默认的BCCSP
nopkcs11.go：定义了工厂选项FactoryOpts，初始化和获取bccsp实例
opts.go：定义了默认的工厂opts
pkcs11factory.go：pkcs11类型的bccsp工厂实现PKCS11Factory
pkcs11.go：定义了FactoryOpts
swfactory.go：sw类型的bccsp工厂实现SWFactory及SwOpts

### BCCSP工厂接口
在hyperledger/fabric/bccsp/factory/factory.go源文件中定义了BCCSP工厂的接口，如下所示：
```
type BCCSPFactory interface {

    // 返回此工厂的名称
    Name() string

    // 使用opts返回BCCSP的一个实例
    Get(opts *FactoryOpts) (bccsp.BCCSP, error)
}
```
在该factory.go源文件中，还定义了两个函数：

GetDefault() bccsp.BCCSP ：返回一个非短暂(长期)的BCCSP，默认为SW。源码如下：
```
func GetDefault() bccsp.BCCSP {
    if defaultBCCSP == nil {    // 如果defultBCCSP为空
        logger.Warning("Before using BCCSP, please call InitFactories(). Falling back to bootBCCSP.")
        bootBCCSPInitOnce.Do(func() {
            var err error
            // 创建一个SWFactory对象
            f := &SWFactory{}
            // 根据给定的默认的DefaultOpts函数返回的FactoryOpts作为参数调用hyperledger/fabric/bccsp/factory/swfactory.go源码文件中的Get函数获取BCCSP对象
            bootBCCSP, err = f.Get(GetDefaultOpts())
            if err != nil {
                panic("BCCSP Internal error, failed initialization with GetDefaultOpts!")
            }
        })
        return bootBCCSP
    }
    return defaultBCCSP
}
GetBCCSP(name string) (bccsp.BCCSP, error)：返回根据传入的选项创建的BCCSP。
```
上面的源码中提到过在hyperledger/fabric/bccsp/factory/swfactory.go的GetDefault函数中调用了hyperledger/fabric/bccsp/factory/opts.go源文件中提供的一个GetDefaultOpts函数，返回了一个默认的工厂选项，具体源代码如下：
```
func GetDefaultOpts() *FactoryOpts {
    return &FactoryOpts{
        ProviderName: "SW",
        SwOpts: &SwOpts{
            HashFamily: "SHA2",
            SecLevel:   256,

            Ephemeral: true,
        },
    }
}
```