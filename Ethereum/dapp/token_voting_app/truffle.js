require('babel-register')

module.exports = {
  networks: {
    development: {
      host: '0.0.0.0',
      port: 8545,
      network_id: '*' ,// Match any network id
      gas: 5000000  
    }
  }
}
