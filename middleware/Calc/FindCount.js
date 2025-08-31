const products = require("../../models/product/products")

const FindCount=async(sku,count)=>{
    const productData = await products.findOne({sku:sku})
    var existCode = productData.stock
    var remain = existCode-count
    return(remain)
}

module.exports =FindCount