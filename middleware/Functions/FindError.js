const FindError=(error)=>{
    try{
    if(!error)return("")
    if(error.includes("ontact")) return("کاربر در حسابفا پیدا نشد")
    return(error)
    }
    catch{
        return('')
    }
}

module.exports =FindError