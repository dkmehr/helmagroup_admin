const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
var ObjectID = require('mongodb').ObjectID;
const auth = require("../middleware/auth");
const logger = require('../middleware/logger');
const productSchema = require('../models/product/products');
const productcounts = require('../models/product/productCount');
const category = require('../models/product/category');
const cart = require('../models/product/cart');
const qCart = require('../models/product/quickCart');
const CartServiceSchema= require('../models/product/cartService');
const FaktorSchema = require('../models/product/faktor');
const customerSchema = require('../models/auth/customers');
const sepidarPOST = require('../middleware/SepidarPost');
const productCount = require('../models/product/productCount');
const cartLog = require('../models/product/cartLog');
const users = require('../models/auth/users');
const quickCart = require('../models/product/quickCart');
const bankAccounts = require('../models/product/bankAccounts');
const sepidarFetch = require('../middleware/Sepidar');
const products = require('../models/product/products');
const tasks = require('../models/crm/tasks');
const profiles = require('../models/auth/ProfileAccess');
const CreateTask = require('../middleware/CreateTask');
const NewCode = require('../middleware/NewCode');
const customers = require('../models/auth/customers');
const faktorItems = require('../models/product/faktorItems');
const faktor = require('../models/product/faktor');
const NormalNumber = require('../middleware/NormalNumber');
const RegisterFaktorItem = require('../middleware/RegisterFaktorItem');
const GetTahHesab = require('../middleware/GetTahHesab');
const CreateFaktorLog = require('../middleware/CreateFaktorLog');
const SendSMS = require('../middleware/Calc/SendSMS');
const FindStatus = require('../middleware/Calc/FindStatus');
const FindDiscount = require('../middleware/Calc/FindDiscount');
const FindQuery = require('../middleware/Calc/FindQuery');
const CalcFaktorData = require('../middleware/CalcFaktorData');
const Services = require('../models/product/Services');
const SortFilter = require('../middleware/Calc/SortFilters');
const FindCount = require('../middleware/Calc/FindCount');
const CreateNotif = require('../middleware/CreateNotif');
const crmlist = require('../models/crm/crmlist');
const CartToFaktor = require('../middleware/Calc/CartToFaktor');
const ListFaktor = require('../middleware/Calc/ListFaktor');
const UpdateCart = require('../middleware/Calc/UpdateCart');
const SearchPhrase = require('../middleware/Functions/SearchPhrase');
const cartData = require('../models/product/cartData');
const quote = require('../models/product/quote');
const CreateQuote = require('../middleware/CreateQuote');
const CalcQuote = require('../middleware/CalcQuote');
const UpdateQuote = require('../middleware/Calc/UpdateQuote');
const quoteData = require('../models/product/quoteData');
const CartToQuote = require('../middleware/Calc/CartToQuote');
const {TaxRate} = process.env

router.post('/cart',auth, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const data=req.body
    try{ 
        const cartDetails = await CalcQuote(userId,0,req.headers['userid'])

        const faktors = await ListFaktor(userId,req.headers['userid'],data)
        res.json({...cartDetails,...faktors})
    }
    catch(error){ 
        res.status(500).json({message: error.message})
    }
})

router.post('/add-cart',auth,jsonParser, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const userData = await customerSchema.findOne({_id:ObjectID(userId)})
    if(!userData){
        res.status(400).json({error:"کاربر وارد نشده است"})
        return
    }
    if(!req.body.sku){
        res.status(400).json({error:"محصول وارد نشده است"})
        return
    }
    const data={
        userId:userId,
        sku:req.body.sku,
        //filters:req.body.filters,
        count:req.body.count,
        date:req.body.date?req.body.date:Date.now(),
        progressDate:Date.now()
    }
    try{
        var FindProductData = await products.findOne({sku:data.sku})//await FindProduct(data)
        if(!FindProductData){
            res.status(400).json({error:"کد با فیلترها مطابقت ندارد"})
            return
        }
        //data.sku = FindProductData.sku
        const userData = await users.findOne({_id:req.headers['userid']})
        const cartData = await quote.find({userId:userId})
        
        const cartItems = await CreateQuote(cartData,data.sku,userId,data.count)
        if(cartItems.error){
            res.status(400).json({error:cartItems.error})
            return
        } 
        else{
            const cart = await CalcQuote(userId,0,req.headers['userid'])
            const faktors = await ListFaktor(userId,req.headers['userid'],data)
            res.json({...cart,...faktors,message:"آیتم اضافه شد"})
            return
        } 
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/update-cart',auth,jsonParser, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const id=req.body.id

    const data={
        userId:userId,
        count:req.body.count,
        sku:req.body.sku,
        description	:req.body.description,
        discount:req.body.discount,
        progressDate:Date.now()
    }
    try{
        if(id){
            const updateStatus = await UpdateQuote(id,data.count,data.unitPrice,data.discount, isQuote)
            if(updateStatus.error){
                res.status(400).json({error:updateStatus.error,
                    message:updateStatus.error
                })
                return
            } 
            return res.json({message:"ویرایش شد"})
        }
        const cartData = await quote.find({userId:userId})
        const cartItems = await CreateQuote(cartData,data.sku,userId,data.count,data.discount)
        if(cartItems.error){
            res.status(400).json({error:cartItems.error})
            return
        } 
        else{
            const cart = await CalcQuote(userId,0,req.headers['userid'])
            const faktors = await ListFaktor(userId,req.headers['userid'],data)
            res.json({...cart,...faktors,message:"آیتم اضافه شد"})
            return
        } 
        
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/remove-cart',auth,jsonParser, async (req,res)=>{
    const id=req.body.id
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    if(!id){
        res.status(400).json({error:"ردیف وارد نشده است"})
        return
    }
    const data={}
    try{
        if(id)await quote.deleteOne({userId:userId,_id:ObjectID(id)})
        const cartDetail = await CalcQuote(userId,0,req.headers['userid'])
        const faktors = await ListFaktor(userId,req.headers['userid'],data)
        res.json({...cartDetail,...faktors,message:"آیتم حذف شد"})
        return
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/delete-cart',auth,jsonParser, async (req,res)=>{    const id=req.body.id
    const userId =req.headers['userid']
    try{
        await quote.deleteMany({userId:userId})
        
        const cartDetail = await CalcQuote(userId,0,req.headers['userid'])
        const faktors = await ListFaktor(userId,req.headers['userid'],data)
        res.json({...cartDetail,...faktors,message:"سبد خالی شد"})
        return
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/add-service-cart',auth,jsonParser, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const userData = await customerSchema.findOne({_id:ObjectID(userId)})
    const cartId = req.body.cartId
    if(!userData){
        res.status(400).json({error:"کاربر وارد نشده است"})
        return
    }
    if(!req.body.hesabfa){
        res.status(400).json({error:"محصول وارد نشده است"})
        return
    }
    const data=req.body
    try{
        const hesabfa = data.hesabfa
        const serviceData = await Services.findOne({hesabfa:hesabfa})
        if(!serviceData){
            return res.status(400).json({error:"سفارش انتخاب شده مجاز نیست"})
        }
        data.title = serviceData.title
        data.unitPrice = serviceData.price
        const cartData = await CartServiceSchema.findOne({userId:userId,cartId:cartId})
        if(cartData){
            res.status(400).json({error:"سرویس انتخاب شده است"})
            return
        } 
        else{
            const cart = await CartServiceSchema.create(data)
            
            res.json({...cart,message:"آیتم اضافه شد"})
            return
        } 
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/remove-service-cart',auth,jsonParser, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const userData = await customerSchema.findOne({_id:ObjectID(userId)})
    if(!userData){
        res.status(400).json({error:"کاربر وارد نشده است"})
        return
    }
    const cartId=req.body.cartId
    if(!req.body.cartId){
        res.status(400).json({error:"اطلاعات کارت وارد نشده است"})
        return
    }
    try{
        
        const cartData = await CartServiceSchema.deleteOne({_id:ObjectID(cartId)})
        
            res.json({cartData,message:"آیتم حذف شد"})
            return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/cart-to-faktor',auth,jsonParser, async (req,res)=>{
    const userId =req.headers['userid']
    //const serviceList = req.body.serviceList

    try{
        const userData = await customers.findOne({_id:userId})
        const cartInfo = await quoteData.findOne({userId:userId})
        if(!userData){
            return res.status(400).json({error:"کاربر پیدا نشد"})
        }
        const userCode = userData.phone&&userData.phone.substr(userData.phone.length - 4)
        const faktorNo = await NewCode("f"+userCode)
        const cartDetail = await CalcQuote(userId,0,req.headers['userid'])
        
        var totalPrice = 0
        var totalCount = 0
        if(!cartDetail.cart||!cartDetail.cart.length){
            res.status(400).json({error:"سبد خرید خالی است"})
            return
        }
        const cartData = cartDetail.cartDetail
        totalPrice=cartData.cartPrice
        totalCount = cartData.cartCount
        const transport = cartData.transportMethod
        var status = "quote"
        for(var i=0;i<(cartDetail.cart&&cartDetail.cart.length);i++){
            var cartItem = cartDetail.cart[i]
            var statusItem = "quote"
            const { _id: _, ...newObj } = cartItem;
            await faktorItems.create({...newObj,faktorNo:faktorNo,
                status:statusItem,cartDetail,
                cName:userData.username,phone:userData.phone})
            await CreateFaktorLog(userId,faktorNo,"regQuote",statusItem,"","",newObj)
            await CreateNotif("ثبت پیش فاکتور",userData._id,"quote",
                "print/"+faktorNo,"order","",faktorNo
            )
        }
        const faktorData = {
            faktorNo:faktorNo,
            transportId:transport&&transport.transportId,
            transportName:transport&&transport.transportName,
            userId:userId, 
            initDate:Date.now(),
            progressDate:Date.now(),
            status:status,
            isActive:true, isEdit:false,
            totalPrice:NormalNumber(totalPrice),
            transportPrice:transport&&transport.transportPrice,
            totalCount:totalCount,
            description:cartDescription,
            discount:cartDiscount,
            cName:userData.cName?(userData.cName + " "+ userData.sName):userData.username,
            phone:userData.phone
        }
        await faktor.create(faktorData)
        await quote.deleteMany({userId:userId})
        
        userData.phone&&await SendSMS(userData.phone,"sabt",userData.username,faktorNo)
        res.json({faktorNo:faktorNo,message:"سفارش ثبت شد"})
        return
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        return res.status(500).json({message: error.message})
    }
})
router.post('/cart-to-faktor',auth,jsonParser, async (req,res)=>{
    const data={}
    const userId = req.body.userId?req.body.userId:req.headers['userid']
    const inPerson = req.body.inPerson
    const userData = await customers.findOne({_id:ObjectID(userId)})
    const faktorData = await CartToQuote(userData,'',req.headers['userid'],0,inPerson)
    return res.json(faktorData)
})

module.exports = router;