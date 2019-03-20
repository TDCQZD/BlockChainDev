(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{1003:function(e,t,n){__NEXT_REGISTER_PAGE("/projects/create",function(){return e.exports=n(1004),{page:e.exports.default}})},1004:function(e,t,n){"use strict";n.r(t);var r=n(23),a=n.n(r),o=n(0),i=n.n(o),s=n(2),u=(n(49),n(14)),l=n(121),c=n(64),p=n(65);function f(e){return(f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function m(e,t,n,r,a,o,i){try{var s=e[o](i),u=s.value}catch(e){return void n(e)}s.done?t(u):Promise.resolve(u).then(r,a)}function h(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function d(e){return(d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function g(e,t){return(g=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function b(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}var v=function(e){function t(e){var n,r,a;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),r=this,(n=!(a=d(t).call(this,e))||"object"!==f(a)&&"function"!=typeof a?b(r):a).state={description:"",minInvest:0,maxInvest:0,goal:0,errmsg:"",loading:!1},n.onSubmit=n.createProject.bind(b(b(n))),n}var n,r,o,c,v;return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&g(e,t)}(t,i.a.Component),n=t,(r=[{key:"getInputHandler",value:function(e){var t=this;return function(n){console.log(n.target.value),t.setState(function(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}({},e,n.target.value))}}},{key:"createProject",value:(c=a.a.mark(function e(){var t,n,r,o,i,s,c,p,f,m,h;return a.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(t=this.state,n=t.description,r=t.minInvest,o=t.maxInvest,i=t.goal,console.log(this.state),n){e.next=4;break}return e.abrupt("return",this.setState({errmsg:"项目名称不能为空"}));case 4:if(!(r<=0)){e.next=6;break}return e.abrupt("return",this.setState({errmsg:"项目最小投资金额必须大于0"}));case 6:if(!(o<=0)){e.next=8;break}return e.abrupt("return",this.setState({errmsg:"项目最大投资金额必须大于0"}));case 8:if(!(parseInt(o)<parseInt(r))){e.next=10;break}return e.abrupt("return",this.setState({errmsg:"项目最小投资金额必须小于最大投资金额"}));case 10:if(!(i<=0)){e.next=12;break}return e.abrupt("return",this.setState({errmsg:"项目募资上限必须大于0"}));case 12:return s=u.a.utils.toWei(r,"ether"),c=u.a.utils.toWei(o,"ether"),p=u.a.utils.toWei(i,"ether"),e.prev=15,this.setState({loading:!0}),e.next=19,u.a.eth.getAccounts();case 19:return f=e.sent,m=f[0],e.next=23,l.a.methods.createProject(n,s,c,p).send({from:m,gas:"5000000"});case 23:h=e.sent,this.setState({errmsg:"项目创建成功"}),console.log(h),e.next=32;break;case 28:e.prev=28,e.t0=e.catch(15),console.error(e.t0),this.setState({errmsg:e.t0.message||e.t0.toString()});case 32:return e.prev=32,this.setState({loading:!1}),e.finish(32);case 35:case"end":return e.stop()}},e,this,[[15,28,32,35]])}),v=function(){var e=this,t=arguments;return new Promise(function(n,r){var a=c.apply(e,t);function o(e){m(a,n,r,o,i,"next",e)}function i(e){m(a,n,r,o,i,"throw",e)}o(void 0)})},function(){return v.apply(this,arguments)})},{key:"render",value:function(){return i.a.createElement(p.a,null,i.a.createElement(s.q,{variant:"title",color:"inherit"},"创建"),i.a.createElement(s.i,{style:{width:"60%",padding:"15px",marginTop:"15px"}},i.a.createElement("form",{noValidate:!0,autoComplete:"off",style:{marginBottom:"15px"}},i.a.createElement(s.o,{fullWidth:!0,required:!0,id:"description",label:"项目名称",value:this.state.description,onChange:this.getInputHandler("description"),margin:"normal"}),i.a.createElement(s.o,{fullWidth:!0,required:!0,id:"minInvest",label:"最小投资金额",value:this.state.minInvest,onChange:this.getInputHandler("minInvest"),margin:"normal",InputProps:{endAdornment:"ETH"}}),i.a.createElement(s.o,{fullWidth:!0,required:!0,id:"maxInvest",label:"最大投资金额",value:this.state.maxInvest,onChange:this.getInputHandler("maxInvest"),margin:"normal",InputProps:{endAdornment:"ETH"}}),i.a.createElement(s.o,{fullWidth:!0,required:!0,id:"goal",label:"募资上限",value:this.state.goal,onChange:this.getInputHandler("goal"),margin:"normal",InputProps:{endAdornment:"ETH"}})),i.a.createElement(s.b,{variant:"raised",size:"large",color:"primary",onClick:this.onSubmit},this.state.loading?i.a.createElement(s.f,{color:"secondary",size:24}):"创建项目"),!!this.state.errmsg&&i.a.createElement(s.q,{component:"p",style:{color:"red"}},this.state.errmsg)))}}])&&h(n.prototype,r),o&&h(n,o),t}();t.default=Object(c.a)(v)}},[[1003,1,0]]]);