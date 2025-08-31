const notif = require("../models/param/notif")


const CreateNotif = async(data,user,type,linkRaw,kind,thumb,content,customerId)=>{
    var link = linkRaw?linkRaw:"#"
    await notif.create({
        title:data,
        kind:kind,
        orderNo:data,
        userId:user,
        customerId:customerId,
        status:1,
        content: content,
        link:link,
        imageUrl: thumb,
    })
    return({message:"Notif Created"})
}

module.exports =CreateNotif