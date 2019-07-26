# core-vm

## contract.go
contract 代表了以太坊 state database里面的一个合约。包含了合约代码，调用参数。
- type Contract struct {}
- NewContract()
- Contract.AsDelegate():将合约设置为委托调用并返回当前合同（用于链式调用）
- Contract.GetOp():用来获取下一跳指令
- Contract.UseGas() : gas处理，
- Contract.Caller() : 返回合约地址给调用者
- Contract.Address()
-  Contract.SetCallCode()、 Contract.SetCodeOptionalHash():设置代码
##  evm.go

- type EVM struct {}
- run():运行给定的contract和负责运行预编译(字节码解释器)
- NewEVM()
- EVM.create():创建新合约并使用代码作为部署代码
- EVM.Call():转账或者是执行合约代码都会调用到这里， 同时合约里面的call指令也会执行到这.
>  CallCode, DelegateCall, 和 StaticCall，这三个函数不能由外部调用，只能由Opcode触发
- EVM.CallCode():CallCode与Call不同的地方在于它使用caller的context来执行给定地址的代码
- EVM.DelegateCall():DelegateCall 和 CallCode不同的地方在于 caller被设置为 caller的calle
- EVM.StaticCall():StaticCall不允许执行任何修改状态的操作，
