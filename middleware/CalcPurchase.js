const FloatDec = require("./FloatDec")

const CalcPurchase=(Ayar,price,weight,count)=>{
    if(!weight||!Ayar) return(0)
    var floatWeight = parseFloat(weight.replace(/\//g,'.'))
    var ayarPercent = parseFloat(Ayar)/750
    var ayarRound = Math.round(floatWeight*ayarPercent*100)/100
    var finalPrice = FloatDec(ayarRound*price,1)
    
    var priceDetail = {
        Ayar:Ayar, ayarPercent:ayarRound, 
        singlePrice:finalPrice,
        singleWeight:floatWeight,
        unitPrice:price, weight:floatWeight*count,
        roundPrice:finalPrice*count
    }
    return({price:finalPrice,priceDetail:priceDetail})
}

module.exports =CalcPurchase