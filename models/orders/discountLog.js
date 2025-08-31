const mongoose = require("mongoose");

const DiscountLogSchema = new mongoose.Schema({
  userId:{type: String},
  manageId: {type: String},
  product:{type:String},
  category:{type:String},
  status:{type:String},

  active:{ type: Boolean },
  discount: {type: Number},

  date:{ type: Date ,default:Date.now()},
});

module.exports = mongoose.model("discountLog", DiscountLogSchema);