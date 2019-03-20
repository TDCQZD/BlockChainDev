const assert =require('assert');
const sum = require('./sum.js');

assert.strictEqual(sum(),0);
assert.strictEqual(sum(1),1)
assert.strictEqual(sum(1,2),3)
assert.strictEqual(sum(1,2,3),6)

console.log("General test sucessfully!");
