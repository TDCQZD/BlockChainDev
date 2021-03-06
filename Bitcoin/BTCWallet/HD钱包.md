# HD钱包
这个HD钱包，并不是Hardware Wallet硬件钱包，这里的 HD 是Hierarchical Deterministic的缩写，意思是分层确定性，所以HD钱包的全称为比特币分成确定性钱包 。比特币中的钱包就是非确定性钱包，BIP32是 HD钱包的标准定义，由种子派生生成多个私钥。

## BIP
BIP是协议，是Bitcoin Improvement Proposals的缩写，意思是Bitcoin 的改进建议，用于提出 Bitcoin 的新功能或改进措施。BIP协议衍生了很多的版本，主要有BIP32、BIP39、BIP44。

### BIP32

BIP32是 HD钱包的核心提案，通过种子来生成主私钥，然后派生海量的子私钥和地址，种子是一串很长的随机数。

### BIP39

由于种子是一串很长的随机数，不利于记录，所以我们用算法将种子转化为一串12 ~ 24个的单词，方便保存记录，这就是BIP39，它扩展了 HD钱包种子的生成算法。

### BIP44

BIP44 是在 BIP32 和 BIP43 的基础上增加多币种，提出的层次结构非常全面，它允许处理多个币种，多个帐户，每个帐户有数百万个地址。

在BIP32路径中定义以下5个级别：
```
m/purpse'/coin_type'/account'/change/address_index
```
- purpose：在BIP43之后建议将常数设置为44'。表示根据BIP44规范使用该节点的子树。
- Coin_type：币种，代表一个主节点（种子）可用于无限数量的独立加密币，如比特币，Litecoin或Namecoin。此级别为每个加密币创建一个单独的子树，避免重用已经在其它链上存在的地址。开发人员可以为他们的项目注册未使用的号码。[币种列表](https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
- Account：账户，此级别为了设置独立的用户身份可以将所有币种放在一个的帐户中，从0开始按顺序递增。
- Change：常量0用于外部链，常量1用于内部链，外部链用于钱包在外部用于接收和付款。内部链用于在钱包外部不可见的地址，如返回交易变更。
- Address_index：地址索引，按顺序递增的方式从索引0开始编号。
BIP44的规则使得 HD钱包非常强大，用户只需要保存一个种子，就能控制所有币种，所有账户的钱包，因此由BIP39 生成的助记词非常重要，所以一定安全妥善保管，那么会不会被破解呢？如果一个 HD 钱包助记词是 12 个单词，一共有 2048 个单词可能性，那么随机的生成的助记词所有可能性大概是5e+39，因此几乎不可能被破解。

## 种子
种子可以派生生成多个私钥，所以种子是一个钱包账号中最关键的数据，比私钥的等级更高，因此备份一个种子就备份了相关联的所有私钥。HD钱包中包含了在树结构中派生的密钥，这样一来，父密钥就可以派生出一系列子密钥，每个密钥都可以派生出一系列的子密钥，从而达到无限的深度。

![](./imgs/seed.png)

