const price = require("../models/price");

const FindPrice=async()=>{
    const cPrice = await price.findOne().sort({date:-1});
    return(cPrice&&parseInt(cPrice.price)) 
}

module.exports =FindPrice