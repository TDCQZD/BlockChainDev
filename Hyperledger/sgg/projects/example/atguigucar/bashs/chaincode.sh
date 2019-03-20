
# 安装链代码
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode install -n atguigucar -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
# 初始化链代码
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode instantiate -o orderer.atguigu.com:7050 -C atguiguchannel -n atguigucar -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
# 使用invode初始化账本
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.atguigu.com/users/Admin@org1.atguigu.com/msp" cli peer chaincode invoke -o orderer.atguigu.com:7050 -C atguiguchannel -n atguigucar -c '{"function":"initLedger","Args":[""]}'
