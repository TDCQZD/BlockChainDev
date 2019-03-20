const fs = require('fs-extra');
const solc = require('solc');
const path = require('path');

// cleanup 
const compilePath = path.resolve(__dirname,'../compiled/');
fs.readdirSync(compilePath);
fs.ensureDirSync(compilePath);

// compile
const contarctPath = path.resolve(__dirname, '../contracts/', 'Car.sol');
const contractSource = fs.readFileSync(contarctPath, 'utf-8');
let compileResult = solc.compile(contractSource, 1)// 1:打开solc 工具优化器


// check errors 
if (Array.isArray(compileResult.errors) && compileResult.errors.length) {
    throw new Error(compileResult.errors[0]);
}

// save to disk 
Object.keys(compileResult.contracts).forEach(name => {
    let contractName = name.replace(/^:/, '');
    let filePath = path.resolve(compilePath,
        `${contractName}.json`);
    fs.outputJsonSync(filePath, compileResult.contracts[name]);
    console.log(`save compiled contract ${contractName} to 
                        ${filePath}`);
});


