
let router = require('express').Router();
let walletController = require("../controllers/wallet")

//将创建钱包的接口绑定到路由。
router.post("/wallet/create", walletController.walletCreate)

router.get("/wallet.html", (req, res) => {
    res.render("wallet.html");
})

module.exports = router
