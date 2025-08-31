const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const FaktorServiceSchema = new Schema({
    initDate: { type: Date, default: Date.now },
    userId:{ type: String },
    description:{type:String},
    faktorItemId:{type:String},
    sku:{type:String}
},{ strict: false });
module.exports = mongoose.model('faktorservice',FaktorServiceSchema);