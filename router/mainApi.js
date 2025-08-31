const express = require('express');
const router = express.Router()
const { default: fetch } = require("node-fetch");
var ObjectID = require('mongodb').ObjectID;
const auth = require("../middleware/auth");
const slider = require('../models/main/slider');
const authApi = require('./authApi');
const taskApi = require('./taskApi');
const yasApi = require('./yasApi');
const appApi = require('./appApi');
const cartApi= require('./cartApi');
const settingApi = require('./settingApi');
const productApi = require('./productApi');
const formApi = require('./formApi');
const paymentApi = require('./paymentApi');
const userApi = require('./userApi');
const panelUserApi = require('./panelUserApi')
const CRMPanelApi = require('./panelCrmApi')
const panelOrderApi = require('./panelOrderApi')
const panelProductApi = require('./panelProductApi')
const panelFaktorApi = require('./faktorApi')
const panelQuoteApi = require('./quoteApi')
const SiteHomeApi = require('./site/home/homeApi')
const sepidarFetch = require('../middleware/Sepidar');
const products = require('../models/product/products');
const productPrice = require('../models/product/productPrice');
const productCount = require('../models/product/productCount');
const customers = require('../models/auth/customers');
const schedule = require('node-schedule');
const bankAccounts = require('../models/product/bankAccounts');
const updateLog = require('../models/product/updateLog');
const state = require('../models/main/state');
const city = require('../models/main/city');
const quickCart = require('../models/product/quickCart');
const price = require('../models/price');
const GetHesabFa = require('../middleware/GetHesabFa');
const users = require('../models/auth/users');
const { ONLINE_URL} = process.env;
 
router.get('/main', async (req,res)=>{
    try{
        const sliders = await slider.find()

        //logger.warn("main done")
        res.json({sliders:sliders})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.use('/auth', authApi)
router.use('/task', taskApi)
router.use('/setting', settingApi)
router.use('/app', appApi)
router.use('/cart', cartApi)
router.use('/product', productApi)
router.use('/form', formApi)
router.use('/user', userApi)
router.use('/payment',paymentApi)

router.use('/yas', yasApi)
router.use('/panel/user', panelUserApi)
router.use('/panel/order', panelOrderApi)
router.use('/panel/product', panelProductApi)
router.use('/panel/faktor', panelFaktorApi)
router.use('/panel/quote', panelQuoteApi)
router.use('/esale', panelFaktorApi)


router.use('/site/home', SiteHomeApi)

router.use('/panel/crm',CRMPanelApi)

 schedule.scheduleJob('*/2 * * * *', async() => { 
    try{
    /*var response = await fetch(process.env.ONLINE_PRICE,{method: 'GET'})
    const result = await response.json();
    var priceValue = result&&result.geram18
    priceValue&&await price.create({price:priceValue.value,date:Date.now()});*/
    }
    catch(error){
        console.log(error)
    }
 })
 schedule.scheduleJob('*/10 * * * *', async() => { 
    try{
        var response = await fetch(ONLINE_URL + "/get-product",
        { method: 'POST' });
    }catch{}
 })
 router.get('/get-customers',auth, async (req,res)=>{
    const managerId = req.headers['userid']
    try{
        const customerList = await GetHesabFa(
            {"queryInfo":{take:10000,skip:0}},"/contact/getcontacts")
        var result = []
        if(customerList&&customerList.Success)
            result = customerList.Result.List

        var outPut = []
        var updateCustomer = 0
        var newCustomer = 0
        for(var i=0;i<result.length;i++){
            
            if(result[i]){
            outPut.push(result[i])
            var query = {username:result[i].Name,
                cName:result[i].FirstName,
                sName:result[i].LastName,
                phone:result[i].Mobile,
                groupCode:result[i].NodeName,
                active:result[i].Active,
                cCode:result[i].Code, 
                birthDay:result[i].BDate,
                city:result[i].City,
                Address:result[i].Address,
                postalCode:result[i].PostalCode,
                meliCode:result[i].NationalCode,
                Credits:result[i].Credits,
                email:result[i].Email?result[i].Email:
                    (result[i].Mobile+"@fahascrubs.com"),
                Liability:result[i].Liability}
                
            var updateResult = await customers.updateOne({phone:result[i].Mobile},
                {$set:query}
            )
            if(!updateResult.matchedCount){
                newCustomer++
                await customers.create(query)
            }
            if(updateResult.modifiedCount){
                updateCustomer++
            }
            }
        }
        const userData = await users.findOne({_id:ObjectID(managerId)})
        await updateLog.create({ 
            updateQuery: "customers",
            updateUser:userData.username,
            date: Date.now()
        })
        res.json({updateCustomer,newCustomer})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.get('/get-product',auth, async (req,res)=>{
    const managerId = req.headers['userid']
    try{
        const productList = await GetHesabFa(
            {"queryInfo":{take:20000,skip:0}},"/item/getitems")
        //console.log(productList)
        var result = []
        if(productList&&productList.Success)
            result = productList.Result.List

        var outPut = []
        var updateProduct = 0
        var newProduct = 0
        for(var i=0;i<result.length;i++){
            if(result[i].Code == "000002") continue
            if(result[i].ProductCode=="99001"||
                result[i].ProductCode=="99002"
            ) continue
            if(result[i]){ 
                var sku = result[i].ProductCode//?result[i].ProductCode:result[i].Code
            outPut.push(result[i])
            var query = {title:result[i].Name,
                sku:sku,
                ItemID:result[i].Code,
                unit:result[i].Unit,
                stock:result[i].Stock,
                buyPrice:result[i].BuyPrice,
                sellPrice:result[i].SellPrice,
                nodeId:result[i].NodeId,
                nodeName:result[i].NodeName,
                active:result[i].Active,
                priceList:result[i].PriceList}
            var updateResult = await products.updateOne({sku:sku},
                {$set:query}
            )
            var newItem = []
            try{if(!updateResult.matchedCount){
                var repeatResult = await products.findOne({sku:sku})//ItemID:result[i].Code})
                if(repeatResult){
                    var updateResult = await products.updateOne({sku:sku},//ItemID:result[i].Code},
                {$set:query})
                }
                else{
                newProduct++
                await products.create(query)
                }
            }}catch{}
            if(updateResult.modifiedCount){
                updateProduct++
            }
            }
        }
        const userData = await users.findOne({_id:ObjectID(managerId)})
        await updateLog.create({ 
            updateQuery: "products",
            updateUser:userData.username,
            date: Date.now()
        })
        res.json({updateProduct,newProduct,productList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/update-log', async (req,res)=>{
    try{ 
        const userData = await users.findOne({_id:ObjectID(req.headers['userid'])})
        if(!userData){
            res.status(400).json({error:"error not found"})
            return
        }
        const productLog = await updateLog.find({updateQuery:"products"}).sort({ "date": -1 }).limit(5)
        const customerLog = await updateLog.find({updateQuery:"customers"}).sort({ "date": -1 }).limit(5)

        const sepidarLog = await updateLog.find({}).sort({ "date": -1 }).limit(20)

        res.json({ log: sepidarLog,
            productLog,customerLog,
             message: "done" })
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})



module.exports = router;