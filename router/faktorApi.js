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
const brand = require('../models/product/brand');
const FindCurrentCart = require('../middleware/CurrentCart');
const OrderToTask = require('../middleware/OrderToTask');
const IsToday = require('../middleware/IsToday');
const NewQuote = require('../middleware/NewQuote');
const CreateCart = require('../middleware/CreateCart');
const CalcCart = require('../middleware/CalcCart');
const faktorItems = require('../models/product/faktorItems');
const faktor = require('../models/product/faktor');
const slider = require('../models/main/slider');
const price = require('../models/price');
const CalcPrice = require('../middleware/CalcPrice');
const FindPrice = require('../middleware/FindPrice');
const CalcCartRecalc = require('../middleware/CalcCartRecalc');
const tax = require('../models/param/tax');
const RegisterFaktor = require('../middleware/RegisterFaktor');
const prepaid = require('../models/param/prepaid');
const NormalNumber = require('../middleware/NormalNumber');
const RegisterFaktorItem = require('../middleware/RegisterFaktorItem');
const GetTahHesab = require('../middleware/GetTahHesab');
const CreateFaktorLog = require('../middleware/CreateFaktorLog');
const CreateCartPurchase = require('../middleware/CreateCartPurchase');
const CalcPurchase = require('../middleware/CalcPurchase');
const ClientStatus = require('../middleware/ClientStatus');
const banks = require('../models/param/banks');
const SetTahHesabItem = require('../middleware/SetTahHesabItem');
const SetTransaction = require('../middleware/SetTransaction');
const CheckAccess = require('../middleware/CheckAccess');
const transaction = require('../models/param/transaction');
const CalcFaktor = require('../middleware/Calc/CalcFaktor');
const FindColor = require('../middleware/Calc/FindColor');
const FindSimilar = require('../middleware/Calc/FindSimilar');
const FindProduct = require('../middleware/Calc/FindProduct');
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
const faktorService = require('../models/product/faktorService');
const CalcFaktorTotal = require('../middleware/CalcFaktorTotal');
const ReCalcFaktorData = require('../middleware/ReCalcFaktorData');
const ReCalcFaktorItemData = require('../middleware/ReCalcFaktorItemData');
const AddServiceToCart = require('../middleware/Calc/AddServiceToCart');
const {TaxRate} = process.env
router.post('/products', async (req,res)=>{
    try{
        const allProducts = await productSchema.find()

        //logger.warn("main done")
        res.json({products:allProducts})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/list-category', async (req,res)=>{
    var search = req.body.search
    try{
        var catList = await category.aggregate([
            {$match:{active:true}},
            {$match:search?{$or:[
                {catCode:{$regex: search, $options : 'i'}},
                {title:{$regex: search, $options : 'i'}}
            ]}:{}}]) 
        res.json({data:catList,
            size:catList.length
        })
    }
    catch(error){
        res.status(500).json({error:true,message: error.message})
    }
})

router.post('/list-product', async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    const search = req.body.search
    const weight=req.body.weight
    const categoryFilter=req.body.category
    const isMaster = req.body.isMaster?req.body.isMaster:true
    const isMojood = req.body.isMojood?req.body.isMojood:false
    try{
   
        const products = await productSchema.aggregate([
            {$match:search?{$or:[
                {sku:{$regex: search, $options : 'i'}},
                {title:{$regex: search, $options : 'i'}}
            ]}:{}}, 
            { $match:categoryFilter?{categories:{$elemMatch:
                {catCode:categoryFilter.toString()}}}:{}},
            /*{$match:{imageUrl:{$exists:true}}},
            {$match:isMojood?{isMojood:true}:{}}*/
            {$match:isMaster?{isMaster:true}:{}},
            {$sort:{title:1}}
        ])
        const priceRaw = await FindPrice()
        const productList = products.slice(offset,
            (parseInt(offset)+parseInt(pageSize)))  
            
        var TAX = await tax.findOne().sort({date:-1})
        for(var i=0;i<productList.length;i++){
            const fullPrice =  CalcPrice(productList[i],priceRaw,TAX&&TAX.percent)
            productList[i].price = fullPrice.price?fullPrice.price:"12300000"
        }
        const categoryList = await category.find({imageUrl:{$exists:true}})
        res.json({data:productList,type:[],
            size:products.length,success:true,
            categoryList, unitPrice:priceRaw
        })

    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/list-product-sale', async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    const search = req.body.search
    const weight=req.body.weight
    const categoryFilter=req.body.category
    const isMaster = req.body.isMaster?req.body.isMaster:true
    const isMojood = req.body.isMojood?req.body.isMojood:true
    const isReserve = req.body.isReserve?req.body.isReserve:false
    try{
   
        const products = await productSchema.aggregate([
            {$match:search?{$or:[
                {sku:{$regex: search, $options : 'i'}},
                {title:{$regex: search, $options : 'i'}}
            ]}:{}},
            { $match:categoryFilter?{categories:{$elemMatch:
                {catCode:categoryFilter.toString()}}}:{}},
            {$match:isMojood?{isMojood:true}:{}},
            {$match:isReserve?{isReserve:true}:{}}
        ])
        const priceRaw = await FindPrice()
        const productList = products.slice(offset,
            (parseInt(offset)+parseInt(pageSize)))  
            
        var TAX = await tax.findOne().sort({date:-1})
        for(var i=0;i<productList.length;i++){
            const fullPrice =  CalcPrice(productList[i],priceRaw,TAX&&TAX.percent)
            productList[i].price = (fullPrice&&fullPrice.price)?fullPrice.price:"12300000"
            productList[i].priceDetail = fullPrice&&fullPrice.priceDetail
        }
        const categoryList = await category.find({imageUrl:{$exists:true}})
        res.json({data:productList,type:[],hasChild:1,
            size:products.length,success:true,
            categoryList, unitPrice:priceRaw,
            subCategoryList	:[]
        })

    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/fetch-product', async (req,res)=>{
    const sku = req.body.sku
    const userId = req.headers['userid']
    const filterBody = req.body.filters
    try{
        var productData = await productSchema.findOne({sku:sku}).lean()
        if(!productData||!productData.isMaster){
            res.status(400).json({error:"محصول اصلی نیست"})
            return
        } 
        var filters = new Object()
        const userData = await customers.findOne({_id:ObjectID(userId)})
        if(!userData){
            return(res.json({error:"کاربر پیدا نشد"}))
        }
        const business = userData.business
        const myDiscount = await FindDiscount(productData,userId)
        var filterQuery = await FindQuery(filterBody)
        var productList = await productSchema.find({masterSku:sku})
        .find(filterQuery?filterQuery:{}).lean()
        for(var f=0;f<productList.length;f++){
            const stock = !business&&await FindCount(productList[f].sku,1)
            if(!business&&stock<0) continue
            if(productList[f].filters){
                var filterData = productList[f].filters
                for (var prop in filterData) {
                    if(prop == "undefined"||!filterData[prop])continue
                    if(!filters[prop])
                        filters[prop]=[]
                    var outData = await FindColor(filterData[prop])
                    if(!FindSimilar(filters&&filters[prop],outData))
                        filters[prop].push(outData)
                }
            }
        }
        var sortFilters = SortFilter(filters)
        res.json({mainProduct:productData,productData:productList&&productList[0],
            filters,sortFilters,myDiscount})

    } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/list-filters', async (req,res)=>{
    try{
        const brandData = await brand.find()
        const catData = await category.find({parent:{$exists:false}})
        for(var i =0;i<catData.length;i++){
            var subCat = await category.find(
                {"parent._id":(catData[i]._id).toString()})
            catData[i].children = subCat
        } 
        //logger.warn("main done")
        res.json({brands:brandData,cats:catData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/find-products',auth, async (req,res)=>{
    const search = req.body.search
        const userData = await users.findOne({_id:req.headers['userid']})
        const stockId = userData.StockId?userData.StockId:"13"
        var filter =''
        //if(userData.group === "bazaryab") filter = "fs"
        const searchPhrase = SearchPhrase(search)
        const searchProducts = await productSchema.
        aggregate([{$match:
            search?searchPhrase:{}
        },
        {$lookup:{ 
            from : "productprices", 
            localField: "ItemID", 
            foreignField: "ItemID", 
            as : "priceData"
        }},
        {$lookup:{
            from : "productcounts", 
            localField: "ItemID", 
            foreignField: "ItemID", 
            as : "countData"
        }}])
        try{

        res.json({products:searchProducts})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/calc-count',auth, async (req,res)=>{
    const userData = await users.findOne({_id:req.headers['userid']})
    const stockId = userData.StockId?userData.StockId:"13"
    const sku = req.body.sku
    if(!sku){
        res.status(400).json({message:"not found"})
        return
    }
    try{ 
    const searchProducts = await productSchema.aggregate([
        {$match:{sku:sku}},
        {$lookup:{
            from : "productprices", 
            localField: "ItemID", 
            foreignField: "ItemID", 
            as : "priceData"
        }},
        {$lookup:{
            from : "productcounts", 
            localField: "ItemID", 
            foreignField: "ItemID", 
            as : "countData"
        }}])
        const cartList = await tasks.find({taskStep:{$nin:['archive']}})
        var currentCart = await FindCurrentCart(cartList.map(item=>item.orderNo))
        console.log(stockId)
        const qCartList = await qCart.find(stockId?{stockId:stockId}:{})
        for(var i=0;i<searchProducts.length;i++){
            var count = searchProducts[i].countData.find(item=>(item.Stock==stockId))
            var count3 = searchProducts[i].countData.find(item=>(item.Stock=="9"))
            var desc = '' 
            count = count?count:0 
            count3 = count3?count3:0
            var cartCount = findCartCount(searchProducts[i].sku,currentCart.concat(qCartList),stockId)
            //console.log(cartCount)
            const storeCount =count?parseInt(count.quantity):0
            const orderCount =parseInt(cartCount)
            if(count||count3){ 
                if(count)
                    count.quantity = storeCount-orderCount
                else if(count3)
                    count3.quantity = count3.quantity-orderCount 
                res.json({count,storeCount,orderCount,count3:count3?count3.quantity:0,
                    perBox:searchProducts[i].perBox?searchProducts[i].perBox:0})
                return
            }
            else{
                res.json({count:0,storeCount,orderCount})
                return
            }
        }
            
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
const findCartCount=(item,cart)=>{
    var cartCount =0
    for(var i=0;i<cart.length;i++){
        var cartItem =cart[i].cartItems 
        for(var c=0;c<(cartItem&&cartItem.length);c++){
            if(cartItem[c].sku === item){
                cartCount=parseInt(cartCount)+parseInt(cartItem[c].count)
            }
        }
    }
    return(cartCount)
    
}
router.post('/update-product',jsonParser,auth, async (req,res)=>{
    const data={
        title:req.body.title,
        sku:req.body.sku,
        date:Date.now()
    }
    try{
        var status = "";
        const searchProduct = await productSchema.findOne({sku:data.sku})
        if(!searchProduct){
            await productSchema.create(data)
            status = "new product"
        } 
        else{
            await productSchema.updateOne(
                {sku:data.sku},{$set:data})
            status = "update product"
        }
        const allProducts = await productSchema.find()
        //logger.warn("main done")
        res.json({products:allProducts,status:status})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/categories', async (req,res)=>{
    try{
        const allCategories = await category.find()

        //logger.warn("main done")
        res.json({categories:allCategories})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/update-category',jsonParser,auth, async (req,res)=>{
    const data={
        title:req.body.title,
        parent:req.body.parent,
        body:req.body.body,
        date:Date.now()
    }
    try{
        var status = "";
        const searchCategory = await category.findOne({catCode:req.body.catCode})
        if(!searchCategory){
            await category.create(data)
            status = "new category"
        }
        else{
            await category.updateOne(
                {catCode:req.body.catCode},{$set:data})
            status = "update category"
        }
        const allCategory = await category.find()
        res.json({categories:allCategory,status:status})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
 
router.post('/recalc-cart',auth, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const userData = await customers.findOne({_id:ObjectID(userId)})
    try{ 
        await CalcCartRecalc(userId)
        const clientRemain = userData&&await GetTahHesab(
            {"getmandehesabbycode":[userData.cCode]}
        )
        const clientStatus = ClientStatus(clientRemain)
        const cartDetails = await CalcCart(userId,clientStatus.remain,req.headers['userid'])
        const bankList = await banks.find()
        res.json({message:"سبد بروز شد",...cartDetails,
            clientStatus,bankList})
    }
    catch(error){ 
        res.status(500).json({message: error.message})
    }
})

router.get('/get-cart',auth, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    try{ 
        const cartDetails = await CalcCart(userId,0,req.headers['userid'])
        res.json({...cartDetails})
    }
    catch(error){ 
        res.status(500).json({message: error.message})
    }
})

router.post('/cart',auth, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const data=req.body
    try{ 
        const cartDetails = await CalcCart(userId,0,req.headers['userid'])

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
    const isQuote = req.body.isQuote
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
    const service = req.body.service
    try{
        var FindProductData = await products.findOne({sku:data.sku})//await FindProduct(data)
        if(!FindProductData){
            res.status(400).json({error:"کد با فیلترها مطابقت ندارد"})
            return
        }
        //data.sku = FindProductData.sku
        const userData = await users.findOne({_id:req.headers['userid']})
        const cartData = await cart.find({userId:userId})
        
        const cartItems = await CreateCart(cartData,data.sku,userId,data.count,'',isQuote,service)
        if(cartItems.error){
            res.status(400).json({error:cartItems.error})
            return
        } 
        else{
            if(service){
                const newCartId =cartItems.cartCreateDetail&&cartItems.cartCreateDetail._id
                
                const serviceResult = await AddServiceToCart(service,userId,newCartId.toString())
                if(serviceResult.error){
                    return res.status(400).json(serviceResult)
                }
                /*else
                    return(res.json(serviceResult))*/
            }

            const cart = await CalcCart(userId,0,req.headers['userid'])
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
    const isQuote = req.body.isQuote
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
            const updateStatus = await UpdateCart(id,data.count,data.unitPrice,data.discount, isQuote)
            if(updateStatus.error){
                res.status(400).json({error:updateStatus.error,
                    message:updateStatus.error
                })
                return
            } 
            return res.json({message:"ویرایش شد"})
        }
        const cartData = await cart.find({userId:userId})
        const cartItems = await CreateCart(cartData,data.sku,userId,data.count,data.discount,isQuote)
        if(cartItems.error){
            res.status(400).json({error:cartItems.error})
            return
        } 
        else{
            const cart = await CalcCart(userId,0,req.headers['userid'])
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
        if(id)await cart.deleteOne({userId:userId,_id:ObjectID(id)})
        const cartDetail = await CalcCart(userId,0,req.headers['userid'])
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
        await cart.deleteMany({userId:userId})
        
        const cartDetail = await CalcCart(userId,0,req.headers['userid'])
        const faktors = await ListFaktor(userId,req.headers['userid'],data)
        res.json({...cartDetail,...faktors,message:"سبد خالی شد"})
        return
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/list-service-cart',auth,jsonParser, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const userData = await customerSchema.findOne({_id:ObjectID(userId)})
    
    if(!userData){
        res.status(400).json({error:"کاربر وارد نشده است"})
        return
    }
    
    try{
        
        const cartData = await CartServiceSchema.find({userId:userId})
        res.json({data:cartData,message:"لیست آیتم ها"})
         
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
        await CartServiceSchema.deleteOne({userId:userId,cartId:cartId})
        return res.json({message:"خدمت حذف شد"})
    }
    const data=req.body
    try{
        const serviceResult = await AddServiceToCart(data,userId,cartId)
        if(serviceResult.error){
            return res.status(400).json(serviceResult)
        }
        else
            return(res.json(serviceResult))
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
router.get('/sendSMS',jsonParser, async (req,res)=>{
    
    const result = await SendSMS("09214234099","sabt","سید_میلاد","z123321")
    res.json(result)
    return
})
router.get('/cart-to-faktor',auth,jsonParser, async (req,res)=>{
    const userId =req.headers['userid']
    //const serviceList = req.body.serviceList

    try{
        const userData = await customers.findOne({_id:userId})
        const cartInfo = await cartData.findOne({userId:userId})
        if(!userData){
            return res.status(400).json({error:"کاربر پیدا نشد"})
        }
        const userCode = userData.phone&&userData.phone.substr(userData.phone.length - 4)
        const faktorNo = await NewCode("f"+userCode)
        const cartDetail = await CalcCart(userId,0,req.headers['userid'])
        
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
        var status = "inprogress"
        for(var i=0;i<(cartDetail.cart&&cartDetail.cart.length);i++){
            var cartItem = cartDetail.cart[i]
            var statusItem = "inprogress"
            const productDetail = 0&&await products.findOne({sku:cartItem.sku})
            const stock = await FindCount(cartItem.sku,cartItem.count)
            if(stock<0) {
                if(!userData.business){
                    return(res.status(400).json({error:"تعداد درخواستی موجود نیست"}))
                }
                status = "quote"
                statusItem= "quote"
            }
            const { _id: _, ...newObj } = cartItem;
            await faktorItems.create({...newObj,faktorNo:faktorNo,
                status:statusItem,cartDetail,
                cName:userData.username,phone:userData.phone})
            await CreateFaktorLog(userId,faktorNo,"regOrder",statusItem,"","",newObj)
            await CreateNotif("ثبت سفارش",userData._id,"order",
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
            servicePrice:servicePrice,
            totalCount:totalCount,
            description:cartDescription,
            discount:cartDiscount,
            cName:userData.cName?(userData.cName + " "+ userData.sName):userData.username,
            phone:userData.phone
        }
        await faktor.create(faktorData)
        await cart.deleteMany({userId:userId})
        
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
    const isQuote = req.body.isQuote
    const userData = await customers.findOne({_id:ObjectID(userId)})
    
    const faktorData = await CartToFaktor(userData,'',req.headers['userid'],0,inPerson,isQuote)
    return res.json(faktorData)
    
})
router.post('/cart-to-faktor-from',auth,jsonParser, async (req,res)=>{
    const manageId =req.headers['userid']
    const userId = req.body.userFrom
    try{
        const manageData = await customers.findOne({_id:manageId})
        const userData = userId&&await customers.findOne({_id:userId})
        
        if(!userData||!manageData){
            res.status(400).json({error:"کاربر پیدا نشد"})
            return
        }
        if(manageData.access=="customer"){
            res.status(400).json({error:"دسترسی ندارید"})
            return
        }
        const userCode = userData.phone&&userData.phone.substr(userData.phone.length - 4)
        const faktorNo = await NewCode("m"+userCode)
        const cartDetail = await CalcCart(manageId,0,req.headers['userid'])
        
        var totalPrice = 0
        var totalCount = 0
        if(!cartDetail.cart||!cartDetail.cart.length){
            res.status(400).json({error:"سبد خرید خالی است"})
            return
        }
        const cartData = cartDetail.cartDetail
        totalPrice=cartData.cartPrice
        totalCount = cartData.cartCount
        var status = "inprogress"
        for(var i=0;i<(cartDetail.cart&&cartDetail.cart.length);i++){
            var cartItem = cartDetail.cart[i]
            var statusItem = "pay"
            const productDetail = 0&&await products.findOne({sku:cartItem.sku})
            const stock = await FindCount(cartItem.sku,cartItem.count)
            if(stock<0) {
                status = "quote"
                statusItem= "quote"
            }
            const { _id: _, ...newObj } = cartItem;
            await faktorItems.create({...newObj,faktorNo:faktorNo,
                status:status,cartDetail,
                cName:userData.username,phone:userData.phone})
            await CreateFaktorLog(userId,faktorNo,"regOrder",statusItem,"","",newObj)
            
        }
        const faktorData = {
            faktorNo:faktorNo,
            userId:userId, 
            manageId:manageId,
            initDate:Date.now(),
            progressDate:Date.now(),
            status:status,
            isActive:true, isEdit:false,
            totalPrice:NormalNumber(totalPrice),
            totalCount:totalCount,
            cName:userData.cName?(userData.cName + " "+ userData.sName):userData.username,
            mName:manageData.cName?(manageData.cName + " "+ manageData.sName):manageData.username,
            phone:userData.phone
        }
        await faktor.create(faktorData)
        await cart.deleteMany({userId:manageId})
        userData.phone&&await SendSMS(userData.phone,"sabt",userData.username,faktorNo)
        res.json({faktorNo:faktorNo,message:"سفارش ثبت شد"})
        return
        //const cartDetails = await findCartFunction(userId,req.headers['userid'])
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/faktor', async (req,res)=>{
    const offset =req.body.offset?parseInt(req.body.offset):0 
    const userId =req.body.userId?req.body.userId:req.headers['userid'];
    try{
        const userDetail = await users.findOne({_id:req.headers['userid']})
        if(!userDetail){
            res.status(500).json({error: "access deny"})
            return
        }
        const access = userDetail.access
        const faktorTotalCount = await FaktorSchema.find(
            access==="manager"?{}:{manageId:userId}).count()
        const faktorList = await FaktorSchema.aggregate
        ([ {$match:access==="manager"?{}:{manageId:userId}},
        {$lookup:{
            from : "customers", 
            localField: "customerID", 
            foreignField: "CustomerID", 
            as : "userData"
        }},
        {$lookup:{
            from : "productcounts", 
            localField: "ItemID", 
            foreignField: "ItemID", 
            as : "countData"
        }},{$sort:{"initDate":-1}},
    {$skip:offset},{$limit:10}])
        //logger.warn("main done")
        res.json({faktor:faktorList,faktorCount:faktorTotalCount})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/fetch-faktor',auth, async (req,res)=>{
    const faktorNo =req.body.faktorNo;
    try{
        const faktorData = await FetchFaktorFunc(faktorNo)
        res.json({...faktorData})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})
const FetchFaktorFunc=async(faktorNo)=>{
    const faktorData = await FaktorSchema.findOne({faktorNo:faktorNo}).lean()
    if(!faktorData){
        return({error:"سفارش پیدا نشد"})
    }
    const FaktorItems = await faktorItems.aggregate([
        {$match:{faktorNo:faktorNo}},
        {$lookup:{
            from : "products", 
            localField: "sku", 
            foreignField: "sku", 
            as : "productData"
        }},
        {$sort:{purchase:-1}}

    ])
    for(var i=0;i<FaktorItems.length;i++){
        var service = await faktorService.findOne(
            {faktorItemId:ObjectID(FaktorItems[i]._id)})
        FaktorItems[i].service = service
    }    
    
    faktorData.items = FaktorItems
    const userDetail = await customers.findOne({_id:ObjectID(faktorData.userId)})
    
    const transactions = await transaction.find({orderNo:faktorNo})
    var canEdit = 0
    var canRecieve = 0
    const faktorDetail = await CalcFaktorTotal(faktorData.userId)
    if(faktorData.status=="edit") canEdit = 1
    if(faktorData.status=="send") canRecieve = 1
    return({data:faktorData,canEdit,canRecieve,faktorDetail,
        userDetail:userDetail,transactions})
}
router.post('/fetch-faktor-item',auth, async (req,res)=>{
    const faktorItemNo =req.body.faktorItemNo;
    try{
        const FaktorItems = await faktorItems.findOne({_id:ObjectID(faktorItemNo)}).lean()
        //faktorData.items = FaktorItems
        var newPrice;
        const priceRaw = await FindPrice()
        if(FaktorItems.newSku){
            var priceDetail = FaktorItems.priceDetail
            const newItem = await products.findOne({sku:FaktorItems.newSku})
            newPrice = CalcPrice(newItem,
                priceDetail.unitPrice,priceDetail.taxValue)
            var newDetail = newPrice.priceDetail
            const remainPay = newPrice.price - NormalNumber(FaktorItems.price)
            const remainDetail = {
                unitPrice:priceDetail.unitPrice,
                lastPrice:NormalNumber(FaktorItems.price),
                lastWeight:priceDetail.weight,
                lastOjrat:priceDetail.ojratValue,
                newPrice:NormalNumber(newPrice.price),
                newWeight:newDetail.weight,
                newOjrat:newDetail.ojratValue,
                defPay :NormalNumber(remainPay)
            }
            FaktorItems.newItem = newItem
            FaktorItems.newPrice = newPrice
            FaktorItems.remainPay=NormalNumber(remainPay)
            FaktorItems.remainDetail = remainDetail

        }
        
        
        const userDetail = await customers.findOne({phone:FaktorItems.phone})
        
        res.json({data:FaktorItems,userDetail:userDetail,nowPrice:priceRaw})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})
router.post('/update-faktor-item',auth, async (req,res)=>{
    const faktorItemNo =req.body.faktorItemNo;
    const data = {
        count: req.body.count,
        discount: req.body.discount,
        unitPrice: req.body.unitPrice
    }
    try{
        const FaktorItems = await faktorItems.findOne( {_id:ObjectID(faktorItemNo)})
        
        await faktorItems.updateOne(
            {_id:ObjectID(faktorItemNo)},
        {$set:data}).lean()
        await ReCalcFaktorItemData(faktorItemNo)
        const result = await ReCalcFaktorData(FaktorItems.faktorNo)

        var canEdit = 0
        if(result.status=="edit") canEdit=1
        res.json({data:result,canEdit})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})
router.post('/remove-faktor-item',auth, async (req,res)=>{
    const faktorItemNo =req.body.faktorItemNo;
    const data = {
        count: req.body.count,
        discount: req.body.discount
    }
    try{
        const FaktorItems = await faktorItems.findOne( {_id:ObjectID(faktorItemNo)})
        
        await faktorItems.deleteOne(
            {_id:ObjectID(faktorItemNo)},
        {$set:data}).lean()
        const result = await CalcFaktorData(FaktorItems.faktorNo)

        res.json({data:result})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})

router.post('/recieve-faktor-item',auth, async (req,res)=>{
    const rSku = req.body.sku
    const rFaktorNo = req.body.faktorNo
    const faktorData = await faktorItems.findOne(
        {faktorNo:rFaktorNo,sku:rSku})
    if(!faktorData){
        res.status(400).json({error:true,message:"آیتم پیدا نشد"})
        return
    }
    if(faktorData.isRecieved){
        res.status(400).json({error:true,message:"آیتم قبلا رسید شده است"})
        return
    }
    var count = faktorData.count
    var recCount = faktorData.recieveCount?faktorData.recieveCount:0
    var query = {isRecieved:false,
        recieveDate:Date.now(),recieveCount: recCount+1}
    if(count == recCount + 1){
        query.isRecieved = true
    }
    await faktorItems.updateOne( 
        {faktorNo:rFaktorNo,sku:rSku},{$set:query})
    const faktorResult = await FetchFaktorFunc(rFaktorNo)
    res.json({...faktorResult,message:"آیتم رسید شد"})
})

router.post('/list-faktor',auth, async (req,res)=>{
    
    const data={
        userId:req.body.userId,
        search: req.body.orderNo,
        managerId : req.headers['userid'],
        pageSize:req.body.pageSize?req.body.pageSize:10,
        offset: req.body.offset?(parseInt(req.body.offset)):0,
        status : req.body.status,
        customer:req.body.customer,
        dateFrom:req.body.dateFrom,
        dateTo:req.body.dateTo
    }
    try{
        const faktorResult = await ListFaktor(data.userId,data.managerId,
            data.search,data.customer,data.offset,data.pageSize,data.dateFrom,data.dateTo)
        res.json({...faktorResult,data})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})
router.post('/list-faktor-sale',auth, async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    var manageId = req.headers['userid']
    var nowDate = new Date();
    const nowIso = nowDate.toISOString();
    const nowParse = Date.parse(nowIso);
    const now = new Date(nowParse);
    var now2 = new Date();
    var now3 = new Date();

    var userId = req.body.userId
    const data = {
        orderNo: req.body.orderNo,
        status: req.body.status,
        customer: req.body.customer,
        dateFrom:
            req.body.dateFrom ? req.body.dateFrom[0] + "/" +
                req.body.dateFrom[1] + "/" + req.body.dateFrom[2] + " " + "00:00" :
                new Date().toISOString().slice(0, 10) + " 00:00",
        dateTo:
            req.body.dateTo ? req.body.dateTo[0] + "/" +
                req.body.dateTo[1] + "/" + req.body.dateTo[2] + " 23:59" :
                new Date().toISOString().slice(0, 10) + " 23:59",
        pageSize: pageSize
    }
    const dateFromEn = new Date(now2.setDate(now.getDate() - (data.dateFrom ? data.dateFrom : 1)));
        dateFromEn.setHours(0, 0, 0, 0);
    const dateToEn = new Date(now3.setDate(now.getDate() - (data.dateTo ? data.dateTo : 0)));
        dateToEn.setHours(23, 59, 0, 0);
    try{
        const userData = manageId&&await users.findOne({_id:ObjectID(manageId)})
        if(!userData){
            res.status(400).json({error:"اطلاعات کاربری مجاز نیست"})
            return 
        }
        var access = await CheckAccess(userData)
        if(access<2){
            res.status(400).json({error:"دسترسی ندارید"})
            return 
        }
        const faktorData = await FaktorSchema.aggregate([
            { $match: data.orderNo ? { cartNo: new RegExp('.*' + data.orderNo + '.*') } : {} },
            { $match: access<6?{manageId:manageId}:{}},
            { $match: !data.orderNo ? { initDate: { $gte: new Date(data.dateFrom) } } : {} },
            { $match: !data.orderNo ? { initDate: { $lte: new Date(data.dateTo) } } : {} },
            { $sort: { "initDate": -1 } }
        ])
        const faktorList = faktorData.slice(offset,
            (parseInt(offset)+parseInt(pageSize))) 
        for(var i=0;i<faktorList.length;i++){
            var faktorNo = faktorData[i].faktorNo
            var userDetail = await customers.findOne({_id:ObjectID(faktorData[i].userId)})
            const faktorItemData = await faktorItems.find({faktorNo:faktorNo})
            faktorData[i].items = faktorItemData
            faktorData[i].rahId	=faktorNo
            faktorData[i].userDetail=userDetail
            //itemRefs.push(faktorItem)
        }
        res.json({data:faktorData,size:faktorData.length})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})

router.post('/my-faktor',auth, async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    var userId = req.headers['userid']
    try{
        const userData = await customers.findOne({_id:ObjectID(userId)})
        if(!userData){
            res.status(400).json({error:"اطلاعات کاربری مجاز نیست"})
            return 
        }
        const faktorData = 
            await FaktorSchema.aggregate([
                {$match:{userId:userId}},
                {$sort:{initDate:-1}},
            ])
        const faktorList = faktorData.slice(offset,
            (parseInt(offset)+parseInt(pageSize))) 
            var hasAddress = userData&&
                userData.Address&&
                userData.sName&&
                userData.postalCode&&
                userData.state&&
                userData.city
        for(var i=0;i<faktorList.length;i++){
            faktorData[i].hasAddress = hasAddress?1:0
            var faktorNo = faktorData[i].faktorNo
            const faktorItemData = await faktorItems.find({faktorNo:faktorNo})
            faktorData[i].faStatus = faktorData[i].waitPay?"در انتظار پرداخت"
                :await FindStatus(faktorData[i].status,1)
            faktorData[i].items = faktorItemData
            faktorData[i].rahId	=faktorNo
            faktorData[i].userDetail=userData
            //itemRefs.push(faktorItem)
        }
        res.json({data:faktorData,size:faktorData.length})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})

router.post('/fetch-faktor-2', async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid'];
    const faktorID=req.body.faktorID
    try{
        const faktorList = await FaktorSchema.aggregate
        ([
          {$match:{_id:ObjectID(faktorID)}},
        { $addFields: { "manageId": { "$toObjectId": "$manageId" }}},
        {$lookup:{
            from : "customers", 
            localField: "customerID", 
            foreignField: "CustomerID", 
            as : "userData"
        }}, 
        {$lookup:{
            from : "users", 
            localField: "userId", 
            foreignField: "_id", 
            as : "adminData"
        }},
        {$lookup:{
            from : "users", 
            localField: "manageId", 
            foreignField: "_id", 
            as : "managerData"
        }}])
        var faktorData = faktorList&&faktorList[0]
        var faktorDetail = ''
        if(faktorData){
            faktorDetail = (faktorData.userId +" "+ faktorData.manageId)
            if(faktorData.userId != faktorData.manageId){
            var userShow = await users.findOne({_id:ObjectID(faktorData.userId)})
            faktorList[0].userData[0] = userShow
            }
        }
        var orderData={cartPrice:0,cartCount:0}
        var cartPrice = 0
        var cartItems = (faktorList&&faktorList[0].faktorItems)?
            faktorList[0].faktorItems:[]
        for(var i = 0;i<cartItems.length;i++){
            cartPrice +=parseInt(cartItems[i].price)*
                cartItems[i].count
        }
        orderData.cartPrice=cartPrice
        
        res.json({faktor:faktorList,orderData:orderData,faktorDetail:faktorDetail})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/register-faktor',auth, async (req,res)=>{
    const faktorNo=req.body.faktorNo
    try{
        const result = await RegisterFaktor(faktorNo)
        
        res.json({...result})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/register-faktor-item',auth, async (req,res)=>{
    const faktorNoId=req.body.id
    try{
        const result = await RegisterFaktorItem(faktorNoId)
        
        res.json({...result})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/update-faktor',jsonParser,auth, async (req,res)=>{
    const faktorNo =req.body.faktorNo
    const data=req.body
    const discount = req.body.discount

    try{
        0&&await FaktorSchema.updateOne({faktorNo:faktorNo},{
            $set:data
        })
        if(discount) {
            const faktorItemData = await faktorItems.find({faktorNo:faktorNo})
            for(var i=0;i<faktorItemData.length;i++){
                var rawPrice = Number(faktorItemData[i].unitPrice) * Number(faktorItemData[i].count)
                var totalDiscount = Number(discount) * rawPrice/100
                var price = rawPrice - totalDiscount
                var query = {
                    discount: discount,
                    totalDiscount:totalDiscount,
                    price: price
                }
                await faktorItems.updateOne({_id:faktorItemData[i]._id},{
                $set:query})
            }
        }
        const faktorData = await CalcFaktorData(faktorNo)
        res.json({data:faktorData,canEdit:1})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}
)
router.post('/update-faktor-data',jsonParser,auth, async (req,res)=>{
    const faktorNo =req.body.faktorNo
    const data=req.body.changes

    try{
        await FaktorSchema.updateOne({faktorNo:faktorNo},{
            $set:data
        })
        const faktorData = await FetchFaktorFunc(faktorNo)
        return res.json({...faktorData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
}
)

/*router.post('/update-faktor',jsonParser, async (req,res)=>{
    const userId =req.body.userId?req.body.userId:req.headers['userid']
    const data={
        discount:req.body.discount,
        manageId:req.headers['userid'],
        date:req.body.date,
        progressDate:Date.now() 
    }
    const cartID=req.body.cartID
    try{
        const cartList = await cart.aggregate
        ([{$match:{manageId:userId}},
            { $addFields: { "cartID": { "$toString": "$_id" }}},
            (cartID&&cartID.length)?{$match:{cartID:{$in:cartID}}}:{$match:{}},
            { $addFields: { "manageId": { "$toObjectId": "$manageId" }}},
            
        {$lookup:{
            from : "customers", 
            localField: "userId", 
            foreignField: "Code", 
            as : "userData"
        }},
        {$lookup:{
            from : "users", 
            localField: "manageId", 
            foreignField: "_id", 
            as : "adminData"
        }}])
        const faktorSeprate = totalCart(cartList)
        const faktorDetail = await IntegrateCarts(faktorSeprate)
        
        var sepidarQuery=[]
        var addFaktorResult=[]
        var faktorNo=0
        for(var i=0;i<faktorDetail.length;i++){
            faktorNo= await createfaktorNo("F","02","21")
            sepidarQuery[i] = await SepidarFunc(faktorDetail[i],faktorNo)
            //console.log(sepidarQuery[i])
            addFaktorResult[i] = await sepidarPOST(sepidarQuery[i],"/api/invoices",req.headers['userid'])
            //console.log(addFaktorResult[i])
            if(!addFaktorResult[i]||addFaktorResult[0].Message||!addFaktorResult[i].Number){
                res.status(400).json({error:addFaktorResult[0].Message?addFaktorResult[0].Message:"error occure",
                    query:sepidarQuery[i],status:"faktor"})
                return
            }
            else{
                const cartDetail =findCartSum(faktorDetail[i].cartItems)
                await FaktorSchema.create(
                    {...data,faktorItems:faktorDetail[i].cartItems,
                        userId:faktorDetail[i].userTemp,
                        customerID:faktorDetail[i].userId,
                        faktorNo:faktorNo,
                        totalPrice:cartDetail.totalPrice,
                        totalCount:cartDetail.totalCount,
                        InvoiceNumber:addFaktorResult[i].Number,
                        InvoiceID:addFaktorResult[i].InvoiceID})
                
            }
        }
        
        (cartID&&cartID.length)?await cart.deleteMany({_id:{$in:cartID}}):
        await cart.deleteMany({manageId:userId})

        const recieptQuery = 1//await RecieptFunc(req.body.receiptInfo,addFaktorResult[0],faktorNo)
        const recieptResult = 1//await sepidarPOST(recieptQuery,"/api/Receipts/BasedOnInvoice")
        //const SepidarFaktor = await SepidarFunc(faktorDetail)
        if(!recieptQuery||recieptResult.Message){
            res.json({error:recieptResult.Message,query:recieptQuery,status:"reciept"})
                return
        }
        else{
            res.json({recieptInfo:faktorDetail,
                users:users,
                faktorInfo:addFaktorResult,
                faktorData:sepidarQuery,
                status:"done"})
            }
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})*/
const IntegrateCarts = async(carts)=>{
    var cartList=carts
    for(var i =0 ;i<cartList.length;i++){
        cartList[i].cartItems= setCart(cartList[i].cartItems)
        
    }
    return(cartList)
}
const setCart=(cartItems)=>{
    var tempCart=[]
    for(var i=0;i<cartItems.length;i++){
        repeat = 0
        for(var j=0;j<tempCart.length;j++){
            if(cartItems[i].id===tempCart[j].id){
                tempCart[j].count=parseInt(tempCart[j].count)+
                                    parseInt(cartItems[i].count)
                repeat=1
                break
            }
        }
        !repeat&&tempCart.push({...cartItems[i]})
    }
    return(tempCart)
}
const SepidarFunc=async(data,faktorNo)=>{
    const notNullCartItem = []
    for(var i=0;i<data.cartItems.length;i++)
        data.cartItems[i].count?
        notNullCartItem.push(data.cartItems[i]):''
    //console.log(data)
    var query ={
        "GUID": "124ab075-fc79-417f-b8cf-2a"+faktorNo,
        "CustomerRef": toInt(data.userId),
        "AddressRef": toInt(data.userAddress)?toInt(data.userAddress):'',
        "CurrencyRef":1,
        "Description":faktorNo,
        "DescriptionRef":faktorNo,
        "SaleTypeRef": data.payValue?toInt(data.payValue):4,
        "Duty":0.0000,
        "Items": 
        notNullCartItem.map((item,i)=>(
            {
            "ItemRef": toInt(item.id),
            "TracingRef": null,
            "Description":item.description,
            "StockRef":"5",//data.stockId,
            "Quantity": toInt(item.count),
            "Fee": toInt(item.price),
            "Price": normalPriceCount(item.price,item.count,1),
            "Discount": findDiscount(item),
            "Tax": normalPriceCount(item.price,item.count,TaxRate),
            "Duty": 0.0000,
            "Addition": 0.0000
          }))
        
      }
    return(query)
}

const createfaktorNo= async(Noun,year,userCode)=>{
    var faktorNo = '';
    for(var i=0;i<10;i++){
        faktorNo = Noun+year+userCode+
        Math.floor(Math.random()* (99999 - 10000) + 10000)
        const findFaktor = await FaktorSchema.findOne({faktorNo:faktorNo})
        if(!findFaktor)
            return(faktorNo)
    }
}
const toInt=(strNum,count,align)=>{
    if(!strNum)return(0)
    
    return(parseInt(parseInt((align?"-":'')+strNum.toString().replace( /,/g, ''))*
    (count?parseFloat(count):1)))
}
const normalPriceCount=(priceText,count,tax)=>{
    if(!priceText||priceText === null||priceText === undefined) return("")
    var rawCount = parseFloat(count.toString())
    var rawTax = parseFloat(tax.toString())
    var rawPrice = Math.round(parseInt(priceText.toString().replace( /,/g, '')
        .replace(/\D/g,''))*rawCount*rawTax/1000)
    rawPrice = parseInt(rawPrice)*1000
    return(
      (rawPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace( /^\D+/g, ''))
    )
  }
const findDiscount=(item)=>{
    if(!item.discount) return(0.00)
    var off = Number(item.discount)
    var discount = off
    if(off<100){
        discount = Number(item.price) * Number(item.count) * discount/100
    }
    return(roundNumber(discount))
}
const roundNumber = (number)=>{
    var rawNumber = parseInt(number.toString().replace( /,/g, ''))
    return(parseInt(Math.round(rawNumber/1000))*1000)

} 
router.post('/customer-find', async (req,res)=>{
    const search = req.body.search
    const page = req.body.page
    try{ 
        var searchCustomer = await users.
        aggregate([{$match:
            {$or:[
                {username:{$regex: search, $options : 'i'}},
                {Code:{$regex: search, $options : 'i'}}
            ]}
        },
            {$skip:page?(Number(page)*10):0},
            {$limit:10}])
        //if(!searchCustomer.length){
        
        const searchUser = await customerSchema.
            aggregate([{$match:
                {$or:[
                    {username:{$regex: search, $options : 'i'}},
                    {Code:{$regex: search, $options : 'i'}}
                ]}
            }])
        //}
        const allUser = searchCustomer.concat(searchUser)  
        //logger.warn("main done")
        res.json({customers:allUser})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/bankCustomer', async (req,res)=>{
    const search = req.body.search
    try{ 
        var bankCustomer = await bankAccounts.find()
        
        res.json({bankList:bankCustomer})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/add-bank-to-cart', async (req,res)=>{
    
    const data = {
        userId: req.body.userId,
        title: req.body.title,
        bankCode: req.body.bankCode,
        payValue: req.body.payValue,
        description: req.body.description
    }
    try{ 
        await transaction.create(data)
        var bankDetail = await transaction.find({userId:data.userId,orderNo:{$exists:false}})
        res.json({transData:bankDetail,remain:134500
            ,totalPay:4350000
        })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/remove-bank-from-cart', async (req,res)=>{
    const userId = req.body.userId
    const id = req.body.id
    try{ 
        await transaction.deleteOne({_id:ObjectID(id),userId:userId})
        var bankDetail = await transaction.find({userId:userId,orderNo:{$exists:false}})
        res.json({transData:bankDetail,remain:134500
            ,totalPay:4350000
        })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/edit-addCart', async (req,res)=>{
    const cartNo=req.body.cartNo
    const data=req.body.data
    try{
        //const userData = await users.findOne({_id:req.headers['userid']})
        //const stockId = userData.StockId?userData.StockId:"13"
        var status = "";
        //const cartData = await cart.find({userId:userId})
        const CartData = await cart.findOne({cartNo:cartNo})
        
        const availItems = await checkAvailable(data,CartData.stockId)
        if(!availItems){
            res.status(400).json({error:"موجودی کافی نیست"}) 
            return
        }
        const cartItems = createCart(CartData?CartData.cartItems:[],
            data)
            CartData.cartItems =(cartItems)
        if(!CartData){
            
        }
        else{
            cartLog.create({...CartData,ItemID:data,action:"edit cart"})
            await cart.updateOne(
                {cartNo:cartNo},{$set:CartData})
            status = "edit cart"
        }
        const cartDetails = await findCartData(cartNo)
        res.json({...cartDetails,message:"آیتم اضافه شد"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/update-Item', auth, jsonParser, async (req, res) => {
    const userId= req.body.userId ? req.body.userId : req.headers['userid']
	const data = {
		cartID: req.body.cartID,
		changes: req.body.changes,
		progressDate: Date.now(),
	};
	try {
        var cartDetail = await cart.findOne({ _id: ObjectID(data.cartID) });
        console.log(cartDetail)
        var newCount =cartDetail.count
        var newDiscount = cartDetail.discount
        var rowPrice = Number(cartDetail.unitPrice)
        
        if(data.changes.count) 
            newCount =Number(data.changes.count) 
        if(data.changes.discount)
            var newDiscount = Number(data.changes.discount)

        if(data.changes.price) rowPrice = data.changes.price
        var count = newCount
        var price = rowPrice*count
        
        
        data.changes.discountPrice = newDiscount * price /100 
        data.changes.totalPrice = price
        data.changes.fullPrice = price -data.changes.discountPrice
        data.changes.price = data.changes.fullPrice
        
		await cart.updateOne({ _id: ObjectID(data.cartID) }, { $set: data.changes });
		const cartDetails = await CalcCart(userId,req.headers['userid'])
        
    const faktors = await ListFaktor(userId,req.headers['userid'],data)
    return res.json({...cartDetails,...faktors})
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});
router.post('/update-faktor-Item-data', auth, jsonParser, async (req, res) => {
    const userId= req.body.userId ? req.body.userId : req.headers['userid']
	const data = {
		itemID: req.body.itemID,
		changes: req.body.changes,
		progressDate: Date.now(),
	};
	try {
        const faktorItemData = await faktorItems.findOne({ _id: ObjectID(data.itemID) });
        const faktorNo = faktorItemData&&faktorItemData.faktorNo
		await faktorItems.updateOne({ _id: ObjectID(data.itemID) }, { $set: data.changes });
		const faktorData = await FetchFaktorFunc(faktorNo)
        return res.json({...faktorData})
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

router.post('/remove-faktor-Item-data', auth, jsonParser, async (req, res) => {
    const userId= req.body.userId ? req.body.userId : req.headers['userid']
	const data = {
		itemID: req.body.itemID
	};
	try {
        const faktorItemData = await faktorItems.findOne({ _id: ObjectID(data.itemID) });
        const faktorNo = faktorItemData&&faktorItemData.faktorNo
		await faktorItems.deleteOne({ _id: ObjectID(data.itemID) }, { $set: data.changes });
		const faktorData = await FetchFaktorFunc(faktorNo)
        return res.json({...faktorData})
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});
router.post('/edit-removeCart',jsonParser, async (req,res)=>{
    const cartNo=req.body.cartNo
    const cartID=req.body.cartID
    
    try{
        var status = "";
        const cartData = await cart.findOne({cartNo:cartNo})
        const cartItems = removeCart(cartData,cartID)
        //cartData.cartItems =(cartItems)
        await cart.updateOne({cartNo:cartNo},
            {$set:{cartItems:cartItems}})
        //console.log(req.body.cartItem)
        cartLog.create({...cartData,ItemID:cartID,action:"edit delete"})
            
        const cartDetails = await findCartData(cartNo)
        res.json({...cartDetails,message:"آیتم حذف شد"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/edit-updateFaktor',jsonParser, async (req,res)=>{
    const data={
        //
        manageId:req.headers['userid'],
        date:req.body.date,
        progressDate:Date.now() 
    }
    const cartNo=req.body.cartNo
    try{
        const adminUser = await users.findOne({_id:ObjectID(req.headers["userid"])})
        
        if(!adminUser.access== "manager") {
            res.status(400).json({error:"no access"})
            return
        }
        const cartList = await cart.aggregate
        ([{$match:{cartNo:cartNo}},
            { $addFields: { "manageId": { "$toObjectId": "$manageId" }}},
            { $addFields: { "userId": { "$toObjectId": "$userId" }}},
            
        {$lookup:{
            from : "customers", 
            localField: "userId", 
            foreignField: "_id", 
            as : "userData"
        }},
        {$lookup:{
            from : "users", 
            localField: "manageId", 
            foreignField: "_id", 
            as : "adminData"
        }}])
        const faktorSeprate = totalCart(cartList)
        const faktorDetail = await IntegrateCarts(faktorSeprate)
        
        var sepidarQuery=[]
        var addFaktorResult=[]
        var faktorNo=0
        
        for(var i=0;i<faktorDetail.length;i++){
            faktorNo= await createfaktorNo("F","02","21")
            sepidarQuery[i] = await SepidarFunc(faktorDetail[i],faktorNo)
            
            addFaktorResult[i] = await sepidarPOST(sepidarQuery[i],"/api/invoices",req.headers['userid'])
            
            //console.log(addFaktorResult[i])
            if(!addFaktorResult[i]||addFaktorResult[0].Message||!addFaktorResult[i].Number){
                res.status(400).json({error:addFaktorResult[0].Message?addFaktorResult[0].Message:"error occure",
                    query:sepidarQuery[i],status:"faktor"})
                return
            }
            else{
                //console.log(addFaktorResult[i].Number)
                const cartDetail =findCartSum(faktorDetail[i].cartItems)
                await FaktorSchema.create(
                    {...data,faktorItems:faktorDetail[i].cartItems,
                        userId:faktorDetail[i].userTemp,
                        customerID:faktorDetail[i].userId,
                        faktorNo:faktorNo,
                        totalPrice:cartDetail.totalPrice,
                        totalCount:cartDetail.totalCount,
                        InvoiceNumber:addFaktorResult[i].Number,
                        InvoiceID:addFaktorResult[i].InvoiceID})
                
            }
        }
        
        await cart.deleteOne({cartNo:cartNo})
        

        const recieptQuery = 1//await RecieptFunc(req.body.receiptInfo,addFaktorResult[0],faktorNo)
        const recieptResult = 1//await sepidarPOST(recieptQuery,"/api/Receipts/BasedOnInvoice")
        //const SepidarFaktor = await SepidarFunc(faktorDetail)
        if(!recieptQuery||recieptResult.Message){
            res.json({error:recieptResult.Message,query:recieptQuery,status:"reciept"})
                return
        }
        else{
            res.json({recieptInfo:faktorDetail,
                users:users,
                faktorInfo:addFaktorResult,
                faktorData:sepidarQuery,
                status:"done"})
            }
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/price', async (req,res)=>{
    try{ 
        const cPrice = await FindPrice()
        res.json({data:cPrice})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/sliders', async (req,res)=>{
    try{
        const SlidersList = await slider.find()
        res.json({data:SlidersList,message:"slider list"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/list-complete-faktor',auth, async (req,res)=>{
    var userId = req.headers['userid']
    const userCode = await customers.findOne({_id:ObjectID(userId)})
    if(!userCode){
        res.status(400).json({error:"user not found"})
        return('')
    }
    try{
        const creditData = await GetTahHesab(
            {
                "getmandehesabbycode":
                [userCode.cCode]
            }
        )
        res.json({data:creditData,user:userCode,message:"user Credit"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/update-cart-data',auth, async (req,res)=>{
    var userId = req.body.userId?req.body.userId:req.headers['userid']
    const userCode = await customers.findOne({_id:ObjectID(userId)})
    if(!userCode){
        return res.status(400).json({error:"user not found"})
    }
    const data = req.body
    data.userId=userId
    try{
        const preData = await cartData.findOne({userId:userId})
        if(preData){
            await cartData.updateOne({userId:userId},{$set:data})
        }
        else{
            await cartData.create(data)
        }
        const cartDetails = await CalcCart(userId,0,req.headers['userid'])

        const faktors = await ListFaktor(userId,req.headers['userid'],data)
        res.json({...cartDetails,...faktors})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
module.exports = router;