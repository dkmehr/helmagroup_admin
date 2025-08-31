const customers = require("../../models/auth/customers");
const cart = require("../../models/product/cart");
const FindCount = require("./FindCount");
var ObjectID = require('mongodb').ObjectID;

const UpdateCart=async(cartId,countRaw,unitPriceRaw,discountRaw,isQuote)=>{
    const cartData = await cart.findOne({_id:ObjectID(cartId)})
    const userData = await customers.findOne({_id:ObjectID(cartData.userId)})
    
    const business = userData.business ||isQuote
    
    var unitPrice = Number(unitPriceRaw?unitPriceRaw:cartData.unitPrice)
    var count = Number(countRaw?countRaw:cartData.count)

    const existProduct = !business&&await FindCount(cartData.sku,count)
    if(!isQuote && !business && existProduct<0){
        return({error:"موجودی کافی نیست"})
    }

    var discount = Number(discountRaw?discountRaw:cartData.discount)
    var totalPrice = unitPrice*count
    var discountPrice = discount?(totalPrice*(discount/100)):0
    var price = totalPrice-discountPrice
    var fullPrice = price
    const query = {
        count:count, 
        unitPrice:unitPrice,
        discount : discount,
        fullPrice:fullPrice,
        totalPrice:totalPrice,
        discountPrice:discountPrice,
        price:price

    }
    await cart.updateOne({_id:ObjectID(cartId)},{$set:query})
    return({message:"done"})
}

module.exports =UpdateCart