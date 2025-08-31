const faktor = require("../models/product/faktor");
const faktorItems = require("../models/product/faktorItems");
const FloatDec = require("./FloatDec");
const ItemToDetail = require("./ItemsToDetail");
const NormalNumber = require("./NormalNumber");
var ObjectID = require('mongodb').ObjectID;

const ReCalcFaktorItemData=async(faktorItem)=>{
    const faktorItemDetail = await faktorItems.findOne({_id:ObjectID(faktorItem)})
    
    var totalPrice = Number(faktorItemDetail.unitPrice)*
        Number(faktorItemDetail.count)
    var discountPrice = totalPrice*Number(faktorItemDetail.discount)/100
    var servicePrice = Number(faktorItemDetail.servicePrice)
    var fullPrice = totalPrice-discountPrice
    
    //console.log(totalData)
    await faktorItems.updateOne({_id:ObjectID(faktorItem)},{$set:{
        fullPrice, totalPrice,discountPrice,
        servicePrice
    }})
    return("updated")
    
}

module.exports =ReCalcFaktorItemData