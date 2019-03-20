
#!/bin/bash
export FABRIC_CFG_PATH=${PWD}
CHANNEL_NAME=atguiguchannel

# 新建文件夹 
mkdir config
mkdir crypto-config

# 生成加密相关的材料
./bin/cryptogen generate --config=./crypto-config.yaml

# 为排序节点生成创世区块
./bin/configtxgen -profile OneOrgOrdererGenesis -outputBlock ./config/genesis.block

# 生成通道配置交易
./bin/configtxgen -profile OneOrgChannel -outputCreateChannelTx ./config/channel.tx -channelID $CHANNEL_NAME

# 生成锚节点交易
./bin/configtxgen -profile OneOrgChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID $CHANNEL_NAME -asOrg Org1MSP
