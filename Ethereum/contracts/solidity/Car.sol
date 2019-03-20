pragma solidity >0.4.22;
contract Car { 
	string public brand;
	uint public price;
	constructor(string initBrand, uint initPrice){
		brand = initBrand;
		price = initPrice;
	}
	function setBrand(string newBrand) public { 
		brand = newBrand; 
	} 
	function getBrand() public view returns (string){
        return brand;
    }
	function setPrice(uint newPrice)public view returns(uint) { 
		price = newPrice; 
	} 
}
