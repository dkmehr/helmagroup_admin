const customers = require("../models/auth/customers");
const tax = require("../models/param/tax");
const cart = require("../models/product/cart");
const products = require("../models/product/products");
const CalcPrice = require("./CalcPrice");
const CalcPurchase = require("./CalcPurchase");
const FindPrice = require("./FindPrice");
var ObjectID = require('mongodb').ObjectID;

const CalcCartRecalc=async(userId)=>{
    const priceRaw = await FindPrice() 
    const cartDetails = await cart.find({userId:userId}).lean()
    
    var TAX = await tax.findOne().sort({date:-1})
    for(var c=0;c<cartDetails.length;c++){
        if(cartDetails[c].purchase){
            var count = cartDetails[c].count? cartDetails[c].count:1
            const priceDetail = CalcPurchase(cartDetails[c].ayar,priceRaw,
                cartDetails[c].weight,count)
            var tempPrice = priceDetail.price
            await cart.updateOne({_id:ObjectID(cartDetails[c]._id)},
            {$set:{price:tempPrice,unitPrice:priceRaw,
                priceDetail:priceDetail&&priceDetail.priceDetail,progressDate:Date.now()}})
        }
        else{
            const productDetail = 
                await products.findOne({sku:cartDetails[c].sku})
            const priceDetail = CalcPrice(productDetail,priceRaw,TAX&&TAX.percent)
            var tempPrice = priceDetail.price
            
            await cart.updateOne({_id:ObjectID(cartDetails[c]._id)},
            {$set:{price:tempPrice,unitPrice:priceRaw,
                priceDetail:priceDetail&&priceDetail.priceDetail,progressDate:Date.now()}})
        }
            
    }
    return(1)
}

module.exports =CalcCartRecalc