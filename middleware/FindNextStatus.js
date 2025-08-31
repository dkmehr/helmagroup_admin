const ProfileAccess = require("../models/auth/ProfileAccess");
const crmlist = require("../models/crm/crmlist");

var ObjectID = require('mongodb').ObjectID;

const FindNextStatus=async(faktorItem,body)=>{
    const crmData = await crmlist.findOne()
    const crmSteps=crmData.crmSteps
    const index = crmSteps.findIndex(item=>item.enTitle==faktorItem.status)
    var nextStatus= faktorItem.status
    if(body.value==1){
        var nextIndex = index
        if(index==0) nextIndex= 3
        if(index==1) nextIndex= 3
        if(index==2) nextIndex=3
        if(index==3) nextIndex=4
        if(index==4) nextIndex=5
        if(index==5) nextIndex=6
        var nextStatus= faktorItem.status
        try{
            nextStatus=crmSteps[nextIndex]
        }catch{}
    }
    if(body.value==2){
        var nextStatus= faktorItem.status
        nextStatus=crmSteps[2]
    }
    if(body.value==-1){
        var nextStatus= faktorItem.status
        nextStatus=crmSteps[7]
    }
    return(nextStatus)
}
module.exports =FindNextStatus