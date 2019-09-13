# 以太坊账户
以太坊账户创建时，首先会通过账户管理系统（account manager）来获取Keystore，然后通过椭圆加密算法产生公私钥对，并获取地址.

## personal.newAccount()
用户在控制台输入personal.newAccount会创建一个新的账户，会进入到ethapi.api中的newAccount方法中，这个方法会返回一个地址。
```
 // NewAccount will create a new account and returns the address for the new account.
func (s *PrivateAccountAPI) NewAccount(password string) (common.Address, error) {
	acc, err := fetchKeystore(s.am).NewAccount(password)
	if err == nil {
		return acc.Address, nil
	}
	return common.Address{}, err
}

// 检索加密的密钥库从 account manager.
func fetchKeystore(am *accounts.Manager) *keystore.KeyStore {
	return am.Backends(keystore.KeyStoreType)[0].(*keystore.KeyStore)
}

//  生成一个新密钥并将其存储到密钥目录中，并使用密码对其进行加密。
func (ks *KeyStore) NewAccount(passphrase string) (accounts.Account, error) {
	_, account, err := storeNewKey(ks.storage, crand.Reader, passphrase)
	if err != nil {
		return accounts.Account{}, err
	}
	// 立即将帐户添加到缓存中，而不是等待文件系统通知来获取它。
	ks.cache.add(account)
	ks.refreshWallets()
	return account, nil
}

// 生成一个新密钥
func storeNewKey(ks keyStore, rand io.Reader, auth string) (*Key, accounts.Account, error) {
	key, err := newKey(rand)
	if err != nil {
		return nil, accounts.Account{}, err
	}
	a := accounts.Account{
		Address: key.Address,
		URL:     accounts.URL{Scheme: KeyStoreScheme, Path: ks.JoinPath(keyFileName(key.Address))},
	}
	if err := ks.StoreKey(a.URL.Path, key, auth); err != nil {
		zeroKey(key.PrivateKey)
		return nil, a, err
	}
	return key, a, err
}
```

## 公私钥对生成
- 由secp256k1曲线生成私钥，是由随机的256bit组成
- 采用椭圆曲线数字签名算法（ECDSA）将私钥映射成公钥，一个私钥只能映射出一个公钥
``` 生成公钥和私钥
func newKey(rand io.Reader) (*Key, error) {
	// 生成公钥和私钥对
	privateKeyECDSA, err := ecdsa.GenerateKey(crypto.S256(), rand)
	if err != nil {
		return nil, err
	}
	return newKeyFromECDSA(privateKeyECDSA), nil
}

// 公钥算出地址并构建一个自定义的Key
func newKeyFromECDSA(privateKeyECDSA *ecdsa.PrivateKey) *Key {
	id := uuid.NewRandom()
	key := &Key{
		Id:         id,
		Address:    crypto.PubkeyToAddress(privateKeyECDSA.PublicKey),
		PrivateKey: privateKeyECDSA,
	}
	return key
}
```
secp256k1曲线
```

func S256() elliptic.Curve {
	return secp256k1.S256()
}

```
## 地址获取
公钥经过Keccak-256单向散列函数变成了256bit，然后取160bit作为地址
```
func PubkeyToAddress(p ecdsa.PublicKey) common.Address {
	pubBytes := FromECDSAPub(&p)
	return common.BytesToAddress(Keccak256(pubBytes[1:])[12:])
}

// Keccak256 calculates and returns the Keccak256 hash of the input data.
func Keccak256(data ...[]byte) []byte {
	d := sha3.NewLegacyKeccak256()
	for _, b := range data {
		d.Write(b)
	}
	return d.Sum(nil)
}
```
**取160bit作为地址**
> 一字节=8bit
> 20字节=160bit(二进制)=40字节(16进制)
```
const (
	// AddressLength is the expected length of the address
	AddressLength = 20
)

type Address [AddressLength]byte

func BytesToAddress(b []byte) Address {
	var a Address
	a.SetBytes(b)
	return a
}

func (a *Address) SetBytes(b []byte) {
	if len(b) > len(a) {
		b = b[len(b)-AddressLength:]
	}
	copy(a[AddressLength-len(b):], b)
}
```

总结：以太坊地址的生成过程如下： 
1. 由secp256k1曲线生成私钥，是由随机的256bit组成 
2. 采用椭圆曲线数字签名算法（ECDSA）将私钥映射成公钥。 
3. 公钥经过Keccak-256单向散列函数变成了256bit，然后取160bit作为地址


## accounts.Manager
> accounts/manager.go
- node.New方法中makeAccountManager建立账户管理系统
- makeAccountManager方法中通过keystore.NewKeyStore方法获取Keystore
- keystore通过init方法进行初始化，将账户信息写入到内存中

### node.New() 中makeAccountManager() 建立账户管理系统
``` node

// New creates a new P2P node, ready for protocol registration.
func New(conf *Config) (*Node, error) {
    ....
  // 确保AccountManager方法在节点启动之前工作
	am, ephemeralKeystore, err := makeAccountManager(conf)
	if err != nil {
		return nil, err
	}
    ....
```
```
func makeAccountManager(conf *Config) (*accounts.Manager, string, error) {
        scryptN, scryptP, keydir, err := conf.AccountConfig()
        var ephemeral string
        if keydir == "" {
            // There is no datadir.
            keydir, err = ioutil.TempDir("", "go-ethereum-keystore")
            ephemeral = keydir
        }
    
        if err != nil {
            return nil, "", err
        }
        if err := os.MkdirAll(keydir, 0700); err != nil {
            return nil, "", err
        }
        // Assemble the account manager and supported backends
        backends := []accounts.Backend{
            keystore.NewKeyStore(keydir, scryptN, scryptP),
        }
```
### 通过keystore.NewKeyStore方法获取Keystore
```
func NewKeyStore(keydir string, scryptN, scryptP int) *KeyStore {
        keydir, _ = filepath.Abs(keydir)
        ks := &KeyStore{storage: &keyStorePassphrase{keydir, scryptN, scryptP}}
        ks.init(keydir)
        return ks
    }
```
### keystore会通过init方法进行初始化
```
 func (ks *KeyStore) init(keydir string) {
        // Lock the mutex since the account cache might call back with events
        ks.mu.Lock()
        defer ks.mu.Unlock()
    
        // Initialize the set of unlocked keys and the account cache
        ks.unlocked = make(map[common.Address]*unlocked)
        ks.cache, ks.changes = newAccountCache(keydir)
    
        // TODO: In order for this finalizer to work, there must be no references
        // to ks. addressCache doesn't keep a reference but unlocked keys do,
        // so the finalizer will not trigger until all timed unlocks have expired.
        runtime.SetFinalizer(ks, func(m *KeyStore) {
            m.cache.close()
        })
        // Create the initial list of wallets from the cache
        accs := ks.cache.accounts()
        ks.wallets = make([]accounts.Wallet, len(accs))
        for i := 0; i < len(accs); i++ {
            ks.wallets[i] = &keystoreWallet{account: accs[i], keystore: ks}
        }
    }
```
通过newAccountCache方法将文件的路径写入到keystore的缓存中，并在ks.changes通道中写入数据。然后会通过缓存中的accounts()方法从文件中将账户信息写入到缓存中。

在accounts中，一步步跟进去，会找到scanAccounts方法。这个方法会计算create，delete，和update的账户信息，并通过readAccount方法将账户信息写入到缓存中。