const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
const task = require('../models/main/task');
const LogCreator = require('../middleware/LogCreator');
const users = require('../models/auth/users');
const slider = require('../models/main/slider');
const state = require('../models/main/state');
const city = require('../models/main/city');
const cart = require('../models/product/cart');
var ObjectID = require('mongodb').ObjectID;
const tax = require('../models/param/tax');
const { updateOne } = require('../models/logger');
const prepaid = require('../models/param/prepaid');
const CreateNotif = require('../middleware/CreateNotif');
const news = require('../models/param/news');
const notif = require('../models/param/notif');
const docSchema = require('../models/param/document')
const docCat = require('../models/param/docCat');
const customers = require('../models/auth/customers');
const DataToCSV = require('../middleware/Calc/DataToCSV');

router.post('/sliders', async (req,res)=>{
    try{
        const SlidersList = await slider.find()
        res.json({filter:SlidersList,message:"slider list"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/fetch-slider', async (req,res)=>{
    var sliderId = req.body.sliderId?req.body.sliderId:''
    try{
        const SliderData = await slider.findOne({_id:sliderId})
        res.json({filter:SliderData,message:"slider Data"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/updateSlider',auth,jsonParser, async (req,res)=>{
    var sliderId = req.body.sliderId?req.body.sliderId:''
    if(sliderId === "new")sliderId=''
    try{ 
        const data = {
            title:  req.body.title,
            enTitle:  req.body.enTitle,
            link: req.body.link,
            description:   req.body.description,
            imageUrl: req.body.imageUrl,
            thumbUrl:req.body.thumbUrl
        }
        var sliderResult = ''
        if(sliderId) sliderResult=await slider.updateOne({_id:sliderId},
            {$set:data})
        else
        sliderResult= await slider.create(data)
        
        res.json({result:sliderResult,success:sliderId?"Updated":"Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/changeState',auth,jsonParser, async (req,res)=>{
    const data={
        state:req.body.state,
        prior:req.body.prior*5+1
    }
    try{
        const userData = await users.findOne({_id:req.headers['userid']})

    const logData = await LogCreator(userData,"change State",
        `task no ${req.body.id}'s state change to ${data.state}`)
        const leadTask= await task.updateOne({_id:req.body.id},
            {$set:data})
        //if(leadTask)
        res.json({status:"report done",data:leadTask})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/changeOrder',auth,jsonParser, async (req,res)=>{
    const tasks = req.body.tasks
    try{
        const userData = await users.findOne({_id:req.headers['userid']})

        const logData = await LogCreator(userData,"change Sort",
        `task sort by: ${tasks}`)
    
   for(var i = 0;i<tasks.length;i++){
    const updateState = await task.updateOne({_id:tasks[i]},{$set:{prior:i*5+3}})
    }
       
        //if(leadTask)
        res.json({status:"sort done"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/list-state',jsonParser, async (req,res)=>{
    const search = req.body.search
    try{
        const stateList = await state.find(search?
            {stateName:new RegExp('.*' + search + '.*')}:{})
        res.json({data:stateList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/list-city',jsonParser, async (req,res)=>{
    const search = req.body.search
    const state = req.body.stateId
    try{
        if(!state){
            res.status(400).json({message: "لطفا کد استان را وارد نمایید"})
            return('')
        }
        const cityList = await city.find(search?
            {cityName:new RegExp('.*' + search + '.*'),
            stateId:state}:{stateId:state})
        res.json({data:cityList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.get('/get-params',jsonParser, async (req,res)=>{
    try{
        const taxValue = await tax.find().sort({date:-1})
        const prepaidValue = await prepaid.find().sort({date:-1})

        res.json({tax:taxValue,prepaid:prepaidValue,message:"param list"})
    } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/update-params',jsonParser,auth, async (req,res)=>{
    const taxValue = req.body.tax
    const prepaidValue = req.body.prepaid
    try{
        if(taxValue){
            const taxData = await tax.findOne()
            if(taxData){
                await tax.updateOne({},{$set:{percent:taxValue}})
            }
            else{
                await tax.create({percent:taxValue})
            }
        }
        if(prepaidValue){
            const prepaidData = await prepaid.findOne()
            if(prepaidData){
                await prepaid.updateOne({},{$set:{percent:prepaidValue}})
            }
            else{
                await prepaid.create({percent:prepaidValue})
            }
        }
        res.json({message:"param updated"})
    } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})


/*Document*/
router.post('/list-doc',jsonParser,async (req,res)=>{
    try{
        var result = await docSchema.find();
       
        res.json({filter:result})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.get('/list-mocks',jsonParser,async (req,res)=>{
    try{
        var documents = await docSchema.find();
        var docCats = await docCat.find();
        const mocks = await CreateMock(docCats,documents)
        res.json(mocks)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/fetch-doc',jsonParser,async (req,res)=>{
    const docId = req.body.docId
    try{
        var result = docId?await docSchema.findOne({_id:ObjectID(docId)}):'';
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/update-doc',jsonParser,async (req,res)=>{
    var docId = req.body.docId
    if(docId==="new") docId = ""
    const data = req.body

    try{
        var result = docId?await docSchema.updateOne({_id:ObjectID(docId)},{$set:data}):
        await docSchema.create(data);
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/delete-doc',jsonParser,auth,async (req,res)=>{
    var docId = req.body.docId
    if(!docId) {
        res.status(400).json({message:"not found"})
        return
    }

    try{
        var result = await docSchema.deleteOne({_id:ObjectID(docId)})
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.get('/list-notif',jsonParser,auth,async (req,res)=>{
    const userId = req.headers['userid']
    try{
        var result = userId&&await notif.find({userId:ObjectID(userId)}).sort({date:-1}).limit(10)
        var resultPop = userId&&await notif.findOne({userId:ObjectID(userId),
            title:/news/,status:true
        }).sort({date:-1})
        const unread = result&&result.filter(item=>(item.status==true))
        
        //const popUpNotif = unread[0]?unread[0]:{}

        res.json({filter:result,unread:unread,
            unreadSize:unread.length,popUp:resultPop})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/fetch-notif',jsonParser,async (req,res)=>{
    const notifCode = req.body.notifCode
    try{
        var result = notifCode?await notif.findOne({enTitle:notifCode}):'';
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/update-notif',jsonParser,auth,async (req,res)=>{
    var notifCode = req.body.notifCode
    const userId = req.headers['userid']
    var data = req.body
    data.userId = userId
    try{
        var result = notifCode?await notif.updateOne({_id:ObjectID(notifCode)},
            {$set:data}):
        await notif.create(data);
        res.json(result)
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})


router.post('/list-news',jsonParser,async (req,res)=>{
    const userId = req.headers['userid']
    var userData = userId&&await customers.findOne({_id:ObjectID(userId)})
    var lastNews = userData&&userData.showNews
    try{
        var result = await news.find().sort({date:-1});
        var lastShow = ''
        if(result&&(result[0]._id != lastNews)){
            lastShow = result[0]
        }
        res.json({filter:result,lastShow})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/read-news',jsonParser,auth,async (req,res)=>{
    const userId = req.headers['userid']
    const newsId = req.body.newsId
    try{
        
        if(userId&&newsId){
            await customers.updateOne({_id:ObjectID(userId)},
            {$set:{showNews:newsId}})
        }
        else{
            res.status(400).json({message:"کدخبر وارد نشده است"})
        }
        res.json({message:"تغییرات اعمال شد"})
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/fetch-news',jsonParser,async (req,res)=>{
    const newsCode = req.body.newsCode
    try{
        var result = newsCode?await news.findOne({enTitle:newsCode}):'';
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/update-news',jsonParser,async (req,res)=>{
    var newsCode = req.body.newsCode
    if(newsCode==="new") newsCode = ""
    const data = req.body 

    try{
        var result = ''
        if(newsCode)
            await news.updateOne({enTitle:newsCode},{$set:data})
        else
            {
                await news.create(data) 
                const customerList = await customers.find({})
                for(var i=0;i<customerList.length;i++){
                    await CreateNotif(data.title,customerList[i]._id,"news",
                        data.link,"newNews",data.thumbUrl
                    )
                }
            };
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/delete-news',jsonParser,async (req,res)=>{
    var newsCode = req.body.newsCode

    try{
        var result = ''
        if(newsCode)
            await news.deleteOne({enTitle:newsCode})
        else
            {
                
            };
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/show-news',jsonParser,async (req,res)=>{
    var userId = req.headers["userid"]
    const newsCode = req.body.newsCode

    try{ 
        const newsResult = await news.findOne({_id:ObjectID(newsCode)})
        if(!newsResult){
            res.status(400).json({message: "یافت نشد", error:"Not Found"}) 
            return
        }
        var result = await customers.updateOne({_id:ObjectID(userId)},
            {$set:{showNews:newsCode}})
        
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})

router.post('/uploadData',jsonParser,async (req,res)=>{
    var data = req.body.data

    try{ 
        var result = await DataToCSV(data)
        
        res.json(result)
        return
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})


module.exports = router;