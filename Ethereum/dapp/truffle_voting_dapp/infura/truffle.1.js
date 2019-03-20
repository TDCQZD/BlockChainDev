require('babel-register')

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' ,// Match any network id
      gas: 5000000  
    }
  }
}
