module.exports=function sum(...reset) {
    var sum = 0;
    for (let i of reset){
        sum += i;
    }
    return sum;
}