const NormalNumber = require("../NormalNumber")

const CalcFaktor=(sale,purchase,payment,debit)=>{
    var totalSale=0
    var totalPurchase=0
    var totalPay=0
    var totalDebit = 0

    for(var i=0;i<sale.length;i++){
        totalSale += NormalNumber(sale[i].price)
    }
    for(var i=0;i<purchase.length;i++){
        totalPurchase += NormalNumber(purchase[i].price)
    }
    for(var i=0;i<payment.length;i++){
        totalPay += NormalNumber(payment[i].price)
    }

    return({totalSale,totalPurchase,totalPay,totalDebit})
}

module.exports =CalcFaktor