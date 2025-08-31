const discount = require("../../models/orders/discount")

const FindDiscount=async(data,userId)=>{
    if(!data||!userId) return(0)
    var category = data.category
    if(!category) return(0)
    var searchDiscount = await discount.findOne({userId:userId,
        category:category
    })
    if(!searchDiscount) return(0)
    var discountResult = searchDiscount.discount
    return(discountResult)
}

module.exports =FindDiscount