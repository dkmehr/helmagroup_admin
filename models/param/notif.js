const mongoose = require("mongoose");
 
const notifSchema = new mongoose.Schema({
  title: { type: String,required:true},
  orderNo:{ type: String},
  userId:{ type: String,required:true},
  customerId:{ type: String},
  status:{type:Boolean,default:1},
  content: { type: String},
  kind:{ type: String},
  link:{type:String, default:"#"},
  imageUrl: { type: String},
  date:{type:Date,default:Date.now()}
}); 

module.exports = mongoose.model("notif", notifSchema);