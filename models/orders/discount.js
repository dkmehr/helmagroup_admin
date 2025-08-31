const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema({
  userId:{type: String},
  manageId: {type: String},
  username:{type:String},

  phone:{type:String},
  product:{type:String},
  productName:{type:String},
  category:{type:String},
  categoryName:{type:String},

  active:{ type: Boolean ,default:true},
  discount: {type: Number},
  description:{ type: String },

  date:{ type: Date ,default:Date.now()}, 
  expire:{ type: Date},
});

module.exports = mongoose.model("discount", DiscountSchema);