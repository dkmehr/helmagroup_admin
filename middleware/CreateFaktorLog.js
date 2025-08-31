const faktorLog = require("../models/orders/faktorLog")


const CreateFaktorLog = async(userId,faktorNo,logType,status,preStatus,message,query)=>{
    await faktorLog.create({
        userId:userId,
        faktorNo: faktorNo,
        logType: logType,
        status: status,
        preStatus:preStatus,
        change:"",
        message:message,
        error:"",
        query:query,
        date:Date.now()
    })
    return({message:"Log Created"})
}

module.exports =CreateFaktorLog