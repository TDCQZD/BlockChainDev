var express = require('express');
var app = express();

app.listen(3000, function() {
 console.log('Ebay Ethereum server listening on port 3000!');
});

app.get('/', function(req, res) {
 res.send("Hello, World!");
});