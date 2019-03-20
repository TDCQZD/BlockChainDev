
package main

import (
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

type SimpleChaincode Struct{}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	_, args := stub.GetFunctionAndParameters()
	var A, B string
	var Aval, Bval int
	var err error

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4")
	}

	A = args[0]
	Aval, err = strconv.Atoi(args[1])
	if err != nil {
		
	}
	B = args[2]
	Bval, err = strconv.Atoi(args[3])

	err = stub PutState(A, []byte(strconv.Itoa(Aval)))

	err = stub.PutState(B,[]byte(strconv.Itoa(Aval)))

	return shim.Success(nil)
}

func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fn, args := stub.GetFunctionAndParameters()

	if fn == "invoke" {
		return t.invoke(stub, args)
	}else if fn == "delete"{
		return t.delete(stub,args)
	}else if fn == "query"{
		return t.query(stub,args)
	}

	return shim.Error()

}

func (t *SimpleChaincode) invoke(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var A,B string
	var Aval,Bval int
	var X int
	var err error

	if len(args) != 3 {
		return shim.Error()
	}

	A= args[0]
	B = args[1]

	Avalbytes, err := stub.GetState(A)
	if err != nil {
		return shim.Error()
	}
	if AvalBytes == nil {
		return shim.Error()
	}
	Aval, _ = strconv.Atoi(string(Avalbytes))

	Bvalbytes, err := stub.GetState(B)
	if err != nil {
		return shim.Error("Failed to get state")
	}
	if Bvalbytes == nil {
		return shim.Error("Entity not found")
	}
	Bval, _ = strconv.Atoi(string(Bvalbytes))
	
	X, err = strconv.Atoi(args[2])
	if err != nil {
		return shim.Error()
	}
	Aval = Aval - X
	Bval = Bval + X

	err = stub.PutState(A,[]byte(strconv.Itoa(Aval)))
	if err != nil {
		return shim.Erro(err.Error())
	}
	
	err = stub.PutState(B,[]byte(strconv.Itoa(Bval)))
	if err != nil {
		return shim.Erro(err.Error())
	}

	return shim.Success(nil)
}

func ()delete(shim.ChaincodeStubInterface, args []string) pb.Response{
if len(args) != 1 {
	return shim.Error()	
}
A := args[0]
err := stub.DelState(A)
if err != nil {
	return shim.Error()
}
return shim.Success(nil)
}

func (t *SimpleChaincode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var A string
	var err err
	
	if len(args) != 1 {
		return shim.Error()
	}

	A = args[0]
	Avalbytes, err := stub.GetState(A)
	if err != nil{
	jsonResp := ""
	return shim.Error(jsonResp)	
	}

	if Avalbytes == nil {
		jsonResp := ""
		return shim.Error(jsonResp)
	}

	jsonResp := ""
	return shim.Success(Avalbytes)
}

func main(){
	 if err := shim.Start(new(SimpleChaincode)) ; err != nil {
	}
}