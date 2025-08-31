const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema({
  title:{ type: String},
  enTitle:{ type: String},
  payValue:{type:String},
  orderNo:{type:String},
  userId:{type:String},
  bankCode:{type:String},
  description:{type:String},
  date:{type:Date,default:Date.now()}
});

module.exports = mongoose.model("bank", bankSchema);