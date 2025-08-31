const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const FaktorSchema = new Schema({
    faktorNo:{ type: String },
    initDate: { type: Date, default: Date.now },
    progressDate: { type: Date },
    userId:{ type: String },
    manageId:{ type: String },
    cName:{ type: String },
    mName:{ type: String },
    phone:{ type: String },
    clientStatus:{ type: Object },
    manageId:{ type: String },
    customerID:{ type: String },
    status:{ type: String },
    transportId:{ type: String },
    transportName:{ type: String },

    totalPrice:{ type: String },
    servicePrice:{ type: String },
    transportPrice:{ type: Number },
    fullPrice:{ type: String },
    totalDiscount:{ type: String },
    totalData:{ type: Object },
 
    transportWay:{ type: String },
    transportBarCode:{ type: String },
    transportImage:{ type: String },
    transportPhone:{ type: String },
    unitPrice:{ type: String },
    priceDetail:{ type: Object },
    InvoiceID:{ type: String },
    InvoiceNumber:{ type: String },
    totalCount:{ type: String },
    totalWeight:{ type: String },
    isActive:{ type: Boolean },
    isEdit:{ type: Boolean },
    isRecieved:{ type: Boolean ,default:false},
    query:{ type: Object },
    error:{ type: String },
    result:{ type: Object },
    waitPay:{type:Boolean},
    Authority:{ type: String },
    payQuery:{ type: Object },
    discount:{ type: String },
    totalDiscountCart:{ type: String },
    description:{ type: String }
})
module.exports = mongoose.model('faktor',FaktorSchema);