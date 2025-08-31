const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema({
  title: { type: String},
  enTitle:{type:String,unique:true},
  content: { type: String},
  abstract: { type: String},
  link:{type:String, default:"#"},
  imageUrl: { type: String},
  thumbUrl: { type: String},
  uploadUrl: { type: String},
  iconUrl:{ type: String},
  date:{type:Date,default:Date.now()}
}); 

module.exports = mongoose.model("news", newsSchema);