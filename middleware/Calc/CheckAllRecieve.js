const faktorItems = require("../../models/product/faktorItems")

const CheckAllRecieve=async(faktorNo)=>{
    const faktorItemsList = await faktorItems.find({faktorNo:faktorNo})
    if(!faktorItemsList||!faktorItemsList.length) return(0)
    
    for(var i=0;i<faktorItemsList.length;i++){
        if(!faktorItemsList[i].isRecieved){
            return(0) 
        }
        
    }
    return(1)
}

module.exports =CheckAllRecieve