const prepaid = require("../models/param/prepaid");
const tax = require("../models/param/tax");
const cart = require("../models/product/cart");
const products = require("../models/product/products");
const CalcPrice = require("./CalcPrice");
const CalcPurchase = require("./CalcPurchase");
const FindPrice = require("./FindPrice");

const CreateCartPurchase=async(data,userId)=>{
    
    const priceRaw = await FindPrice()
    var count = data.count?data.count:1
    const priceDetail = CalcPurchase(data.ayar,priceRaw,data.weight,count)
    const price = data.price?data.price:priceDetail.price
    await cart.create({
        title:data.title,
        purchaseType:data.purchaseType,
        weight:data.weight,
        lab:data.lab,
        ayar:data.ayar,
        riang:data.riang,
        count:data.count,
        priceDetail:priceDetail.priceDetail,
        price:price,
        fullPrice:price,
        unitPrice:priceRaw,
        purchase:true,
        description:data.description,
        userId:userId
    })
    
    return({message:"done"})
}

module.exports =CreateCartPurchase