const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
var ObjectID = require('mongodb').ObjectID;
const jsonParser = bodyParser.json();
const router = express.Router()
const auth = require("../middleware/auth");
const User = require("../models/auth/users");
const loginLogSchema = require('../models/auth/logs')
const LogCreator = require('../middleware/LogCreator')
const sendMailBrevo = require('../middleware/sendMail');
const sendMailRegBrevo = require('../middleware/sendMailReg');
const sendMailChangeEmailBrevo = require('../middleware/sendMailChange');
const task = require('../models/main/task');
const customers = require('../models/auth/customers');
var Kavenegar = require('kavenegar');
const address = require('../models/auth/address');
const orders = require('../models/orders/orders');
const CreateNotif = require('../middleware/CreateNotif');
const users = require('../models/auth/users');
var api = Kavenegar.KavenegarApi({
  apikey: process.env.SMS_API
});

router.post('/login',jsonParser, async (req,res)=>{
    try {
        const { username, password } = req.body;
        if (!(username && password)) {
          res.status(400).json({error:"All input is required"});
          return;
        }
        // Validate if user exist in our database
        const user = await User.findOne({username: username });
        //console.log(user)
        if(!user){
          res.status(400).json({error:"user not found"});
          return;
        }
        if(!user.password){
          res.status(400).json({error:"password not set"});
          return;
        }
        if(user.active==="false"){
          res.status(400).json({error:"user not active"});
          return;
        }
        if (user && (await bcrypt.compare(password, user.password))) {
          const token = jwt.sign(
            { user_id: user._id, username },
            process.env.TOKEN_KEY,
            {expiresIn: "72h",}
          );
          user.token = token;
          res.status(200).json(user);
          return;
        }
        if (user && password===user.password){
          const token = jwt.sign(
            { user_id: user._id, username },
            process.env.TOKEN_KEY,
            {expiresIn: "48h",}
          );
          user.token = token;
          res.status(200).json(user);
          return;
        }
        else{
          res.status(400).json({error:"Invalid Password"}); 
        }
        } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})
router.post('/login-customer',jsonParser, async (req,res)=>{
    try {
        const { username, password } = req.body;
        if (!(username && password)) {
          res.status(400).json({error:"All input is required"});
          return;
        }
        // Validate if user exist in our database
        const user = await customers.findOne({phone: username });
        //console.log(user)
        if(!user){
          res.status(400).json({error:"user not found"});
          return;
        }
        if(!user.password){
          res.status(400).json({error:"password not set"});
          return;
        }
        if(user.active==="false"){
          res.status(400).json({error:"user not active"});
          return;
        }
        if (user && (await bcrypt.compare(password, user.password))) {
          const token = jwt.sign(
            { user_id: user._id, username },
            process.env.TOKEN_KEY,
            {expiresIn: "72h",}
          );
          user.token = token;
          res.status(200).json(user);
          return;
        }
        if (user && password===user.password){
          const token = jwt.sign(
            { user_id: user._id, username },
            process.env.TOKEN_KEY,
            {expiresIn: "48h",}
          );
          user.token = token;
          res.status(200).json(user);
          return;
        }
        else{
          res.status(400).json({error:"Invalid Password"}); 
        }
        } 
    catch(error){
        res.status(500).json({message: error.message})
    }
})

router.post('/customer-otp',jsonParser,async(req,res)=>{
  var smsResult = ''
  try {
    const {  username } = req.body;
    const phone = username
    ////console.log((phone)
    var otpValue = Math.floor(Math.random() * 8999)+1000 ;
    
    const user = await customers.findOne({phone: username });
    ////console.log((otpValue)
    if(user){
      
  smsResult =api.VerifyLookup({
        token: otpValue,
        template: process.env.template,//"mgmVerify",
        receptor: phone
    },function(response, status) {
        console.log(response);
        console.log(status);
    });
      const newUser = await customers.updateOne(
        {phone:phone},{$set:{otp:otpValue}});
        ////console.log((newUser)
      res.status(200).json({message:"sms sent for "+phone});
    }
    else {
      smsResult = api.VerifyLookup({
        token: otpValue,
        template: process.env.template,//"mgmVerify",
        receptor: phone 
    },function(response, status) {
        console.log(response);
        console.log(status);
    });
      const newUser = await customers.create(
        { username:phone,
          phone:phone,
          otp:otpValue,
          email:phone+"@fahascrub.com",
          date:Date.now()});
      //res.status(200).json({"error":"user not found"});
      const newUserLog = await loginLogSchema.create({
        title: "ثبت مشتری جدید",
        user: newUser._id,
        phone: phone,
        kind:"crm",
        description: "کاربر با شماره تماس "+phone+ "در سامانه ثبت نام کرده است",
        status: "unread",
        date:Date.now()
      })
      const managerList = await users.find({access:"manager"})
      for(var i=0;i<managerList.length;i++)
        await CreateNotif("کاربر جدید",managerList[i]._id,"","","users","",
          "کاربر جدیدی با شماره موبایل "+phone+"در سایت ثبت نام کرده است",
          newUser._id)
      
      res.status(200).json({message:"welcome to sharif, sms sent for "+phone,
      smsResult:smsResult});
    }
  }
  catch (error){
    res.status(400).json({message:"login error",error:error,
    smsResult:smsResult});
  }
})


router.post('/login-otp',jsonParser,async(req,res)=>{
try {
  // Get user input
  const { username, otp } = req.body;

  // Validate user input
  if (!(username && otp)) {
    res.status(400).send({error:"تمامی مقادیر باید وارد شوند"});
    return;
  }
  // Validate if user exist in our database
  const user = await customers.findOne({phone: username }).lean();
  ////console.log((user , phone)
  if (user && otp===user.otp) {
    // Create token
    const token = jwt.sign(
      { user_id: user._id, username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "6h",
      }
    );

    // save user token
    user.token = token;

    // user
    res.status(200).json({...user,message:"وارد شدید"});
    return;
  }
  if(user && otp!==user.otp){
    res.status(200).json({error:"کد یکبار مصرف اشتباه است"});
  }
  //res.status(400).send("Invalid Credentials");
} catch (err) {
  //console.log((err);
}
})

router.post('/active-user',jsonParser, async (req,res)=>{

  try {
        const userData = await User.findOne({otp:req.body.otp});
        if(userData){
          await User.updateOne({otp:req.body.otp},
            {$set:{active:"true",otp:""}});
          res.status(200).json({user:userData,message:"User Activated"})
          }
        else{
          res.status(500).json({error:"Expired OTP"})
        }
      } 
  catch(error){
      res.status(500).json({message: error.message})
  }
})
router.post('/change-password',auth,jsonParser, async (req,res)=>{
  try {
    const userId = req.body.userId?req.body.userId:req.headers["userid"]
      const data = {
        oldPass: req.body.oldPass,
        newPass: req.body.newPass,
        confPass: req.body.confPass,
        date: Date.now()
      }
      if(!data.confPass||!data.newPass){
        res.status(400).json({error:"not enough",message:"اطلاعات کامل نیست"})
        return
      }
      if(data.newPass === data.confPass){
        //var encryptedOld = await bcrypt.hash(data.oldPass, 10);
        var userOwner = await User.findOne({_id:ObjectID(userId)});
        if(!userOwner)
          userOwner = await customers.findOne({_id:ObjectID(userId)});
        const passCompare = 1//await bcrypt.compare(encryptedOld,userOwner.password)
        
        if(passCompare){
          var encryptedNew = await bcrypt.hash(data.newPass, 10);
          await User.updateOne({_id:ObjectID(userId)},
          {$set:{password:encryptedNew}})
          await customers.updateOne({_id:ObjectID(userId)},
          {$set:{password:encryptedNew}})

          res.status(200).json({user:encryptedNew,message:"پسورد تغییر یافت"})
        }
        else{
          res.status(400).json({error:"Wrong Password",message:"پسورد اشتباه است"});
        }
      }
      else{
        res.status(400).json({error:"Not Equal Passwords",message:"پسورد یکسان نیست"});
      }
    } 
  catch(error){
      res.status(500).json({message: error.message})
  }
})

module.exports = router;