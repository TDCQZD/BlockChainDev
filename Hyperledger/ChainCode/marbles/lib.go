package main

import (
	"encoding/json"
	"errors"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func get_marble(stub shim.ChaincodeStubInterface, id string) (Marble, error) {
	var marble Marble
	marbleAsBytes, err := stub.GetState(id) 
	if err != nil {  
		return marble, errors.New("Failed to find marble - " + id)
	}
	json.Unmarshal(marbleAsBytes, &marble) 

	if marble.Id != id {  
		return marble, errors.New("Marble does not exist - " + id)
	}

	return marble, nil
}

func get_owner(stub shim.ChaincodeStubInterface, id string) (Owner, error) {
	var owner Owner
	ownerAsBytes, err := stub.GetState(id)  
	if err != nil {  
		return owner, errors.New("Failed to get owner - " + id)
	}
	json.Unmarshal(ownerAsBytes, &owner)   

	if len(owner.Username) == 0 {  
		return owner, errors.New("Owner does not exist - " + id + ", '" + owner.Username + "' '" + owner.Company + "'")
	}
	
	return owner, nil
}

func sanitize_arguments(strs []string) error{
	for i, val:= range strs {
		if len(val) <= 0 {
			return errors.New("Argument " + strconv.Itoa(i) + " must be a non-empty string")
		}
		if len(val) > 32 {
			return errors.New("Argument " + strconv.Itoa(i) + " must be <= 32 characters")
		}
	}
	return nil
}