const assert =require('assert');
const sum = require('./sum.js');

describe('#sum.js',()=>{
    describe('#sum.js',()=>{
        it('sum() should return 0',()=>{
            assert.strictEqual(sum(),0);
        });
        it('sum(1) should return 1',()=>{
            assert.strictEqual(sum(1),1);
        });
        it('sum(1,2) should return 3',()=>{
            assert.strictEqual(sum(1,2),3);
        });
        it('sum(1,2,3) should return 6',()=>{
            assert.strictEqual(sum(1,2,3),6);
        });
    });
});

