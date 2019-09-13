package main

import (
	"bytes"
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func read(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var key, jsonResp string
	var err error
	fmt.Println("starting read")

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key of the var to query")
	}

	// input sanitation
	err = sanitize_arguments(args)
	if err != nil {
		return shim.Error(err.Error())
	}

	key = args[0]
	valAsbytes, err := stub.GetState(key)  //get the var from ledger
	if err != nil {
		jsonResp = "{\"Error\":\"Failed to get state for " + key + "\"}"
		return shim.Error(jsonResp)
	}

	fmt.Println("- end read")
	return shim.Success(valAsbytes)  //send it onward
}
func read_everything(stub shim.ChaincodeStubInterface) pb.Response {
	type Everything struct {
		Owners   []Owner   `json:"owners"`
		Marbles  []Marble  `json:"marbles"`
	}
	var everything Everything

	// ---- Get All Marbles ---- //
	resultsIterator, err := stub.GetStateByRange("m0", "m9999999999999999999")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on marble id - ", queryKeyAsStr)
		var marble Marble
		json.Unmarshal(queryValAsBytes, &marble)  //un stringify it aka JSON.parse()
		everything.Marbles = append(everything.Marbles, marble)   //add this marble to the list
	}
	fmt.Println("marble array - ", everything.Marbles)

	// ---- Get All Owners ---- //
	ownersIterator, err := stub.GetStateByRange("o0", "o9999999999999999999")
	if err != nil {
		return shim.Error(err.Error())
	}
	defer ownersIterator.Close()

	for ownersIterator.HasNext() {
		aKeyValue, err := ownersIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryKeyAsStr := aKeyValue.Key
		queryValAsBytes := aKeyValue.Value
		fmt.Println("on owner id - ", queryKeyAsStr)
		var owner Owner
		json.Unmarshal(queryValAsBytes, &owner)  //un stringify it aka JSON.parse()

		if owner.Enabled {  //only return enabled owners
			everything.Owners = append(everything.Owners, owner)  //add this marble to the list
		}
	}
	fmt.Println("owner array - ", everything.Owners)

	//change to array of bytes
	everythingAsBytes, _ := json.Marshal(everything)   //convert to array of bytes
	return shim.Success(everythingAsBytes)
}

func getHistory(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	type AuditHistory struct {
		TxId    string   `json:"txId"`
		Value   Marble   `json:"value"`
	}
	var history []AuditHistory;
	var marble Marble

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	marbleId := args[0]
	fmt.Printf("- start getHistoryForMarble: %s\n", marbleId)

	// Get History
	resultsIterator, err := stub.GetHistoryForKey(marbleId)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		var tx AuditHistory
		tx.TxId = historyData.TxId   //copy transaction id over
		json.Unmarshal(historyData.Value, &marble)     //un stringify it aka JSON.parse()
		if historyData.Value == nil {  //marble has been deleted
			var emptyMarble Marble
			tx.Value = emptyMarble   //copy nil marble
		} else {
			json.Unmarshal(historyData.Value, &marble) //un stringify it aka JSON.parse()
			tx.Value = marble    //copy marble over
		}
		history = append(history, tx)   //add this tx to the list
	}
	fmt.Printf("- getHistoryForMarble returning:\n%s", history)

	//change to array of bytes
	historyAsBytes, _ := json.Marshal(history)     //convert to array of bytes
	return shim.Success(historyAsBytes)
}

func getMarblesByRange(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	startKey := args[0]
	endKey := args[1]

	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		aKeyValue, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		queryResultKey := aKeyValue.Key
		queryResultValue := aKeyValue.Value

		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResultKey)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResultValue))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getMarblesByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}