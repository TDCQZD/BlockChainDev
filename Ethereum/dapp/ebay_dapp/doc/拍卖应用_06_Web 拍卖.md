# 拍卖应用_06_Web 拍卖

## 产品 HTML
在这一章，我们会实现在单独页面渲染每个产品的功能。除了仅仅显示产品细节，我们也会实现出价和揭示出价的功能。在 /app 目录下创建一个叫做 product.html 的文件，内容已在下方列出。这是另一个简单的 HTML 文件，它有显示产品细节的占位符。我们也创建了两个表单，一个用于出价，另一个用于揭示出价。

- Bid Form: 出价单有三个文本框，分别输入出价数量，secret 字符串和要发送的数量。

- Reveal Form: 为了揭示出价，我们需要用户输入出价数量和 secret 字符串。我们有 2 个字段来收集这两个信息。

与将 list.item.html 加入到 webpack 配置一样，也将这个文件加入到 webpack。

```
<!DOCTYPE html>
<html>
<head>
 <title>Decentralized Ecommerce Store</title>
 <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
 <link href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' rel='stylesheet' type='text/css'>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
 <script src="./app.js"></script>
</head>
<body>
 <div class="container">
  <h1 class="text-center">Product Details</h1>
  <div class="container">
   <div class="row" id="product-details">
    <div style="display: none;" class="alert alert-success" id="msg"></div>
    <div class="col-sm-12">
     <div class="col-sm-4">
      <div id="product-image"></div>
      <div id="product-name"></div>
      <div id="product-auction-end"></div>
     </div>
     <div class="col-sm-8">
      <h3>Start Price: <span id="product-price"></span></h3>
      <form id="bidding" class="col-sm-4">
       <h4>Your Bid</h4>
       <div class="form-group">
        <label for="bid-amount">Enter Bid Amount</label>
        <input type="text" class="form-control" name="bid-amount" id="bid-amount" placeholder="Amount > Start Price" required="required">
       </div>
       <div class="form-group">
        <label for="bid-send-amount">Enter Amount To Send</label>
        <input type="text" class="form-control" name="bid-send-amount" id="bid-send-amount" placeholder="Amount >= Bid Amount" required="required">
       </div>
       <div class="form-group">
        <label for="secret-text">Enter Secret Text</label>
        <input type="text" class="form-control" name="secret-text" id="secret-text" placeholder="Any random text" required="required">
       </div>
       <input type="hidden" name="product-id" id="product-id" />
       <button type="submit" class="btn btn-primary">Submit Bid</button>
      </form>
      <form id="revealing" class="col-sm-4">
       <h4>Reveal Bid</h4>
       <div class="form-group">
        <label for="actual-amount">Amount You Bid</label>
        <input type="text" class="form-control" name="actual-amount" id="actual-amount" placeholder="Amount > Start Price" required="required">
       </div>
       <div class="form-group">
        <label for="reveal-secret-text">Enter Secret Text</label>
        <input type="text" class="form-control" name="reveal-secret-text" id="reveal-secret-text" placeholder="Any random text" required="required">
       </div>
       <input type="hidden" name="product-id" id="product-id" />
       <button type="submit" class="btn btn-primary">Reveal Bid</button>
      </form>
     </div>
    </div>
    <div id="product-desc" class="col-sm-12">
     <h2>Product Description</h2>
    </div>
   </div>
  </div>
 </div>
</body>
</html>
```
## 产品 JS
**更新 index.js**

如果你对 JavaScript 不太熟悉的话，下面的代码可能会显得比较复杂。让我们来分解一下，理解这些代码做了些什么

1. 为了保持代码简洁，对这三个页面我们都用了同一个 app.js。if($("#product-details").length > 0) 仅是用于检查我们是否在产品细节的页面，如果在，调用 renderProductDetails 函数渲染产品细节。
2. 当我们访问 product.html 页面时，我们将一个请求参数 id=productId 包含在了 url 里面。我们用这个参数从区块链获取产品。
3. 我们可以轻松地调用合约的 getProduct 获取产品细节。我们已经有了所存储的产品图片和描述信息的 IPFS 哈希。只需要用哈希即可渲染图片。但是对于描述信息，我们并不是使用一个指向描述信息的 iframe 或链接，而是使用 IPFS cat 命令来输出我们存储的描述文件的内容，然后显示在我们的 HTML 文件。
4. 我们也定义了几个帮助函数，用于帮助显示更简洁。
`index.js`
```
  // This if block should be with in the window.App = {} function
  if($("#product-details").length > 0) {
   //This is product details page
   let productId = new URLSearchParams(window.location.search).get('id');
   renderProductDetails(productId);
  }
....
....
....
function renderProductDetails(productId) {
 EcommerceStore.deployed().then(function(i) {
  i.getProduct.call(productId).then(function(p) {
   console.log(p);
   let content = "";
   ipfs.cat(p[4]).then(function(file) {
    content = file.toString();
    $("#product-desc").append("<div>" + content+ "</div>");
   });

   $("#product-image").append("<img src='https://ipfs.io/ipfs/" + p[3] + "' width='250px' />");
   $("#product-price").html(displayPrice(p[7]));
   $("#product-name").html(p[1]);
   $("#product-auction-end").html(displayEndHours(p[6]));
   $("#product-id").val(p[0]);
   $("#revealing, #bidding").hide();
   let currentTime = getCurrentTimeInSeconds();
   if(currentTime < p[6]) {
    $("#bidding").show();
   } else if (currentTime - (60) < p[6]) {
    $("#revealing").show();
   }
  })
 })
}


function getCurrentTimeInSeconds(){
 return Math.round(new Date() / 1000);
}

function displayPrice(amt) {
 return 'Ξ' + web3.fromWei(amt, 'ether');
}


function displayEndHours(seconds) {
 let current_time = getCurrentTimeInSeconds()
 let remaining_seconds = seconds - current_time;

 if (remaining_seconds <= 0) {
  return "Auction has ended";
 }

 let days = Math.trunc(remaining_seconds / (24*60*60));
 remaining_seconds -= days*24*60*60;
 
 let hours = Math.trunc(remaining_seconds / (60*60));
 remaining_seconds -= hours*60*60;

 let minutes = Math.trunc(remaining_seconds / 60);
 remaining_seconds -= minutes * 60;

 if (days > 0) {
  return "Auction ends in " + days + " days, " + hours + ", hours, " + minutes + " minutes";
 } else if (hours > 0) {
  return "Auction ends in " + hours + " hours, " + minutes + " minutes ";
 } else if (minutes > 0) {
  return "Auction ends in " + minutes + " minutes ";
 } else {
  return "Auction ends in " + remaining_seconds + " seconds";
 }
}
```
## 出价和揭示出价
在上一节，我们已经加入了显示基于两个表单（出价或是揭示出价）之一的拍卖结束时间的逻辑。定义出价和揭示出价如何处理。这些合约调用在之前的 truffle 控制台我们已经用过，我们仅需要拷贝到 这里的 JavaScript 文件即可。

如下所示，记得将所有的 handler 加到 `start: function() { }` 里面。
```
window.App = {
 start: function() {
   ......
  $("#bidding").submit(function(event) {
     .....
  });
  
   $("#revealing").submit(function(event) {
     .....
   });
   ......
   ......
  }
};
```
`提交竞价`
```
$("#bidding").submit(function(event) {
   $("#msg").hide();
   let amount = $("#bid-amount").val();
   let sendAmount = $("#bid-send-amount").val();
   let secretText = $("#secret-text").val();
   let sealedBid = '0x' + ethUtil.sha3(web3.toWei(amount, 'ether') + secretText).toString('hex');
   let productId = $("#product-id").val();
   console.log(sealedBid + " for " + productId);
   EcommerceStore.deployed().then(function(i) {
    i.bid(parseInt(productId), sealedBid, {value: web3.toWei(sendAmount), from: web3.eth.accounts[0], gas: 440000}).then(
     function(f) {
      $("#msg").html("Your bid has been successfully submitted!");
      $("#msg").show();
      console.log(f)
     }
    )
   });
   event.preventDefault();
});
```
`揭示报价`
```
$("#revealing").submit(function(event) {
   $("#msg").hide();
   let amount = $("#actual-amount").val();
   let secretText = $("#reveal-secret-text").val();
   let productId = $("#product-id").val();
   EcommerceStore.deployed().then(function(i) {
    i.revealBid(parseInt(productId), web3.toWei(amount).toString(), secretText, {from: web3.eth.accounts[0], gas: 440000}).then(
     function(f) {
      $("#msg").show();
      $("#msg").html("Your bid has been successfully revealed!");
      console.log(f)
     }
    )
   });
   event.preventDefault();
});
```