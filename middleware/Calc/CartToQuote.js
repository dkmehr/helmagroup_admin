const cart = require("../../models/product/cart")
const CartDataSchema= require("../../models/product/cartData")
const faktor = require("../../models/product/faktor")
const faktorItems = require("../../models/product/faktorItems")
const quote = require("../../models/product/quote")
const quoteData = require("../../models/product/quoteData")
const CalcCart = require("../CalcCart")
const CalcQuote = require("../CalcQuote")
const CreateFaktorLog = require("../CreateFaktorLog")
const CreateNotif = require("../CreateNotif")
const NewCode = require("../NewCode")
const NormalNumber = require("../NormalNumber")
const FindCount = require("./FindCount")
const SendSMS = require("./SendSMS")

const CartToQuote=async(userData,code,manageId,pending,inPerson)=>{
    const userId = userData._id
    const business = userData.business
    const userCode = userData.phone&&userData.phone.substr(userData.phone.length - 4)
        const faktorNo = await NewCode("f"+userCode)
        const cartDetail = await CalcQuote(userId)
        var fullPrice = 0
        var totalPrice = 0
        var totalDiscount = 0
        var totalCount = 0
        var totalDiscountCart=0
        if(!cartDetail.cart||!cartDetail.cart.length){
            return({error:"سبد خرید خالی است"})
        }
        const cartData = cartDetail.cartDetail
        const cartDiscount = cartDetail.totalDiscount
        const cartDescription = cartDetail.description
        const transport = inPerson?
        {
            transportPrice:0,
            transportId:5,
            transportName:"تحویل حضوری"
        }
        :cartDetail.transportMethod[0]
        totalDiscount = cartData.cartDiscount
        totalDiscountCart=cartData.totalDiscountCart
        totalPrice=cartData.cartPrice
        totalCount = cartData.totalCount
        fullPrice = cartData.fullPrice
        var status = "quote"
        for(var i=0;i<(cartDetail.cart&&cartDetail.cart.length);i++){
            var cartItem = cartDetail.cart[i]
            var statusItem = "quote"
            
            const { _id: _, ...newObj } = cartItem;
            await faktorItems.create({...newObj,faktorNo:faktorNo,
                status:status,cartDetail,
                cName:userData.username,phone:userData.phone})
            await CreateFaktorLog(userId,faktorNo,"regOrder",statusItem,"","",newObj)
            await CreateNotif("ثبت سفارش",userData._id,"order",
                "print/"+faktorNo,"order","",faktorNo
            )
        }
        const faktorData = {
            faktorNo:faktorNo,
            userId:userId, 
            manageId:manageId,
            transportId:transport&&transport.transportId,
            transportName:transport&&transport.transportName,
            initDate:Date.now(),
            progressDate:Date.now(),
            status:status,
            waitPay:true,
            Authority:code,
            isActive:true, isEdit:false,
            totalPrice:NormalNumber(totalPrice),
            fullPrice:NormalNumber(fullPrice),
            totalDiscount:NormalNumber(totalDiscount),
            transportPrice:transport&&transport.transportPrice,
            totalCount:totalCount,
            totalDiscountCart:NormalNumber(totalDiscountCart),
            description:cartDescription,
            discount:cartDiscount,
            cName:userData.cName?(userData.cName + " "+ userData.sName):userData.username,
            phone:userData.phone
        }
        await faktor.create(faktorData)
        await quote.deleteMany({userId:userId})
        await quoteData.deleteOne({userId:userId})
        
        0&&userData.phone&&await SendSMS(userData.phone,"sabt",userData.username,faktorNo)
        return({faktorNo:faktorNo,totalPrice:totalPrice,fullPrice:fullPrice,
            message:"پیش فاکتور ثبت شد"})
}

module.exports =CartToQuote