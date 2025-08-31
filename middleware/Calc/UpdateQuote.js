const customers = require("../../models/auth/customers");
const cart = require("../../models/product/cart");
const quote = require("../../models/product/quote");
const FindCount = require("./FindCount");
var ObjectID = require('mongodb').ObjectID;

const UpdateQuote=async(cartId,countRaw,unitPriceRaw,discountRaw,isQuote)=>{
    const cartData = await quote.findOne({_id:ObjectID(cartId)})
    
    var unitPrice = Number(unitPriceRaw?unitPriceRaw:cartData.unitPrice)
    var count = Number(countRaw?countRaw:cartData.count)

    var discount = Number(discountRaw?discountRaw:cartData.discount)
    var fullPrice = unitPrice*count
    var discountPrice = discount?(fullPrice*(discount/100)):0
    var price = fullPrice-discountPrice
    const query = {
        count:count, 
        unitPrice:unitPrice,
        discount : discount,
        fullPrice:fullPrice,
        discountPrice:discountPrice,
        price:price

    }
    await quote.updateOne({_id:ObjectID(cartId)},{$set:query})
    return({message:"done"})
}

module.exports =UpdateQuote