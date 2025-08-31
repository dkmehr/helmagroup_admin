const FloatDec = require("./FloatDec")

const {OJRAT_DEF,SENFI_DEF,TAX_DEF} = process.env
const CalcPrice=(product,price,TAX)=>{
    if(!product) return(0)
    var floatWeight = parseFloat(product.weight&&
            product.weight.replace(/\//g,'.'))
    totalPrice = floatWeight*price
    var roundPrice = parseInt(Math.round(totalPrice*1000))/1000
    var SENFI = product.sood?parseFloat(product.sood&&
            product.sood.replace(/\//g,'.')):SENFI_DEF
    var OJRAT = product.ojrat?parseFloat(product.ojrat&&
            product.ojrat.replace(/\//g,'.')):OJRAT_DEF
    var poolSang = product.poolSang
    var ojratPrice = parseFloat(OJRAT)*roundPrice/100
    var senfiPrice = parseFloat(roundPrice+ojratPrice)*(SENFI/100)
    var taxValue = parseFloat(TAX?TAX:TAX_DEF)/100

    var taxPrice = (senfiPrice+ojratPrice) * taxValue
    var totalPrice = taxPrice+senfiPrice+ojratPrice+roundPrice
    var finalPrice = parseInt(Math.round(totalPrice)/100)*100
    var priceDetail = {
        taxValue:TAX, taxPrice:taxPrice,
        ojratValue:OJRAT, ojratPrice:ojratPrice,
        senfiValue:SENFI , senfiPrice:senfiPrice,
        poolSang:poolSang, unitPrice:price,
        unitGold:parseInt(Math.round((totalPrice/floatWeight)/1000)*1000),//FloatDec(totalPrice/floatWeight,0),
        goldPrice:roundPrice, weight:floatWeight,
        totalPrice:totalPrice,roundPrice:finalPrice
    }
    return({price:finalPrice,priceDetail:priceDetail})
}

module.exports =CalcPrice