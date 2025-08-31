const customers = require("../models/auth/customers");
const products = require("../models/product/products");
const quote = require("../models/product/quote");
const FindCount = require("./Calc/FindCount");
var ObjectID = require('mongodb').ObjectID;

const CreateQuote=async(cartDetails,sku,userId,count,discount)=>{
    var index = cartDetails.find(item=>item.sku==sku)
    const userData = await customers.findOne({_id:ObjectID(userId)})
    if(!userData){
        return({error:"مشتری پیدا نشد"})
    }
    const business = userData.business
    if(!index){
        const productDetail = await products.findOne({sku:sku})
        if(!productDetail){
            return({error:"محصول پیدا نشد"})
        }
        const existProduct = !business&&await FindCount(sku,count?Number(count):1)
        if(!business && existProduct<0){
            return({error:"موجودی کافی نیست"})
        }
        var sellPrice = Number(productDetail.sellPrice)
        var fullPrice = sellPrice*(count?count:1)
        var discountPrice = discount?fullPrice *Number(discount)/100:0
        var price = discount?(fullPrice - discountPrice):fullPrice
        await quote.create({
            sku:sku,
            title:productDetail.title,
            ItemID:productDetail.ItemID,
            weight:productDetail.weight,
            price:price,
            discount:discount,
            discountPrice:discountPrice,
            unitPrice:sellPrice,
            count:count?count:1,
            userId:userId
        })
    }
    else{
        return({error:'محصول در سبد وجود دارد'})
    }
    return({message:"done"})
}

module.exports =CreateQuote