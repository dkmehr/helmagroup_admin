const mongoose = require('mongoose');

const ColorSchema = new mongoose.Schema({
    title:  String,
    enTitle:String,
    active:Boolean,
    colorCode:String
})
module.exports = mongoose.model('colors',ColorSchema);