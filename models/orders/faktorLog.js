const mongoose = require("mongoose");

const FaktorLogSchema = new mongoose.Schema({
  userId:{type: String},
  faktorNo: {type: String},
  logType: {type: String},
  status: {type: String},
  preStatus:{type: String},
  change:{type: Object},
  message:{type: String},
  error:{type: String},
  query:{type: Object},
  date:{ type: Date,default:Date.now()}
});

module.exports = mongoose.model("faktorlog", FaktorLogSchema);