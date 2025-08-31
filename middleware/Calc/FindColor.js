const Colors = require("../../models/product/Colors")

const FindColor=async(search)=>{
    const colorData = await Colors.findOne({$or:
        [{title:search},{enTitle:search}]},{_id:0})
    
    if(colorData){
        return({
            title:colorData.title,
            value:colorData.enTitle,
            colorCode:colorData.colorCode
        })
    }
    else
        return({
            title:search,
            value:search,
            colorCode:''
        })
}

module.exports =FindColor