
const cartService = require("../../models/product/cartService");
const Services = require("../../models/product/Services")
var ObjectID = require('mongodb').ObjectID;

const AddServiceToCart=async(data,userId,cartId)=>{
    const hesabfa = data.hesabfa
        const serviceData = await Services.findOne({hesabfa:hesabfa})
        if(!serviceData||!cartId){
            return ({error:"سفارش انتخاب شده مجاز نیست"})
        }
        data.title = serviceData.title
        data.serviceId = serviceData._id
        data.unitPrice = serviceData.price
        const cartData = await cartService.findOne({userId:userId,cartId:cartId})
        if(cartData){
            return({error:"سرویس انتخاب شده است"})
        } 
        else{
            data.userId = userId
            data.cartId = cartId
            const service = await cartService.create(data)
            
            return({service,message:"آیتم اضافه شد"})
        } 
}

module.exports =AddServiceToCart