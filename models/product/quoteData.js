const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const QuoteDataSchema = new Schema({
    initDate: { type: Date, default: Date.now },
    progressDate: { type: Date },

    manageId:{type:String},
    userId:{type:String},
    description:{type:String},
    discount:{type:Number}
})

module.exports = mongoose.model('quotedata',QuoteDataSchema);