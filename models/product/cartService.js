const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const CartServiceSchema = new Schema({
    initDate: { type: Date, default: Date.now },
    userId:{ type: String },
    cartId:{ type: String },
    description:{type:String},
    sku:{type:String}
},{ strict: false });
module.exports = mongoose.model('cartservice',CartServiceSchema);