const faktor = require("../models/product/faktor");
const faktorItems = require("../models/product/faktorItems");
const FloatDec = require("./FloatDec");
const ItemToDetail = require("./ItemsToDetail");
const NormalNumber = require("./NormalNumber");
var ObjectID = require('mongodb').ObjectID;

const ReCalcFaktorData=async(faktorNo)=>{
    
    const faktorOld = await faktor.findOne({faktorNo:faktorNo})
    var faktorDiscount = faktorOld.discount
    const faktorItemDetail = await faktorItems.find({faktorNo:faktorNo})
    
    var fullPrice = 0
    var totalPrice = 0
    var totalCount = 0
    var totalDiscount = 0
    var totalServicePrice = 0
    for(var c=0;c<faktorItemDetail.length;c++){
        var item = faktorItemDetail[c]
        totalPrice += Number(item.totalPrice)
        totalDiscount += Number(item.discountPrice)
        totalCount += item.count
        totalServicePrice += Number(item.totalServicePrice)

        fullPrice += Number(item.fullPrice)
    }
    //console.log(totalData)
    await faktor.updateOne({faktorNo:faktorNo},{$set:{
        fullPrice, totalPrice,totalDiscount,
        totalCount,totalServicePrice
    }})
    const faktorResult = await faktor.findOne({faktorNo:faktorNo}).lean()
    const faktorItemResult = await faktorItems.find({faktorNo:faktorNo})
    faktorResult.items = faktorItemResult
    return(faktorResult)
    
}

module.exports =ReCalcFaktorData