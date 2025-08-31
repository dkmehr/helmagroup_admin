const faktor = require("../models/product/faktor");
const faktorItems = require("../models/product/faktorItems");
const FloatDec = require("./FloatDec");
const ItemToDetail = require("./ItemsToDetail");
const NormalNumber = require("./NormalNumber");
var ObjectID = require('mongodb').ObjectID;

const CalcFaktorData=async(faktorNo)=>{
    
    const faktorOld = await faktor.findOne({faktorNo:faktorNo})
    var faktorDiscount = faktorOld.discount
    const faktorItemDetail = await faktorItems.find({faktorNo:faktorNo})
    var totalData = ItemToDetail(faktorItemDetail)
    var purePrice = totalData&&totalData.totalPrice
    var itemPrice = totalData&&totalData.finalPrice
    var itemDiscount = totalData&&totalData.totalDiscount
    var faktorDiscountValue =0&&itemPrice* Number(faktorDiscount)/100
    var discountTotal = faktorDiscountValue+itemDiscount
    //console.log(totalData)
    await faktor.updateOne({faktorNo:faktorNo},{$set:{
        purePrice:purePrice,
        totalPrice:itemPrice,
        totalDiscount:discountTotal,
        totalCount:totalData&&totalData.totalCount,
        totalData:totalData
    }})
    const faktorResult = await faktor.findOne({faktorNo:faktorNo}).lean()
    const faktorItemResult = await faktorItems.find({faktorNo:faktorNo})
    faktorResult.items = faktorItemResult
    return(faktorResult)
    
}

module.exports =CalcFaktorData