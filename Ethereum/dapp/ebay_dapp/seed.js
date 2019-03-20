
EcommerceStore = artifacts.require("./contracts/EcommerceStore.sol");
module.exports = function (callback) {
    current_time = Math.round(new Date() / 1000); 
    amt_1 = web3.toWei(1, 'ether');
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 5', 'Cell Phones & Accessories', 'QmPF7r9NH8CJ6pnw1nzoP94mMF3iatBTcNxmjCPGQG5UcQ', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 600, 2*amt_1, 0).then(function(f) {console.log(f)}).catch(console.log)});
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 5s', 'Cell Phones & Accessories', 'QmQfTCUD7dUb7va7SuJczyQxupUt44sjKsAMU66kFCy7fU', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 1200, 3*amt_1, 1).then(function(f) {console.log(f)})});
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 6', 'Cell Phones & Accessories', 'QmVqG39KWQ9TXGGgn22FFtzPnAWyqjguPd6WzWFYENDXTe', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 14, amt_1, 0).then(function(f) {console.log(f)})}); 
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 6s', 'Cell Phones & Accessories', 'QmaDBbqecBtT8fP523KopjANDUxYwBJX6MH1gvR6KhXi8i', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400, 4*amt_1, 1).then(function(f) {console.log(f)})});
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('iphone 7', 'Cell Phones & Accessories', 'QmQ4MufWjvWK75ApxuSVkUSZZxsWJATwxEEthNq4LkzbkX', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
    EcommerceStore.deployed().then(function(i) {i.addProductToStore('Jeans', 'Clothing, Shoes & Accessories', 'QmPF7r9NH8CJ6pnw1nzoP94mMF3iatBTcNxmjCPGQG5UcQ', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400 + 86400 + 86400, 5*amt_1, 1).then(function(f) {console.log(f)})});
   
    EcommerceStore.deployed().then(function (i) { i.productIndex.call().then(function (f) { console.log(f) }) });
}

