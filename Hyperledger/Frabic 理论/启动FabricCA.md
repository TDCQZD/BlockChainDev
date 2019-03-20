# 启动FabricCA
## 初始化
Fabric CA 服务器的主目录确定如下：

- 如果设置了 -home 命令行选项，则使用其值
- 否则，如果 FABRIC_CA_SERVER_HOME 设置了环境变量，则使用其值
- 否则，如果 FABRIC_CA_HOME 设置了环境变量，则使用其值
- 否则，如果 CA_CFG_PATH 设置了环境变量，则使用其值
- 否则，使用当前工作目录作为服务器端的主目录.
现在我们使用一个当前所在的目录作为服务器端的主目录。返回至用户的HOME目录下，创建一个 fabric-ca 目录并进入该目录
```
$ cd ~
$ mkdir fabric-ca
$ cd fabric-ca
```
创建该目录的目的是作为 Fabric CA 服务器的主目录。默认服务器主目录为 “./” 。

初始化 Fabric CA
```
$ fabric-ca-server init -b admin:pass
```
在初始化时 -b 选项是必需的，用于指定注册用户的用户名与密码。

命令执行后会自动生成配置文件到至当前目录：

* `fabric-ca-server-config.yaml`： 默认配置文件
* `ca-cert.pem`： PEM 格式的 CA 证书文件, 自签名
* `fabric-ca-server.db`： 存放数据的 sqlite3 数据库
* `msp/keystore/`： 路径下存放个人身份的私钥文件(_sk文件)，对应签名证书
## 快速启动
快速启动并初始化一个 `fabric-ca-server` 服务
```
$ fabric-ca-server start -b admin:pass
```
* -b： 提供注册用户的名称与密码, 如果没有使用 LDAP，这个选项为必需。默认的配置文件的名称为 `fabric-ca-server-config.yaml`

如果之前没有执行初始化命令, 则启动过程中会自动进行初始化操作. 即从主配置目录搜索相关证书和配置文件, 如果不存在则会自动生成

## 配置数据库
Fabric CA 默认数据库为 SQLite，默认数据库文件 fabric-ca-server.db 位于 Fabric CA 服务器的主目录中。SQLite 是一个嵌入式的小型的数据系统，但在一些特定的情况下，我们需要集群来支持，所以Fabric CA 也设计了支持其它的数据库系统（目前只支持 MySQL、PostgreSQL 两种）。Fabric CA 在集群设置中支持以下数据库版本：

- PostgreSQL：9.5.5 或更高版本
- MySQL：5.7 或更高版本
下面我们来看如何配置来实现对不同数据库的支持。

### 配置 PostgreSQL
如果使用 PostgreSQL 数据库，则需要在 Fabric CA 服务器端的配置文件进行如下设置：
```
db:
  type: postgres
  datasource: host=localhost port=5432 user=Username password=Password dbname=fabric_ca sslmode=verify-full
```

如果要使用 TLS，则必须指定 Fabric CA 服务器配置文件中的 db.tls 部分。如果在 PostgreSQL 服务器上启用了 SSL 客户端身份验证，则还必须在 db.tls.client 部分中指定客户端证书和密钥文件。如下所示：
```
db:
  ...
  tls:
      enabled: true
      certfiles:
        - db-server-cert.pem
      client:
            certfile: db-client-cert.pem
            keyfile: db-client-key.pem
```
- certfiles：PEM 编码的受信任根证书文件列表。

- certfile和keyfile：Fabric CA 服务器用于与 PostgreSQL 服务器安全通信的 PEM 编码证书和密钥文件。用于服务器与数据库之间的 TLS 连接。

关于生成自签名证书可参考官方说明：https://www.postgresql.org/docs/9.5/static/ssl-tcp.html，需要注意的是，自签名证书仅用于测试目的，不应在生产环境中使用。

有关在PostgreSQL服务器上配置SSL的更多详细信息，请参阅以下PostgreSQL文档：https://www.postgresql.org/docs/9.4/static/libpq-ssl.html
###  配置 MySQL
如果使用 MySQL 数据库，则需要在 Fabric CA 服务器端的配置文件进行如下设置：
```
db:
  type: mysql
  datasource: root:rootpw@tcp(localhost:3306)/fabric_ca?parseTime=true&tls=custom
```
如果通过 TLS 连接到 MySQL 服务器，则还需要配置 db.tls.client 部分。如 PostgreSQL 的部分所述。

mySQL 数据库名称中允许使用字符限制。请参考：https://dev.mysql.com/doc/refman/5.7/en/identifiers.html

关于 MySQL 可用的不同模式，请参阅：https://dev.mysql.com/doc/refman/5.7/en/sql-mode.html，为正在使用的特定MySQL版本选择适当的设置。

## 配置LDAP
LDAP（Lightweight Directory Access Protocol）：轻量目录访问协议。

Fabric CA服务器可以通过服务器端的配置连接到指定LDAP服务器。之后可以执行以下操作：

- 在注册之前读取信息进行验证
- 对用于授权的标识属性值进行验证
修改 Fabric CA 服务器的配置文件中的LDAP部分：
```
ldap:
   enabled: false
   url: <scheme>://<adminDN>:<adminPassword>@<host>:<port>/<base>
   userfilter: <filter>
   attribute:
      names: <LDAPAttrs>
      converters:
        - name: <fcaAttrName>
          value: <fcaExpr>
      maps:
        <mapName>:
            - name: <from>
              value: <to>
```

配置信息中各部分解释如下：

* scheme：为 ldap 或 ldaps；
* adminDN：是admin用户的唯一名称；
* adminPassword：是admin用户的密码；
* host：是LDAP服务器的主机名或IP地址；
* port：是可选的端口号，默认 LDAP 为 389 ； LDAPS 为 636 ；
* base：用于搜索的LDAP树的可选根路径；
* filter：将登录用户名转换为可分辨名称时使用的过滤器；
* LDAPAttrs：是一个LDAP属性名称数组，代表用户从LDAP服务器请求；

* attribute.converters：部分用于将LDAP属性转换为结构CA属性，其中 fcaAttrName 是结构CA属性的名称; fcaExpr 是一个表达式。例如，假设是[“uid”]，是'hf.Revoker'，而是'attr（“uid”）=〜“revoker *”'。这意味着代表用户从LDAP服务器请求名为“uid”的属性。如果用户的'uid'LDAP属性的值以 revoker 开头，则为 hf.Revoker 属性赋予用户 true 的值；否则，为 hf.Revoker 属性赋予用户 false 的值。

* attribute.maps：部分用于映射LDAP响应值。典型的用例是将与LDAP组关联的可分辨名称映射到标识类型。
配置好 LDAP 后，用户注册的过程如下：

1. Fabric CA 客户端或客户端 SDK 使用基本授权标头发送注册请求。
2. Fabric CA 服务器接收注册请求，解码授权头中的身份名称和密码，使用配置文件中的 “userfilter” 查找与身份名称关联的 DN（专有名称），然后尝试 LDAP 绑定用户身份的密码。如果 LDAP 绑定成功，则注册被通过。
## FAQ
### 在实际中 Fabric CA 的身份信息保存在什么地方？

可根据具体需求选择 Fabric CA 支持的数据库，一般应用选择 SQLite 即可。中、大型应用选择 MySQL 或 PostgreSQL 或 LDAP
