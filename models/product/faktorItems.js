const mongoose = require('mongoose');

var Schema = mongoose.Schema;

const FaktorItems = new Schema({
    faktorNo:{ type: String },
    initDate: { type: Date, default: Date.now },
    cName:{ type: String },
    transportType:{ type: String },
    transportTypeFa:{ type: String },
    transportCode:{ type: String },
    peykName:{ type: String },
    peykPhone:{ type: String },
    factory:{ type: String },
    invoiceId:{ type: String },
    
    phone:{ type: String },
    status:{ type: String },
    enTitle:{ type: String },
    progressDate: { type: Date },
    sku:{ type: String },
    ItemID:{ type: String },
    
    discount:{ type: String }, 
    discountPrice:{ type: String }, 
    totalPrice:{type:String},
    totalDiscount:{ type: String }, 
    servicePrice:{ type: String },
    price:{ type: String },  
    unitPrice:{ type: String },
    priceDetail:{ type: Object },
    fullPrice:{ type: String },  

    weight:{ type: String },
    title:{ type: String },
    purchaseType:{type:String},
    count:{type:Number},
    description:{type:String},
    result:{ type: Object },

    isActive:{ type: Boolean },
    isEdit:{ type: Boolean },
    isRecieved:{type: Boolean},
    recieveCount:{type: Number},
    recieveDate:{ type: Date },

    payStatus:{ type: String }, //unpaid, deposit , paid
    waitPay:{type:Boolean},
    deposit:{ type: String },
    depositDate:{ type: Date },
    depositTransaction:{ type: String }
})
module.exports = mongoose.model('faktorItems',FaktorItems);