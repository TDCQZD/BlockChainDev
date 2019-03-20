# Fabric CA的具体使用：应用Fabric CA的客户端命令
Fabric CA 可以采用客户端命令行或 RESTful API 在内的两种方式与 Fabric-CA 服务端进行交互。其中最方便的方式是通过客户端工具 `fabric-ca-client`。

Fabric CA 客户端的主目录路径设置如下：

- 如果设置了 --home 命令行选项，以此值为首选；
- 如果没有设置 --home ，则查找 FABRIC_CA_CLIENT_HOME 值；
- 否则，查找 FABRIC_CA_HOME 值；
- 否则，查找 CA_CFG_PATH 值；
如果都未设置，则使用 `$HOME/.fabric-ca-client` 作为客户端的主目录。
## Fabric CA 客户端命令
fabric-ca-client 命令可以与服务端进行交互, 包括五个子命令:

* enroll：注册获取ECert
* register：登记用户
* getcainfo：获取CA服务的证书链
* reenroll：重新注册
* revoke：撤销签发的证书身份
* version：Fabric CA 客户端版本信息
这些命令在执行时都是通过服务端的 RESTful 接口来进行操作的。

### 注册用户
打开一个新的终端，首先，设置 fabric-ca-client 所在路径，然后设置 Fabric CA 客户端主目录。通过调用在 7054 端口运行的 Fabric CA 服务器来注册 ID 为 admin 且密码为 pass 的标识。
```
$ export PATH=$PATH:$GOPATH/bin
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/admin
$ fabric-ca-client enroll -u http://admin:pass@localhost:7054
```
如果名称与密码不匹配， 则运行注册命令可能会产生如下错误：
```
Error: Response from server: Error Code: 20 - Authorization failure
```
**解决方式:**

删除生成的目录，之后使用启动服务时的用户名与密码注册

或
返回至目录下重新启动服务， 然后在新终端中使用 admin:pass 注册
```
$ cd ~
$ fabric-ca-server start -b admin:pass
#打开新终端
$ export PATH=$PATH:$GOPATH/bin
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/admin
$ fabric-ca-client enroll -u http://admin:pass@localhost:7054
```
参数解释：

* -u：进行连接的 fabric-ca-server 服务地址。
enroll 命令访问指定的 Fabric CA 服务，采用 admin 用户进行注册。 在 Fabric CA 客户端主目录下创建配置文件 fabric-ca-clien-config.yaml 和 msp 子目录，存储注册证书（ECert），相应的私钥和 CA 证书链 PEM 文件。我们可以在终端输出中看到指示 PEM 文件存储位置的相关信息。

生成的文件结构如下所示：
```
$ tree fabric-ca/clients/
fabric-ca/clients/
└── admin
    ├── fabric-ca-client-config.yaml
    └── msp
        ├── cacerts
        │   └── localhost-7054.pem
        ├── keystore
        │   └── 7441dddf832b4495cac12c05cc20b242f2ce545c5720010a83c11437157ac69d_sk
        ├── signcerts
        │   └── cert.pem
        └── user
```

> 提示：可以使用 $ tree fabric-ca/clients/ 命令查看目录结构

### 登记用户
注册成功后的用户可以使用 register 命令来发起登记请求：

Fabric CA 服务器在注册期间进行了三次授权检查：

1. 注册者（即调用者）必须具有 “hf.Registrar.Roles” 属性，其中包含逗号分隔的值列表，其中一个值等于要注册的身份类型； 如，如果注册商具有值为 “peer，app，user” 的 “hf.Registrar.Roles” 属性，则注册商可以注册 peer，app 和 user 类型的身份，但不能注册 orderer。
2. 注册者的登记其范围内的用户。例如，具有 “a.b” 的从属关系的注册者可以登记具有 “a.b.c” 的从属关系的身份，但是可以不登记具有 “a.c” 的从属关系的身份。如果登记请求中未指定任何从属关系，则登记的身份将被授予注册者同样的归属范围。
3. 如果满足以下所有条件，注册者可以指定登记用户属性：
    - 注册者可以登记具有前缀 “hf” 的 Fabric CA 保留属性。只有当注册商拥有该属性并且它是hf.Registrar.Attributes 属性的值的一部分时。此外，如果属性是类型列表，则登记的属性值必须等于注册者具有的值的一个子集。如果属性的类型为 boolean，则只有当注册者的属性值为 “true” 时，注册者才能登记该属性。
    - 注册自定义属性（即名称不以 'hf.' 开头的任何属性）要求注册者具有 'hf.Registar.Attributes' 属性，其中包含要注册的属性或模式的值。唯一支持的模式是末尾带有 “” 的字符串。例如，“a.b.\” 是匹配以 “a.b” 开头的所有属性名称的模式。例如，如果注册者具有hf.Registrar.Attributes = orgAdmin，则注册者可以在身份中添加或删除唯一的 orgAdmin 属性。
    - 如果请求的属性名称为 “hf.Registrar.Attributes”，则执行附加检查以查看此属性的请求值是否等于 “hf.Registrar.Attributes” 的注册者值的子集。如，如果注册者的 hf.Registrar.Attributes 的值是 'a.b.，x.y.z' 并且所请求的属性值是 'a.b.c，x.y.z'，那么它是有效的，因为 'a.b.c' 匹配 'a.b '，'x.y.z' 匹配注册者的 'x.y.z' 值。
如下命令，使用管理员标识的凭据注登记 ID 为 `“admin2”` 的新用户，从属关系为 `“org1.department1”`，名为 `“hf.Revoker” `的属性值为 `“true”`，以及属性名为` “admin”`的值为 `“true”`。`“：ecert” `后缀表示默认情况下，`“admin”` 属性及其值将插入用户的注册证书中，实现访问控制决策。
```
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/admin
$ fabric-ca-client register --id.name admin2 --id.affiliation org1.department1 --id.attrs 'hf.Revoker=true,admin=true:ecert'
```
执行后输出：
```
Configuration file location: /home/kevin/.fabric-ca-client/fabric-ca-client-config.yaml
Password: KwnOlOhpfVit
```
命令执行成功后返回该新登记用户的密码。

> 如果想使用指定的密码, 在命令中添加选项 `--id.secret password` 即可

登记时可以将多个属性指定为 -id.attrs 标志的一部分，每个属性必须以逗号分隔。对于包含逗号的属性值，必须将该属性封装在双引号中。如：
```
$ fabric-ca-client register -d --id.name admin2 --id.affiliation org1.department1 --id.attrs '"hf.Registrar.Roles=peer,user",hf.Revoker=true'
```
### 登记注册节点
登记Peer或Orderer节点的操作与登记用户身份类似；可以通过 -M 指定本地 MSP 的根路径来在其下存放证书文件

下面我们登记一个名为 peer1 的节点，登记时指定密码，而不是让服务器为生成。

登记节点:
```
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/admin
$ fabric-ca-client register --id.name peer1 --id.type peer --id.affiliation org1.department1 --id.secret peer1pw
```
注册节点
```
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/peer1
$ fabric-ca-client enroll -u http://peer1:peer1pw@localhost:7054 -M $FABRIC_CA_CLIENT_HOME/msp
```
参数说明：

* -M： 指定生成证书存放目录 MSP 的路径, 默认为 "msp"
命令执行成功后会在 $FABRIC_CA_CLIENT_HOME 目录下生成指定的 msp 目录, 在此目录下生成 msp 的私钥和证书。

### 其它命令

**getcainfo**

通常，MSP 目录的 cacerts 目录必须包含其他证书颁发机构的证书颁发机构链，代表 Peer 的所有信任根。

以下内容将在 localhost上启动第二个 Fabric CA 服务器，侦听端口 7055，名称为 “CA2”。这代表完全独立的信任根，并由区块链上的其他成员管理
```
$ export PATH=$PATH:$GOPATH/bin
$ export FABRIC_CA_SERVER_HOME=$HOME/ca2
$ fabric-ca-server start -b admin:ca2pw -p 7055 -n CA2
```
打开一个新终端，使用如下命令将CA2的证书链安装到peer1的MSP目录中
```
$ export PATH=$PATH:$GOPATH/bin
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/peer1
$ fabric-ca-client getcainfo -u http://localhost:7055 -M $FABRIC_CA_CLIENT_HOME/msp
```
**reenroll命令**

如果注册证书即将过期或已被盗用。可以使用 reenroll 命令以重新生成新的签名证书材料
```
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/peer1
$ fabric-ca-client reenroll
```
**revoke命令**

身份或证书都可以被撤销，撤销身份会撤销其所拥有的所有证书，并且还将阻止其获取新证书。被撤销后，Fabtric CA 服务器从此身份收到的所有请求都将被拒绝。

使用 revoke 命令的客户端身份必须拥有足够的权限（hf.Revoker为true, 并且被撤销者机构不能超出撤销者机构的范围）
```
$ export FABRIC_CA_CLIENT_HOME=$HOME/fabric-ca/clients/admin
$ fabric-ca-client revoke -e peer1 -r "affiliationchange"
```
参数说明：

* -e：指定被撤销的身份
* -r：指定被撤销的原因
命令执行后输出内容如下：
```
Configuration file location: /home/kevin/fabric-ca/clients/admin/fabric-ca-client-config.yaml
Sucessfully revoked certificates: [{Serial:21ed80434dd59cb1f80f89b85ebf55b3f677a54e AKI:1a99482cc8fe46349f0bd7ad7095985177708207} {Serial:4cf57dc2a8a70609e6eaaf3094e1ab3ff6aabe91 AKI:1a99482cc8fe46349f0bd7ad7095985177708207}]
```
另一种撤销身份的方式是可以指定其AKI（授权密钥标识符）和序列号来操作：
```
fabric-ca-client revoke -a xxx -s yyy -r <reason>
```
可以使用 openssl 命令获取 AKI 和证书的序列号，并将它们传递给 revoke 命令以撤销所述证书，如下所示：
```
serial=$(openssl x509 -in userecert.pem -serial -noout | cut -d "=" -f 2)
aki=$(openssl x509 -in userecert.pem -text | awk '/keyid/ {gsub(/ *keyid:|:/,"",$1);print tolower($0)}')
fabric-ca-client revoke -s $serial -a $aki -r affiliationchange
```
## 查看AKI和序列号
AKI: 公钥标识号, 代表了对该证书进行签发机构的身份

查看根证书的AKI与序列号信息:
```
$ openssl x509 -in $FABRIC_CA_CLIENT_HOME/msp/signcerts/cert.pem -text -noout
```
输出内容如下:
```
Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number:    # 序列号
            74:48:88:33:70:1a:01:a0:ad:32:29:6e:c5:ab:5a:fa:3b:91:25:a4
   ......
        X509v3 extensions:
           ......
            X509v3 Authority Key Identifier:     # keyid后面的内容就是 AKI
                keyid:45:B1:50:B6:CD:8A:8D:C5:9B:9E:5F:75:15:47:D6:C0:AD:75:FE:71

    ......
```
### 单独获取AKI
```
$ openssl x509 -in $FABRIC_CA_CLIENT_HOME/msp/signcerts/cert.pem -text -noout | awk '/keyid/ {gsub (/ *keyid:|:/,"",$1);print tolower($0)}'
```
输出内容如下:
```
1a99482cc8fe46349f0bd7ad7095985177708207
```
### 单独获取序列号
```
$ openssl x509 -in $FABRIC_CA_CLIENT_HOME/msp/signcerts/cert.pem -serial -noout | cut -d "=" -f 2
```
输出内容如下:
```
4CF57DC2A8A70609E6EAAF3094E1AB3FF6AABE91
```
## FAQ
### 在实际的生产环境中 Fabric CA 需要考虑哪些问题？

采用PKI推荐的分层结构，即根 CA、中间 CA 甚至根据实际需求场景更深层的 CA 来实现对身份的管理；

为了实现高可用的负载均衡，正如官方推荐的使用 HA Proxy 软件或 Nginx等来部署集群环境。
