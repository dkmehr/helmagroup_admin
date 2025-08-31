const cart = require("../../models/product/cart")
const CartDataSchema= require("../../models/product/cartData")
const cartService = require("../../models/product/cartService")
const faktor = require("../../models/product/faktor")
const faktorItems = require("../../models/product/faktorItems")
const faktorService = require("../../models/product/faktorService")
const CalcCart = require("../CalcCart")
const CreateFaktorLog = require("../CreateFaktorLog")
const CreateNotif = require("../CreateNotif")
const NewCode = require("../NewCode")
const NormalNumber = require("../NormalNumber")
const FindCount = require("./FindCount")
const ListFaktor = require("./ListFaktor")
const SendSMS = require("./SendSMS")
var ObjectID = require('mongodb').ObjectID;

const CartToFaktor=async(userData,code,manageId,pending,inPerson,isQuote)=>{
    const userId = userData._id
    const business = userData.business
    const userCode = userData.phone&&userData.phone.substr(userData.phone.length - 4)
        const faktorNo = await NewCode("f"+userCode)
        const cartDetail = await CalcCart(userId,inPerson)
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
        
        var status = pending?"pending":"inprogress"
        for(var i=0;i<(cartDetail.cart&&cartDetail.cart.length);i++){
            var cartItem = cartDetail.cart[i]
            var statusItem = "inprogress"
            const productDetail = 0&&await products.findOne({sku:cartItem.sku})
            const stock = await FindCount(cartItem.sku,cartItem.count)
            if(stock<0) {
                if(!business&&!isQuote){
                    return({faktorNo:[],totalPrice:"",
                    error:"موجودی کافی نیست"})
                }
                status = "quote"
                statusItem= "quote"
            }
            //const services = await cartService.findOne({cartId:ObjectID(cartItem._id)})
            
            const { _id: _, ...newObj } = cartItem;
            //return(newObj)
            const serviceData = cartItem.service&&cartItem.service.toObject()
            //return({...serviceData})
            var itemQuery = {...newObj,faktorNo:faktorNo,
                status:status,cartDetail,
                cName:userData.username,phone:userData.phone}
            const itemAdded = await faktorItems.create(itemQuery)
            serviceData&&await faktorService.create({...serviceData,faktorItemId:itemAdded._id})
            await CreateFaktorLog(userId,faktorNo,"regOrder",statusItem,"","",newObj)
            await CreateNotif("ثبت سفارش",userData._id,"order",
                "print/"+faktorNo,"order","",faktorNo
            )
            await cartService.deleteOne({cartId:ObjectID(cartItem._id)})
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
        await cart.deleteMany({userId:userId})
        await CartDataSchema.deleteOne({userId:userId})
        
        0&&userData.phone&&await SendSMS(userData.phone,"sabt",userData.username,faktorNo)
        const cartResult = await CalcCart(userId,0)
            const faktors = await ListFaktor(userId,'')
            return({...cartResult,...faktors,faktorNo,message:"سرویس ثبت شد"})
            //return
        return({faktorNo:faktorNo,totalPrice:totalPrice,fullPrice:fullPrice,
            message:"سفارش ثبت شد"})
}

module.exports =CartToFaktor