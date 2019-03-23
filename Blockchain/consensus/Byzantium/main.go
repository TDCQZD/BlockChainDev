package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type nodeInfo struct {
	id     string
	path   string
	writer http.ResponseWriter
}

var nodeTable = make(map[string]string)

func (node *nodeInfo) request(writer http.ResponseWriter, request *http.Request) {
	request.ParseForm()

	if 0 < len(request.Form["warTime"]) {
		node.writer = writer
		fmt.Println("主节点接收到的参数信息：", request.Form["warTime"][0])
		node.broadcast(request.Form["warTime"][0], "/prePreppare")
	}
}
func (node *nodeInfo) broadcast(msg, path string) {
	fmt.Println("广播", path)

	for nodeId, url := range nodeTable {
		if nodeId == node.id {
			continue
		}

		http.Get("http://" + url + path + "?warTime=" + msg + "&nodeId=" + node.id)
	}
}
func (node *nodeInfo) prePreppare(writer http.ResponseWriter, request *http.Request) {
	request.ParseForm()
	fmt.Println("接收到的广播：", request.Form["warTime"][0])

	if 0 < len(request.Form["warTime"]) {
		node.broadcast(request.Form["warTime"][0], "/preppare")
	}
}
func (node *nodeInfo) preppare(writer http.ResponseWriter, request *http.Request) {
	request.ParseForm()
	fmt.Println("接收到子节点的广播：", request.Form["warTime"][0])

	if 0 < len(request.Form["warTime"]) {
		node.authentication(request)
	}
}

var authenticationNodeMap = make(map[string]string)
var authenticationSuceess = false

func (node *nodeInfo) authentication(request *http.Request) {
	if !authenticationSuceess {
		if len(request.Form["nodeId"]) > 0 {
			authenticationNodeMap[request.Form["nodeId"][0]] = "OK"
		}
		if len(authenticationNodeMap) > len(nodeTable)/3 {
			authenticationSuceess = true
			node.broadcast(request.Form["warTime"][0], "/commit")
		}

	}
}
func (node *nodeInfo) commit(writer http.ResponseWriter, request *http.Request) {
	if writer != nil {
		fmt.Println("拜占庭效验成功")
		io.WriteString(node.writer, "OK")
	}
}

func main() {
	userId := os.Args[1]
	fmt.Println("userId:", userId)

	nodeTable = map[string]string{
		"N0": "127.0.0.1:1110",
		"N1": "127.0.0.1:1111",
		"N2": "127.0.0.1:1112",
		"N3": "127.0.0.1:1113",
	}

	node := nodeInfo{id: userId, path: nodeTable[userId]}

	http.HandleFunc("/req", node.request)

	http.HandleFunc("/prePreppare", node.prePreppare)
	http.HandleFunc("/preppare", node.preppare)
	http.HandleFunc("/commit", node.commit)

	if err := http.ListenAndServe(node.path, nil); err != nil {
		log.Fatal(err)
	}
}
