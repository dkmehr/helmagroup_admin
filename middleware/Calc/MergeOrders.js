const products = require("../../models/product/products")

const MergeOrders=async(orderData)=>{
    var skuList = []

    for(var i=0;i<orderData.length;i++){
        var index = FindSku(orderData[i],skuList)
        
        if(index==-1){
            const productData = await products.findOne({sku:orderData[i].sku})
            if(!productData)return(-1)
            const productMaster = await products.findOne({sku:productData.masterSku})
            orderData[i].catCode = productData.categories&&productData.categories[0].catCode
            orderData[i].catName = productData.categories&&productData.categories[0].title
            orderData[i].masterSku = productData.masterSku
            orderData[i].masterName = productMaster&&productMaster.title
            skuList.push(orderData[i])
        }
        else
            skuList[index].count = SumCount(skuList[index].count,orderData[i].count)
    }
    return(skuList)
}
const FindSku = (itemNew,array)=>{
    if(!array||!array.length||!itemNew) return(-1)
    
    const index = array.findIndex(item=>item.sku == itemNew.sku)
    return(index)
}
const SumCount=(count1,count2)=>{
    if(!count1) return(count2)
    if(!count2) return(count1)
    var result = Number(count1) + Number(count2)
    return(result)
}

module.exports =MergeOrders