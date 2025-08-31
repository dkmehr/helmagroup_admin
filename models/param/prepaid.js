const mongoose = require("mongoose");

const prepaidSchema = new mongoose.Schema({
  percent:{ type: Number},
  date:{type:Date,default:Date.now()}
});

module.exports = mongoose.model("prepaid", prepaidSchema);