const customers = require("../models/auth/customers");
const cart = require("../models/product/cart");
const products = require("../models/product/products");
const FindCount = require("./Calc/FindCount");
var ObjectID = require('mongodb').ObjectID;

const CreateCart=async(cartDetails,sku,userId,count,discount,isQuote,service)=>{
    var index = cartDetails.find(item=>item.sku==sku)
    const userData = await customers.findOne({_id:ObjectID(userId)})
    if(!userData){
        return({error:"مشتری پیدا نشد"})
    }
    const business = userData.business||isQuote
    //if(!index){
        const productDetail = await products.findOne({sku:sku})
        if(!productDetail){
            return({error:"محصول پیدا نشد"})
        }
        const existProduct = !business&&await FindCount(sku,count?Number(count):1)
        if(!isQuote &&!business && existProduct<0){
            return({error:"موجودی کافی نیست"})
        }
        var unitPrice = Number(productDetail.sellPrice)
        var totalPrice = unitPrice*(count?count:1)
        var discountPrice = discount?(totalPrice *Number(discount)/100):0
        var fullPrice = discount?(totalPrice - discountPrice):totalPrice
        const cartCreateDetail = await cart.create({
            sku:sku,
            title:productDetail.title,
            ItemID:productDetail.ItemID,
            weight:productDetail.weight,
            price:fullPrice,
            totalPrice:totalPrice,
            discount:discount,
            discountPrice:discountPrice,
            unitPrice:unitPrice,
            fullPrice:fullPrice,
            count:count?count:1,
            userId:userId
        })
    /*}
    else{
        return({error:'محصول در سبد وجود دارد'})
    }*/
    return({cartCreateDetail,message:"done"})
}

module.exports =CreateCart