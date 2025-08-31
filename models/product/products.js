const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title:  { type: String},
    sku: { type: String , unique: true},
    ItemID:{ type: String},
    enTitle:String,
    weight:String,
    imageUrl: {type:String},
    thumbUrl: {type:String},
    offer:Boolean,
    description:String,
    productUrl:String,
    metaTitle:String,
    productMeta:String,
    filters:Object,
    fullDesc:String,
    stock:Number,
    buyPrice:Number,
    sellPrice:Number,
    active:{type:Boolean,default:false},
    unit:String,
    nodeName:String,
    nodeId:Number,

    masterSku:String,
    isMaster:{type:Boolean,default:false},
    priceList:{type:Array,default:[]}, 
    categories:{type:Array,default:[]}
})
module.exports = mongoose.model('product',ProductSchema);