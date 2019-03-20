require('babel-register')
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "blue destroy kind chuckle exist hundred sphere mushroom panel long neither give";
module.exports = {
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/08b9759ea6e748f49463fd0aea86c050");
      },
      network_id: 3,
      gas: 5000000 
    }
  }
}
