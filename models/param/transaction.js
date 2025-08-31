const mongoose = require("mongoose");

const transSchema = new mongoose.Schema({
  title:{ type: String},
  bankCode:{ type: String},
  userId:{type:String},
  orderNo:{type:String},
  payValue:{type:String},
  description:{type:String},
  result:{type:[Object]},
  status:Boolean,
  query:{type:Object},
  hesabResult:{type:Object},

  date:{type:Date,default:Date.now()}
});

module.exports = mongoose.model("transaction", transSchema);