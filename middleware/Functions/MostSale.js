const faktorItems = require("../../models/product/faktorItems")
const products = require("../../models/product/products")

const MostSale=async()=>{
    const mostProduct = await faktorItems.aggregate([
    {
        $group: {
        _id: "$sku",          // group by SKU
        count: { $sum: 1 }    // count occurrences
        }
    },
    { $sort: { count: -1 } }, // sort by count descending
    { $limit: 3 }             // get top 3 most used
    ])
    var productDetail=[]
    for(var i=0;i<mostProduct.length;i++){
        const productData = await products.findOne({sku:mostProduct[i]._id},
            {masterSku:1,sku:1,_id:0,isMaster:1,title:1,imageUrl:1,thumbUrl:1}).lean()
        if(productData.isMaster){
            productDetail.push(productData)
        }
        else{
            const masterProduct = await products.findOne({sku:productData.masterSku},
            {masterSku:1,sku:1,_id:0,isMaster:1,title:1,imageUrl:1,thumbUrl:1}).lean()
            productDetail.push(masterProduct)
        }
    }
    return(productDetail)
}

module.exports =MostSale