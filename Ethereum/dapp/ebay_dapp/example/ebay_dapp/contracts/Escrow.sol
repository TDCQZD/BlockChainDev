pragma solidity ^0.4.23;

contract Escrow{
    uint public productId;
    address public seller;
    address public buyer;
    address public arbiter;
    uint public amount;

    //谁同意释放资金给卖家
    mapping(address => bool) releaseAmount;
    uint public releaseCount;//有多少人投票了释放资金
    //谁同意释放资金给买家
    mapping(address => bool) refundAmount;
    uint public refundCount;//有多少人投票了释放资金

    bool public  fundsDisbursed; //合约释放完资金标志，禁用所有的函数调用

    event CreateEscrow(uint _productId, address _buyer, address _seller, address _arbiter);
    event UnlockAmount(uint _productId, string _operation, address _operator);
    event DisburseAmount(uint _productId, uint _amount, address _beneficiary);

    constructor(uint _productId,address _seller,address _buyer,address _arbiter) payable public{
        productId = _productId;
        seller = _seller;
        buyer = _buyer;
        arbiter = _arbiter;

        amount = msg.value;
        fundsDisbursed = false;
        emit CreateEscrow(_productId, _seller, _buyer, _arbiter);
    }
   
    function escrowInfo()view public returns (address, address, address, bool, uint, uint){
        return (buyer, seller, arbiter, fundsDisbursed, releaseCount, refundCount);
    }
    // 拍卖成功，释放资金给卖家
    function realseAmontToSeller(address caller) public{
        require(!fundsDisbursed,"Founds should not be disbursed");
        require((caller == buyer || caller  == seller || caller  == arbiter),"Caller should be buyer or seller or arbiter ");

        if(!releaseAmount[caller]){
            releaseAmount[caller] = true;
            releaseCount += 1;
            emit UnlockAmount(productId, "release to seller", caller);
        }

        if(releaseCount >= 2){
            seller.transfer(amount);
            fundsDisbursed = true;
            emit DisburseAmount(productId, amount, seller);

        }
    }
    // 拍卖失败，释放资金给买家
    function refundAmountToBuyer(address caller) public{
        require(!fundsDisbursed,"Founds should not be disbursed");
        require((caller == buyer || caller  == seller || caller  == arbiter) ,"Caller should be buyer or seller or arbiter ");

        if(!refundAmount[caller]){
            refundAmount[caller] = true;
            refundCount += 1;
            emit UnlockAmount(productId, "refund to buyer", caller);
        }

        if(refundCount >= 2){
            buyer.transfer(amount);
            fundsDisbursed = true;
            emit DisburseAmount(productId, amount, buyer);

        }
    }
}