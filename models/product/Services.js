const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    title:  String,
    enTitle: String,
    category:String,
    sku:String,
    hesabfa:String,
    
    price:String,
    unit:String,
    
    description:String,
    imageUrl: String,
    thumbUrl: String
})
module.exports = mongoose.model('services',ServiceSchema);