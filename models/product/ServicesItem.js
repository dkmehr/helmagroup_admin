const mongoose = require('mongoose');

const ServiceItemSchema = new mongoose.Schema({
    title:  String,
    enTitle: String,
    serviceCode:String,

    type:String,
    cartId:String,
    unit:String,
    options:Array,
    
    description:String,
    imageUrl: String,
    thumbUrl: String
})
module.exports = mongoose.model('serviceitem',ServiceItemSchema);