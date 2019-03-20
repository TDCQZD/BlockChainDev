pragma solidity ^0.4.23;

import "contracts/Escrow.sol";

contract EcommerceStore {

    // 产品状态存储，在链上存储为 0，已售出则为 1
    enum ProductStatus { Open, Sold, Unsold}
    // 产品的条件 new old
    enum ProductCondition {New, Used}
    //  商店的商品id，每当一个商品加入到商店则加 1，相当于计数器
    uint public productIndex;
    // 跟踪商户哪些商品在哪个商店
    mapping (uint => address) productIdStore;
    // 列出商店里的产品
    mapping (address => mapping(uint => Product)) stores;

    mapping (uint => address) productEscrow; // 托管合约地址

    // 商品详情
    struct Product{
        uint id;
        string name;
        string category;
        string imageLink; // 产品图片连接
        string descLink; // 大的描述文本连接
        // 拍卖相关
        uint auctionStartTime;
        uint auctionEndTime;
        uint startPrice;

        address highestBidder; //竞拍出最高价的地址
        uint highestBid;// 竞拍最高价
        uint secondHighestBid;// 竞拍第二高价
        uint totalBids; //参与竞价人数
        ProductStatus status;  //产品竞拍状态
        ProductCondition condition;  // 竞拍产品条件
        mapping (address => mapping(bytes32 => Bid)) bids; // 查询用户竞拍过的产品，出价多少
    }
    // 竞价信息 
    struct Bid{
        address bidder;
        uint productId;
        uint value; // 出价者实际发送 ETH 的数量，而不是当前实际出价的数量
        bool revealed; // 揭示报价
    }
    //Declare Event 触发的事件来存储产品
    event NewProduct(uint _productId, string _name, string _category, string _imageLink, string _descLink, uint _auctionStartTime, uint _auctionEndTime, uint _startPrice, uint _productCondition);
    constructor() public{
        productIndex = 0;
    }
    // 向商店添加商品
    function addProductToStore(string _name, string _category, string _imageLink, string _descLink, uint _auctionStartTime,uint _auctionEndTime, uint _startPrice, uint _productCondition) public {
        require(_auctionStartTime < _auctionEndTime,"AuctionEndTime should be late than AuctionStartTime");
        productIndex +=1;
        Product memory product = Product(productIndex,_name,_category,_imageLink,_descLink,_auctionStartTime,_auctionEndTime,_startPrice,0,0,0,0,ProductStatus.Open,ProductCondition(_productCondition));
        // 商店商户信息
        stores[msg.sender][productIndex] = product;
        // 商店商品信息
        productIdStore[productIndex] = msg.sender;
        emit NewProduct(productIndex, _name, _category, _imageLink, _descLink, _auctionStartTime, _auctionEndTime, _startPrice, _productCondition);
    }

    // 在 stores mapping 中查询商品
    function getProduct(uint _productId) view public returns (uint, string, string, string, string, uint, uint, uint, ProductStatus, ProductCondition) {
         Product memory product = stores[productIdStore[_productId]][_productId];
         return (product.id, product.name, product.category, product.imageLink, product.descLink, product.auctionStartTime, product.auctionEndTime, product.startPrice, product.status, product.condition);
    }
    // 出价
    function bid(uint _productId, bytes32 _bid) payable public returns (bool) {
        Product storage product = stores[productIdStore[_productId]][_productId];
        require(now >= product.auctionStartTime,"Current time should be late than auctionStartTime");
        require(now <= product.auctionEndTime,"Current time should be earlier than auctionEndTime");
        
        require(msg.value > product.startPrice);
        require(product.bids[msg.sender][_bid].bidder == 0);// 一个竞拍者只能以同样的竞拍信息竞拍一次
        
        product.bids[msg.sender][_bid] = Bid(msg.sender, _productId, msg.value, false);
        product.totalBids += 1;
        return true;
    }
    
    // 揭示出价
    function revealBid(uint _productId, string _amount, string _secret) public {
        Product storage product = stores[productIdStore[_productId]][_productId];
        require(now >= product.auctionEndTime);
        bytes32 sealedBid = sha3(_amount,_secret);
        Bid memory bidInfo = product.bids[msg.sender][sealedBid];
        require(bidInfo.bidder > 0,"bidder should exist");// 竞拍者地址有效合法
        require(bidInfo.revealed == false,"Bid should not be revealed");
        
        uint refund;
        uint amount = stringToUint(_amount);
        if (bidInfo.value < amount){ // 发送币小于竞价出价，视为无效交易
            refund = bidInfo.value; 
        }else{ // 发送币大于竞价出价
             // 首次揭示：如果这是第一个有效的出价揭示，我们会把它记录为最高出价，同时记录是谁出的价。我们也会将第二高的出价设置为商品的起始价格
            if (address(product.highestBidder) == 0) {// 首次揭示
                product.highestBidder = msg.sender;
                product.highestBid = amount;
                product.secondHighestBid = product.startPrice;
                
                refund = bidInfo.value - amount;
            } else {
                if (amount > product.highestBid){
                    product.secondHighestBid = product.highestBid;
                    product.highestBidder.transfer(product.highestBid);
                    product.highestBidder = msg.sender;
                    product.highestBid = amount;
                    refund = bidInfo.value - amount;
                }else if (amount >product.secondHighestBid) {
                    product.secondHighestBid = amount;
                    refund = bidInfo.value;
                }else{
                    refund = bidInfo.value;  
                }
            }
        }
        // 揭示出价 成功
        product.bids[msg.sender][sealedBid].revealed = true;
        
        if (refund > 0) {
            msg.sender.transfer(refund);
        }
    }
    //
    function highestBidderInfo(uint _productId) view public returns (address, uint, uint) {
        Product memory product = stores[productIdStore[_productId]][_productId];
        return (product.highestBidder, product.highestBid, product.secondHighestBid);
    }

    function totalBids(uint _productId) view public returns (uint) {
        Product memory product = stores[productIdStore[_productId]][_productId];
        return product.totalBids;
    }
    // 字符串装数字的工具方法
    function stringToUint(string s) pure private returns (uint) {
        bytes memory b = bytes(s); //把字符串转换为字节数组
        uint result = 0;
        for (uint i = 0; i < b.length; i++) {

            if (b[i] >= 48 && b[i] <= 57) {// 
                result = result * 10 + (uint(b[i]) - 48);
            }
        }
        return result;
    }

    function finalizeAuction(uint _productId) public {

        Product memory product = stores[productIdStore[_productId]][_productId];
        require((now > product.auctionEndTime),"Current time should be later than auctionEndTime");
        require(product.status == ProductStatus.Open,"Product Status should be Open");
        require(product.highestBidder != msg.sender,"Caller should not be buyer");
        require(productIdStore[_productId] != msg.sender,"Caller should not be seller");

        if (product.highestBidder == 0){// 没有买家或买家没有揭示报价，竞拍失败。 
            product.status = ProductStatus.Unsold;
        }else{// 竞拍成功，创建托管合约。
            Escrow  escrow = (new Escrow).value(product.secondHighestBid)(_productId, product.highestBidder, productIdStore[_productId], msg.sender);
            productEscrow[_productId] = address(escrow);// 托管合约地址
            product.status = ProductStatus.Sold;
            uint refund = product.highestBid - product.secondHighestBid;
            product.highestBidder.transfer(refund);
        }
        stores[productIdStore[_productId]][_productId] = product;// 如果Product 存储在storage中，此处不需要更改Product状态变量
    }
    // 合约地址
    function escrowAddressForProduct(uint _productId) public view returns (address) {
        return productEscrow[_productId];
    }
    function escrowInfo(uint _productId) public view returns (address, address, address, bool, uint, uint) {
        return Escrow(productEscrow[_productId]).escrowInfo();
    }
    
    function releaseAmountToSeller(uint _productId)public{
        Escrow(productEscrow[_productId]).realseAmontToSeller(msg.sender);
    }

    function refundAmountToBuyer(uint _productId)public{
        Escrow(productEscrow[_productId]).refundAmountToBuyer(msg.sender);
    }

}
























