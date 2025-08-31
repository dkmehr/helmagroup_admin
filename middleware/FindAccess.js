const ProfileAccess = require("../models/auth/ProfileAccess")

var ObjectID = require('mongodb').ObjectID;

const FindAccess=async(user)=>{
    try{
        if(!user) return([])
        const profileData = await ProfileAccess.findOne({_id: ObjectID(user)})
        if(!profileData) return([])
        const profileAccess = profileData.access
        return(profileAccess)
    }
    catch{
        return([])
    }
}
module.exports =FindAccess