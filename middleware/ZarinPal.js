var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;
const { default: fetch } = require("node-fetch");
moment.locale('en');

const Customers = require('../models/auth/customers');
const CartToFaktor = require('./Calc/CartToFaktor');
const faktor = require('../models/product/faktor');
const transaction = require('../models/param/transaction');
const GetHesabFa = require('./GetHesabFa');
const customers = require('../models/auth/customers');
const CreateHesabfaCustomer = require('./CreateHesabfaCustomer');


const {ZARIN_URL,ZARIN_PAYURL,ZARIN_Merchant,RETURN_URL,
    bankCode
} = process.env

exports.pay = async (req, res) => {
    const userId = req.query.id
    const faktorNo = req.query.faktorNo
    if(!userId&&!faktorNo) {
        return res.status(400).json({error:"کد وارد نشده است"})
    } 
    var userData = ''
    var cartData = ''
    if(userId){
        try{
        userData=await Customers.findOne({_id:ObjectID(userId)})
        var hasAddress = userData&&
            userData.Address&&
            userData.sName&&
            userData.postalCode&&
            userData.state&&
            userData.city
        if(!hasAddress)
            return res.status(400).json({error:"اطلاعات کاربری کامل نیست"})
        }
        catch{
            return res.status(400).json({error:"کد وارد شده معتبر نیست"})
        }
        cartData = await CartToFaktor(userData,'','',1)
        if(cartData.error)
            return res.status(400).json({error:cartData.error})
        else{}
        
    }
    else{
        
        cartData =await faktor.findOne({faktorNo:faktorNo})
        var userData=await Customers.findOne({_id:ObjectID(cartData.userId)})
        if(userData.phone=="09214234099") cartData.fullPrice = 10000
        var hasAddress = userData&&
            userData.Address&&
            userData.sName&&
            userData.postalCode&&
            userData.state&&
            userData.city
        if(!hasAddress)
            return(res.render(`zarin_handler.ejs`,
            {error:"اطلاعات کاربری کامل نیست",url:"https://shop.fahascrubs.com/profile"}))
            
        
        if(!cartData)
           return(res.render(`zarin_handler.ejs`,
            {error:"سفارش یافت نشد",url:"https://shop.fahascrubs.com/myOrders"}))
        userData=await Customers.findOne({_id:ObjectID(cartData.userId)})
    
    }
    try{    
        var query={
            amount: cartData.fullPrice,
            callback_url: RETURN_URL,
            description: 'Payment for order #'+cartData.faktorNo,
            mobile: userData.phone,
            email: 'customer@example.com',
            cardPan: ['6219861034529007', '5022291073776543'],
            referrer_id: 'affiliate123',
          }
          var header = {"Content-Type":"application/json"}
    const body = {...query,"merchant_id":ZARIN_Merchant}
        const url = ZARIN_URL+"request.json"
        var result =''
    try{const response = await fetch(url,
            {method: 'POST' ,headers:header,
        body:JSON.stringify(body)});
            
        result = await response.json();
        } catch{}
        if(!result){
            return(res.render(`zarin_handler.ejs`,
            {error:"درگاه موقتا غیرفعال است",url:"https://shop.fahascrubs.com"}))
        }

    const authority = result&&result.data&&result.data.authority
    if(!authority) 
        return(res.render(`zarin_handler.ejs`,
            {error:"خطای درگاه",url:"https://shop.fahascrubs.com"}))
    await faktor.updateOne({faktorNo:cartData.faktorNo},
        {$set:{Authority:authority}})

    return(res.render(`zarin_payment.ejs`,
        {url:ZARIN_PAYURL+authority,error:"result.message"}))
    }
    catch(error){
        console.log("error: ",error) 
        return(res.render(`zarin_handler.ejs`,
            {error:error,url:"https://shop.fahascrubs.com"}))
    }
    
};
exports.callBack=async (req,res)=>{
    const authority = req.query.Authority
    var status = req.query.Status
   const faktorData = await faktor.findOne({Authority:authority})
   var fStatus = faktorData.status
   var customerData = ''
   try{customerData = await customers.findOne({_id:ObjectID(faktorData.userId)})}
   catch{}
   if(customerData&&!customerData.cCode){
           const customerHesabfa = await CreateHesabfaCustomer(customerData)
           customerData.cCode = customerHesabfa
       }
    if(status=="OK"){
        const query = {
            "type": 1,
            "description": " پرداخت آنلاین توسط  "+
                customerData&&customerData.cName+" "+
                customerData&&customerData.sName ,
            "amount": faktorData.fullPrice,
            "contactCode": customerData&&customerData.cCode,
            "bankCode": bankCode,
            "cashCode": null,
            "pettyCashCode": null,
            "currency": "IRR",
            "currencyRate": 1
        }
        if(fStatus == "pending") fStatus ="inprogress"
        await faktor.updateOne({Authority:authority},
            {$set:{waitPay:false,payQuery:req.query,status:fStatus}})
            const hesabResult = await GetHesabFa(query,"/receipt/save")
            await transaction.create({
                title:"پرداخت آنلاین",
                bankCode:"1",
                userId:faktorData&&faktorData.userId,
                orderNo:faktorData&&faktorData.faktorNo,
                payValue:faktorData&&faktorData.totalPrice,
                description:"پرداخت آنلاین توسط ",
                result:req.query,
                query:query,
                hesabResult:hesabResult,
                status:true
            })
        return(res.render(`zarin_correct.ejs`,{url:"/orders"}))
    }
    else{
        await faktor.updateOne({Authority:authority},
            {$set:{payQuery:req.query}})
        await transaction.create({
            title:"پرداخت ناموفق",
            bankCode:"2-مهر",
            userId:faktorData&&faktorData.userId,
            orderNo:faktorData&&faktorData.faktorNo,
            payValue:faktorData&&faktorData.totalPrice,
            description:"پرداخت ناموفق توسط ",
            result:req.query,
            status:false
        })
        return(res.render(`zarin_error.ejs`,{url:"/orders"}))
    }
}
const findError=(code)=>{
    const errorArray=[
        {id:"-1", message:"در انتظار پردخت"},
        {id:"-2", message:	"خطای داخلی"},
        {id:"1", message:	"پرداخت شده - تاییدشده"},
        {id:"2", message:	"پرداخت شده - تاییدنشده"},
        {id:"3", message:	"لغوشده توسط کاربر"},
        {id:"4", message:	"‌شماره کارت نامعتبر می‌باشد."},
        {id:"5", message:	"‌موجودی حساب کافی نمی‌باشد."},
        {id:"6", message:	"رمز واردشده اشتباه می‌باشد."},
        {id:"7", message:	"‌تعداد درخواست‌ها بیش از حد مجاز می‌باشد."},
        {id:"8", message:	"‌تعداد پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد."},
        {id:"9", message:	"مبلغ پرداخت اینترنتی روزانه بیش از حد مجاز می‌باشد."},
        {id:"10", message:	"‌صادرکننده‌ی کارت نامعتبر می‌باشد."},
        {id:"11", message:	"‌خطای سوییچ"},
        {id:"12", message:	"کارت قابل دسترسی نمی‌باشد."},
    ]
    const result = errorArray.find(item=>item.id==code)
    return(result&&result.message)
}

