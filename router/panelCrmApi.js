const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
var ObjectID = require('mongodb').ObjectID;
const multer = require('multer');
const fs = require('fs');
const user = require('../models/auth/users'); 
const mime = require('mime');
const crmlist = require('../models/crm/crmlist');
const tasks = require('../models/crm/tasks');
const faktors = require('../models/product/faktor');
const ProfileAccess = require('../models/auth/ProfileAccess');
const FindAccess = require('../middleware/FindAccess');
const {TaxRate} = process.env
const cart = require('../models/product/cart');
const SepidarOrder = require('../middleware/SepidarOrder');
const ClassifyOrder = require('../middleware/ClassifyOrder');
const faktorItems = require('../models/product/faktorItems');
const CreateFaktorLog = require('../middleware/CreateFaktorLog');
const FindNextStatus = require('../middleware/FindNextStatus');
const FindSideEffect = require('../middleware/FindSideEffect');
const FindPrice = require('../middleware/FindPrice');
const MergeOrders = require('../middleware/Calc/MergeOrders');
const ClassifyOrders = require('../middleware/Calc/ClassifyOrders');
const CheckAllRecieve = require('../middleware/Calc/CheckAllRecieve');
const FindError = require('../middleware/Functions/FindError');

router.post('/fetch-crm',jsonParser,async (req,res)=>{
    const userId=req.body.userId?req.body.userId:req.headers['userid']
    const crmId = req.body.crmId
    try{
        var userData = await user.findOne({_id: ObjectID(userId)})
        const crmList = await crmlist.findOne({_id:crmId})
       res.json({data:crmList})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/fetch-tasks',auth,jsonParser,async (req,res)=>{
    const crmId = req.body.crmId
    const userId = req.headers["userid"]
    const offset = req.body.offset
    const pageSize = req.body.perPage
     
        const tasksList = await calcTasks(userId,offset,pageSize)
try{
       res.json(tasksList)
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/fetch-tasks-column',auth,jsonParser,async (req,res)=>{
    const colId = req.body.colId
    const userId = req.headers["userid"]
    const offset = req.body.offset
    const pageSize = req.body.pageSize
try{     
        const tasksList = await calcTasks(userId,offset,pageSize,colId)

       res.json(tasksList)
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
const calcTasks=async(userId,offsetRaw,pageSizeRaw,colId)=>{
    const userData = await user.findOne({_id:ObjectID(userId)})
    if(!userData){
        return
    } 
    var admin = 0
    if(userData.access==="manager") admin = 1
    const userAccess = await FindAccess(userData.profile)
    const allow = userAccess.find(item=>item.title==="Tasks")
    if(!allow&&!admin)return

    //if(userData&&userData.access!=="manager") limitTask= userData.profile
    const crmData = colId?{crmSteps:[{code:colId}]}:await crmlist.findOne()
    const tasksData = []
    if(!crmData)return res.status(400).json({error:"no crm found"})
    const crmSteps = crmData.crmSteps?crmData.crmSteps.map(item=>({title:item.title,code:item.enTitle})):[]
    const offset = offsetRaw?offsetRaw:0
    const pageSize = pageSizeRaw

    const now = new Date();
    const startOfYesterday = new Date(now);
    startOfYesterday.setDate(now.getDate() - 2);
    startOfYesterday.setHours(0, 0, 0, 0);

    for(var i=0;i<crmSteps.length;i++){
        var tempPageSize = pageSize&&pageSize[crmSteps[i].code]
        if(!tempPageSize) tempPageSize = 5
        var query = {status:crmSteps[i].code}
        if(crmSteps[i].code == "archive"||crmSteps[i].code == "cancel")
            query.progressDate = {$gte:startOfYesterday}
        //console.log(query)
        const colData = await faktors.find(query)
        //const offsetData = await offset.find(item=>item.col==crmSteps[i].code)
        const colList = colData.slice(offset,
            (parseInt(offset)+parseInt(tempPageSize))) 
        tasksData.push(
            { title:crmSteps[i].title , step:crmSteps[i].code , 
                isStore:(crmSteps[i].code == "prepair")?1:0,
                pageSize:tempPageSize, more:(colData.length>tempPageSize)?true:false,
                size:colData.length, data:colList,query:query}
        )
    }
    const tasksToShow = tasksData
    /*for(var i=0;i<columnOrder.length;i++){
        const access =(userAccess.find(item=>item.title ===columnOrder[i].enTitle))
        //console.log(access)
        if(access||admin){
            columnOrder[i].access = admin?"edit":access.state
            showColumn.push(columnOrder[i])
            columns[columnOrder[i].enTitle]=[]
        }
        
    }
    const priceRaw = await FindPrice()
    const tasksToShow=[]
    for(var c=0;c<taskList.length;c++){
        var taskStep = taskList[c].status
        var yesterday = new Date(Date.now() - 86400000); // that is: 24 * 60 * 60 * 1000
        var taskDate = taskList[c].progressDate?taskList[c].progressDate:
            taskList[c].date
        if(!taskList[c].progressDate){
            yesterday = new Date(Date.now() - 166400000)
        }
        if(taskStep=="archive")
            if( taskDate < yesterday)
                continue
        try{columns[taskStep].push(taskList[c]._id) 
            tasksToShow.push(taskList[c])
        }
        catch{}
        //columnOrder.find(item=>item.enTitle===taskStep)
    } */
    return({crmData:crmData,tasks:tasksToShow, crm:crmData,})
        //columnOrder:showColumn,columns:columns})
}
router.post('/update-faktor-tasks',auth,jsonParser,async (req,res)=>{
    const taskId = req.body.id?req.body.id:""
    var body = req.body
    try{
        const faktorItem = await faktors.findOne({_id:ObjectID(taskId)})
        if(!faktorItem){
            res.status(400).json({error:"شماره فاکتور موجود نیست"})
            return
        }
        const nextStatus = await FindNextStatus(faktorItem,body)
        body.status=nextStatus.enTitle
        body.statusFa=nextStatus.title
        const sideEffect = await FindSideEffect(faktorItem,body)
        if(sideEffect&&sideEffect.error){
            res.status(400).json({error:sideEffect&&sideEffect.error,
                message: FindError(sideEffect&&sideEffect.error)
            })
            return
        }
        if(taskId)
            await faktors.updateOne({_id:ObjectID(taskId)},{$set:body})
    
        const userId=req.headers["userid"]
        const tasksList = await calcTasks(userId)
        await CreateFaktorLog(userId,faktorItem.faktorNo,"updateOrder",
            nextStatus.enTitle,faktorItem.status,"Task Updated",body)
       res.json({taskData:tasksList,message:taskId?"تغییرات اعمال شد":"Task Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.get('/faktor-get-status/:id',auth,jsonParser,async (req,res)=>{
    const url = req.url
    var taskId = url.split('/')[2]
    var buttons=[]
    try{
        const faktorItem = await faktors.findOne({_id:ObjectID(taskId)}).lean()
        if(!faktorItem){
            res.status(400).json({error:"شماره فاکتور موجود نیست"})
            return
        }
        if(faktorItem.status =="quote"){
            buttons=[
                {title:"تایید",type:"button",color:"lightgreen",value:1},
                {title:"لغو",type:"button",color:"rgb(248,68,68)",value:-1}
            ]
        }
        
        if(faktorItem.status =="inprogress"){
            buttons=[
                {title:"تایید",type:"button",color:"lightgreen",value:1},
                {title:"ویرایش",type:"button",color:"orange",value:2},
                {title:"لغو",type:"button",color:"rgb(248,68,68)",value:-1}
            ]
        }
        if(faktorItem.status =="edit"){
            buttons=[
                {title:"تایید",type:"button",color:"lightgreen",value:1},
                {title:"لغو",type:"button",color:"rgb(248,68,68)",value:-1}
            ]
        }
        if(faktorItem.status =="pay"){
            buttons=[
                {title:"ثبت حسابفا",type:"button",color:"lightgreen",value:1},
                {title:"ویرایش",type:"button",color:"orange",value:2}
            ]
        }
        if(faktorItem.status =="send"){
            buttons=[
                {title:"روش ارسال",parameter:"transportWay",
                    options:["پست","اتوبوس","پیک"],
                    type:"list",color:"silver",value:0},
                {title:"بارکد مرسوله",parameter:"transportBarCode",
                    type:"text",color:"silver",value:0},
                {title:"شماره تماس ",parameter:"transportPhone",
                    type:"text",color:"silver",value:0},
                {title:"تصویر ",parameter:"transportImage",
                    type:"file",color:"silver",value:0},
                {title:"تایید",type:"button",color:"lightgreen",value:1}
            ]
        }
        if(faktorItem.status =="prepair"){
            const allCheck = await CheckAllRecieve(faktorItem&&faktorItem.faktorNo)
            buttons=allCheck?[
                /*{title:"کد محصول",parameter:"newSku",
                    type:"text",color:"silver",value:0},*/
                {title:"تایید",type:"button",color:"lightgreen",value:1}
            ]:[]
        }
        if(faktorItem.status =="done"){
            buttons=[
                {title:"ثبت حسابفا",type:"button",color:"lightgreen",value:1}
            ]
        }
       res.json({taskData:faktorItem,
            buttons,message:"Task Detail"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-tasks',auth,jsonParser,async (req,res)=>{
    const taskId = req.body._id?req.body._id:""
    var body = req.body
    delete body['checkList']
    try{
        if(taskId)
            await tasks.updateOne({_id:taskId},{$set:body})
        else{
            const crmData = await crmlist.findOne()
            const crmStep = crmData.crmSteps.find(item=>item.index==1)
            await tasks.create({...body,taskStep:crmStep.enTitle})
 
        }
        const userId=req.headers["userid"]
        const tasksList = await calcTasks(userId)
       res.json({taskData:tasksList,message:taskId?"Task Updated":"Task Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-tasks-status',auth,jsonParser,async (req,res)=>{
    const taskId = req.body._id?req.body._id:""
    var status = req.body.status
    const crmData = await crmlist.findOne({})
    const taskData = await tasks.findOne({_id:ObjectID(taskId)})
    const crmSteps = crmData.crmSteps
    const taskStatus = taskData.taskStep
    var newStatus = ''
    var index = crmSteps.findIndex(item=>item.enTitle===taskStatus)
    var nextStep = findNext(index,status)
    newStatus = crmSteps[nextStep]
    
        var sepidarAccept = 1
        var sepidarQuery = ''
        var sepidarResult = ''
        var userData = ''
        var adminData = ''
        if(status==="sepidar"){
            const faktorNo= "F123"+taskData.orderNo
            var sepidarResult = await SepidarOrder(taskData.orderNo)
            if(sepidarResult.Message)
                await tasks.updateOne({_id:ObjectID(taskId)},
            {$set:{taskStep:newStatus.enTitle,query:sepidarQuery,
                result:sepidarResult,progressDate:Date.now()}})
        }
        else{
            await tasks.updateOne({_id:ObjectID(taskId)},
            {$set:{taskStep:newStatus.enTitle,progressDate:Date.now()}})
        }
         
        const userId=req.headers["userid"]
        const tasksList = await calcTasks(userId)
    try{
            res.json({taskData:tasksList,message:taskId?"Task Updated":"Task Created",
        result:sepidarResult,sepidarQuery:sepidarQuery,userData:adminData})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-bulk',auth,jsonParser,async (req,res)=>{
    const orderList = req.body.orders
    const status = req.body.status
    if(!orderList||!orderList.length){
        res.status(400).json({error:true,message:"سفارش وارد نشده است"})
    }
    var result = []
    for(var i=0;i<orderList.length;i++){
        const orderData = await cart.findOne({cartNo:orderList[i].orderNo})
        const taskData = await tasks.findOne({taskNo:orderList[i].orderNo})
        if(taskData&&taskData.taskStep =="done"){
        const sepidarResult = await SepidarOrder(orderList[i])
        result.push(sepidarResult)
        }
        else{ 
            result.push({orderNo:orderList[i].orderNo,message:"وضعیت درست ارسال نشده است"})
        }
        
    }
    res.json({data:result,message:"بروزرسانی تجمعی"})
})
const findNext=(index,status)=>{
    if(status=="accept"){
        if(index===0) return(2)
        else
            return(index+1)
    }
    if(status=="sepidar")
        return(6)
    if(status=="edit"){
        return(1)
    }
}
router.post('/find-bulk',auth,jsonParser,async (req,res)=>{
    var orderList = req.body.orders
    const status = req.body.status
    if(!orderList||!orderList.length){
        var orderListTemp = await tasks.find({taskStep:status})
        orderList = orderListTemp.map(item=>item.orderNo)

    }
    var result = []
    var classOrder=[]
    const orderData = await cart.aggregate([
        {$match:{cartNo:{$in:orderList}}}
    ])
    //const taskData = await tasks.find({orderNo:{$in:orderList}})
    for(var i=0;i<orderData.length;i++){
        var orderItems = orderData[i].cartItems
        for(var j=0;j<orderItems.length;j++){
            classOrder = await ClassifyOrder(classOrder,orderItems[j])
        }
    }
    //const mergeValue = await MergeCarts(orderData)
    
    res.json({data:classOrder,message:"اطلاعات تجمعی"})
})

router.post('/update-checkList',auth,jsonParser,async (req,res)=>{
    const taskId = req.body._id?req.body._id:""
    const body = req.body
    try{
        if(taskId)
            await tasks.updateOne({_id:taskId},{$set:body})
        else{
            const crmData = await crmlist.findOne()
            const crmStep = crmData.crmSteps.find(item=>item.index==1)
            await tasks.create({...body,taskStep:crmStep.enTitle})
 
        }
        const userId=req.headers["userid"]
        const tasksList = await calcTasks(userId)
       res.json({taskData:tasksList,message:taskId?"Task Updated":"Task Created"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/list-crm',jsonParser,async (req,res)=>{
    var pageSize = req.body.pageSize?req.body.pageSize:"10";
    var offset = req.body.offset?(parseInt(req.body.offset)):0;
    try{const data=req.body

        const reportList = await crmlist.find()
         
       res.json({filter:reportList,size:reportList.length})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
}) 

router.post('/change-state',jsonParser,async (req,res)=>{
    try{
        const taskId=req.body.taskId
        const body = {
            taskStep:req.body.state,
            prior:req.body.prior,
            progressDate:Date.now()
        }
        const task = await tasks.findOne({_id:taskId})
        const taskUpdate = await tasks.updateOne({_id:taskId},
            {$set:{...body}})
        
       res.json({task:task,filter:taskUpdate,message:"task Updated"})
    }
    catch(error){
        res.status(500).json({message: error.message})
    } 
})
router.post('/update-crm',auth,jsonParser,async (req,res)=>{
    var crmId = req.body.crmId
    if(crmId==="new")crmId=""
    const data=req.body 
    try{ 
        const CrmItem = crmId&&await crmlist.findOne({_id:ObjectID(crmId)})
        if(CrmItem){
            const result = await crmlist.updateOne({_id:ObjectID(crmId)},{$set:data})
            res.json({data:result,message:"Updated"})
            return
        } 
        else{ 
            const result = await crmlist.create(data)
            res.json({data:result,message:"Created"})
            return
        }
    }
    catch(error){
        res.status(500).json({error: error})
    } 
})

var storage = multer.diskStorage(
    {
        destination: '/dataset/',
        filename: function ( req, file, cb ) {
            cb( null, "Deep"+ '-' + Date.now()+ '-'+file.originalname);
        }
    }
  );
  const uploadImg = multer({ storage: storage ,
    limits: { fileSize: "5mb" }})

router.post('/upload',uploadImg.single('upload'), async(req, res, next)=>{
    const folderName = req.body.folderName?req.body.folderName:"temp"
    try{
        const data = (req.body.base64image)
    // to declare some path to store your converted image
    var matches = await data.match(/^data:([A-Za-z-+./]+);base64,(.+)$/),
    response = {};
    if (matches.length !== 3) {
    return new Error('Invalid input string');
    } 
    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');
    let decodedImg = response;
    let imageBuffer = decodedImg.data;
    let type = decodedImg.type;
    let extension = mime.extension(type);
    
    let fileName = `Sharif-${Date.now().toString()+"-"+req.body.imgName}`;
   var upUrl = `/uploads/${folderName}/${fileName}`
    fs.writeFileSync("."+upUrl, imageBuffer, 'utf8');
    return res.send({"status":"success",url:upUrl});
    } catch (e) {
        res.send({"status":"failed",error:e});
    }
})

router.post('/order-integrity',auth,jsonParser,async (req,res)=>{
    const status = req.body.status
    if(!status){
        res.status(400).json({error:true,message:"وضعیت وارد نشده است"})
        return
    }
    
        const orderList = await faktors.find({status:status})
        const orderFaktorNoList = orderList.map(item=>item.faktorNo)
        const orderItems = await faktorItems.find({faktorNo:{$in:orderFaktorNoList}}).lean()
        const skuList = await MergeOrders(orderItems)
        var classifyData = await ClassifyOrders(skuList)
    try{    var result = [];
        var classOrder = []; 

        res.json({data:skuList,classifyData,message:"لیست سفارشات"})
    }
    catch(error){
        res.send({"status":"failed",error});
    }
})

module.exports = router;