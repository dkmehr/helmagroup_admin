const Colors = require("../../models/product/Colors")

const FindSimilar=(array,item)=>{
    if(!array||!array.length) return(0)
    if(!item) return(0)
    for(var i=0;i<array.length;i++){
        if(array[i].value&&array[i].value==item.value) return(1)
    }
return(0)
}

module.exports =FindSimilar