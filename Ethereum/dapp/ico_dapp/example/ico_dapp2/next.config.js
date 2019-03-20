const config = require('config');
module.exports = {
    // 只有后端可用的配置 
    serverRuntimeConfig: {
        mySecret: 'secret'  // 不能暴露给前端的机密信息
    },
    // 前后端都可用的配置 
    publicRuntimeConfig: {
        providerUrl: config.get('providerUrl')
    }
};
