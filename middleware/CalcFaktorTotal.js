const customers = require("../models/auth/customers");
const cart = require("../models/product/cart");
const cartDataModel = require("../models/product/cartData");
const cartService = require("../models/product/cartService");
var ObjectID = require('mongodb').ObjectID;

const CalcFaktorTotal=async(userId,manageId)=>{
    var fullPrice = 0
    var totalPrice = 0
    var totalCount = 0
    var totalDiscount = 0
    var totalServicePrice = 0
    
    var transport = [{
        transportId:"11",
        transportName:"تحویل پستی",
        transportPrice:900000
    }]
    const cartDetails = await cart.find({userId:userId}).lean()
    const customerDetails = await customers.findOne({_id:ObjectID(userId)})
    
    var hasAddress = customerDetails&&
        customerDetails.Address&&
        customerDetails.sName&&
        customerDetails.postalCode&&
        customerDetails.state&&
        customerDetails.city
    const cartInfo = await cartDataModel.findOne({userId:userId})
    var totalDiscountCart = 0

    for(var c=0;c<cartDetails.length;c++){
        const serviceCart = await cartService.findOne({
             userId:userId,cartId:String(cartDetails[c]._id)
        })
        cartDetails[c].service = serviceCart
        var servicePrice = serviceCart?Number(serviceCart.unitPrice):0
        var serviceTotal = servicePrice * cartDetails[c].count
        totalServicePrice += serviceTotal
        unitPrice = cartDetails[c].unitPrice
        var itemPrice = Number(unitPrice)*cartDetails[c].count
        var totalDicountCartPrice = cartInfo&&cartInfo.discount?
            Number(cartInfo&&cartInfo.discount)/100 *Number(cartDetails[c].price):0
        totalDiscountCart += totalDicountCartPrice
        totalDiscount += Number(cartDetails[c].discountPrice)
        totalPrice += itemPrice

        fullPrice += totalPrice-totalDicountCartPrice
        totalCount += cartDetails[c].count
    }
    var accessFrom = (customerDetails&&customerDetails.access!=="customer")?true:false
    const transportPrice = fullPrice?transport[0].transportPrice:0
    return({cart:cartDetails,
        transportMethod:transport,
        cartDetail: {
            "transport":fullPrice?transport[0]:'',
            "totalCount":totalCount,
            "totalServicePrice":totalServicePrice,
            "cartDiscount": totalDiscount,
            "totalDiscountCart":totalDiscountCart,
            "transportPrice":transportPrice,
            "fullPrice":fullPrice+transportPrice+totalServicePrice,
            "cartPrice": totalPrice
        },
        from:accessFrom,hasAddress:hasAddress?true:false,
        customerDetails,
        description:cartInfo&&cartInfo.description,
        totalDiscount:cartInfo&&cartInfo.discount
    })
}

module.exports =CalcFaktorTotal