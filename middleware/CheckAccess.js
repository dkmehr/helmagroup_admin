const ProfileAccess = require("../models/auth/ProfileAccess")
var ObjectID = require('mongodb').ObjectID;

const CheckAccess=async(userData)=>{
    if(userData.access=="manager"){
        return(10)
    }
    if(userData.profile){
        var pAccess = await ProfileAccess.findOne({_id:ObjectID(userData.profile)})
        var accessList = pAccess&&pAccess.access
        if(accessList&&accessList.length){
            var foundAccess = accessList.find(item=>item.title=="Orders")
            if(foundAccess){
                if(foundAccess.state =="full") return(7)
                if(foundAccess.state =="edit") return(5)
                if(foundAccess.state =="read") return(3)
            }
        }
    }
    return(0)

}
module.exports =CheckAccess