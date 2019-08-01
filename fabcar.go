/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Writing Your First Blockchain Application
 */

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

// Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
type Blood struct {
	Kind string `json:"kind"`
	Volume  string `json:"volume"`
	Type string `json:"type"`
	Owner  string `json:"owner"`
}

/*
 * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
 * Best practice is to have any Ledger initialization in separate function -- see initLedger()
 */
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
 * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
 * The calling application program has also specified the particular smart contract function to be called, with arguments
 */
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger appropriately
	if function == "queryBlood" { //사용자 정보 불러오기
		return s.queryBlood(APIstub, args)
	} else if function == "initLedger" {
		return s.initLedger(APIstub)
	} else if function == "createBlood" { //정보 등록  
		return s.createBlood(APIstub, args)
	} else if function == "queryAllBloods" { //전체리스트 가져오기
		return s.queryAllBloods(APIstub)
	} else if function == "changeBloodOwner" { //헌혈정보 소유자 변경
		return s.changeBloodOwner(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) queryBlood(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	bloodAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(bloodAsBytes)
}

func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	bloods := []Blood{
		Blood{Kind: "전혈", Volume: "200", Type: "A", Owner: "Tomy"},
        Blood{Kind: "성분", Volume: "400", Type: "B", Owner: "Mike"},
        Blood{Kind: "전혈", Volume: "320", Type: "O", Owner: "Minsu"},
        Blood{Kind: "성분", Volume: "400", Type: "AB", Owner: "Somi"},
		Blood{Kind: "전혈", Volume: "320", Type: "A", Owner: "Tomy"},
        Blood{Kind: "성분", Volume: "400", Type: "B", Owner: "Kelly"}
	}

	i := 0
	for i < len(bloods) {
		fmt.Println("i is ", i)
		bloodAsBytes, _ := json.Marshal(bloods[i])
		APIstub.PutState("BLOOD"+strconv.Itoa(i), bloodAsBytes)
		fmt.Println("Added", bloods[i])
		i = i + 1
	}

	return shim.Success(nil)
}

func (s *SmartContract) createBlood(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 5 {
		return shim.Error("Incorrect number of arguments. Expecting 5")
	}

	var blood = Blood{Kind: args[1], Volume: args[2], Type: args[3], Owner: args[4]}

	bloodAsBytes, _ := json.Marshal(blood)
	APIstub.PutState(args[0], bloodAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) queryAllBloods(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "BLOOD0"
	endKey := "BLOOD999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllBloods:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *SmartContract) changeBloodOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	bloodAsBytes, _ := APIstub.GetState(args[0])
	blood := Blood{}

	json.Unmarshal(bloodAsBytes, &blood)
	blood.Owner = args[1]

	bloodAsBytes, _ = json.Marshal(blood)
	APIstub.PutState(args[0], bloodAsBytes)

	return shim.Success(nil)
}


// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
