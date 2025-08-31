const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema({
  percent:{ type: Number},
  date:{type:Date,default:Date.now()}
});

module.exports = mongoose.model("tax", taxSchema);