const customers = require("../models/auth/customers");
const quoteDataModel = require("../models/product/quoteData");
const quote = require("../models/product/quote");
var ObjectID = require('mongodb').ObjectID;

const CalcQuote=async(userId,manageId)=>{
    var fullPrice = 0
    var totalPrice = 0
    var totalCount = 0
    var totalDiscount = 0
    
    var transport = [{
        transportId:"11",
        transportName:"تحویل پستی",
        transportPrice:900000
    }]
    const cartDetails = await quote.find({userId:userId}).lean()
    const customerDetails = await customers.findOne({_id:ObjectID(userId)})
    
    var hasAddress = customerDetails&&
        customerDetails.Address&&
        customerDetails.sName&&
        customerDetails.postalCode&&
        customerDetails.state&&
        customerDetails.city
    const cartInfo = await quoteDataModel.findOne({userId:userId})
    var totalDiscountCart = 0

    for(var c=0;c<cartDetails.length;c++){
        unitPrice = cartDetails[c].unitPrice
        fullPrice += Number(unitPrice)*cartDetails[c].count
        var totalDicountCartPrice = cartInfo&&cartInfo.discount?
            Number(cartInfo&&cartInfo.discount)/100 *Number(cartDetails[c].price):0
        totalDiscountCart += totalDicountCartPrice
        totalDiscount += Number(cartDetails[c].discountPrice)
        totalPrice += Number(cartDetails[c].price)-totalDicountCartPrice
        totalCount += cartDetails[c].count
    }
    var accessFrom = (customerDetails&&customerDetails.access!=="customer")?true:false
    const transportPrice = fullPrice?transport[0].transportPrice:0
    return({cart:cartDetails,
        transportMethod:transport,
        cartDetail: {
            "transport":fullPrice?transport[0]:'',
            "totalCount":totalCount,
            "cartDiscount": totalDiscount,
            "totalDiscountCart":totalDiscountCart,
            "transportPrice":transportPrice,
            "fullPrice":fullPrice+transportPrice,
            "cartPrice": totalPrice
        },
        from:accessFrom,hasAddress:hasAddress?true:false,
        customerDetails,
        description:cartInfo&&cartInfo.description,
        totalDiscount:cartInfo&&cartInfo.discount
    })
}

module.exports =CalcQuote