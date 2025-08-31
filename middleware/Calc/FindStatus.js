const crmlist = require("../../models/crm/crmlist")

const FindStatus=async(enStep,limit)=>{
    const crmData = await crmlist.findOne()
    if(!crmData) return('')
    var steps = crmData.crmSteps
    if(limit){
        if(enStep == "quote" || enStep=="edit")  enStep ="inprogress"
        if(enStep == "prepair" || enStep == "pay")  enStep ="accept"
        if(enStep == "done" || enStep == "archive")  enStep ="send"
    }
    const faStep = steps.find(item=>item.enTitle==enStep)
    if(faStep){
        return(faStep.title)
    }
    else
        return('')
}

module.exports =FindStatus