const mongoose = require("mongoose");

const priceSchema = new mongoose.Schema({
  price:{ type: Number},
  
  description: { type: String},

  date:{type:Date}
});

module.exports = mongoose.model("price", priceSchema);