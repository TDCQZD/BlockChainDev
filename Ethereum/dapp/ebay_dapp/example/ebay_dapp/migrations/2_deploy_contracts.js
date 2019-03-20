var EcommerceStore = artifacts.require("../contracts/EcommerceStore.sol");

module.exports = function (deployer) {
  deployer.deploy(EcommerceStore);
};

