var ecommerce_store_artifacts = require('./build/contracts/EcommerceStore.json')
var contract = require('truffle-contract')
var Web3 = require('web3')
var provider = new Web3.providers.HttpProvider("http://39.108.111.144:8545");
var EcommerceStore = contract(ecommerce_store_artifacts);
EcommerceStore.setProvider(provider);

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var ProductModel = require('./product');

mongoose.connect("mongodb://localhost:27017/ebay_dapp");
var db = mongoose.connection;
db.on('MongoDB error :', console.error.bind(console, 'MongoDB connection error:'));

// Express server which the frontend with interact with
var express = require('express');
var app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

newProductEventListner();

app.listen(3000, function () {
    console.log('Ebay Ethereum server listening on port 3000!');
});

function newProductEventListner() {
    let productEvent;
    EcommerceStore.deployed().then(function (i) {
        productEvent = i.NewProduct({ fromBlock: 0, toBlock: 'latest' });

        productEvent.watch(function (err, result) {
            if (err) {
                console.log(err)
                return;
            }
            saveProduct(result.args);
        });
    })
}


function saveProduct(product) {
    ProductModel.findOne({ 'blockchainId': product._productId.toLocaleString() }, function (err, dbProduct) {

        if (dbProduct != null) {
            return;
        }

        var p = new ProductModel({
            name: product._name, 
            blockchainId: product._productId, 
            category: product._category,
            ipfsImageHash: product._imageLink, 
            ipfsDescHash: product._descLink, 
            auctionStartTime: product._auctionStartTime,
            auctionEndTime: product._auctionEndTime, 
            price: product._startPrice, 
            condition: product._productCondition,
            productStatus: 0
        });
        p.save(function (err) {
            if (err) {
                handleError(err);
            } else {
                ProductModel.count({}, function (err, count) {
                    console.log("count is " + count);
                })
            }
        });
    })
}
