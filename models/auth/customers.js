const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  username: { type: String,default:""},
  cName: { type: String,default:""},
  sName:{ type: String,default:""},
  phone: { type: String, unique: true },
  password: { type: String ,default:""},
  mobile:{type: String ,default:""},
  email: { type: String,default:""},
  profile:{type:String,default:""},
  class: {type:Array,default:[]},
  access:{type:String,default:"customer"},
  group: { type:String ,default:""},
  groupCode: { type:String ,default:""},
  credit: { type: String ,default:""},
  token: { type: String ,default:""},
  otp:{ type: String , default: null },
  active:{ type: Boolean ,default:false},
  business:{ type: Boolean ,default:false},
  
  status:{ type: String ,default:""},
  cCode:{ type: String ,default:""},
  birthDay:{ type: Object ,default:{}},
  Address:{ type: String ,default:""},
  AddressID:{ type: String ,default:""},
  meliCode:{ type: String ,default:""},  
  postalCode:{ type: String,default:""},   
  
  state:{ type: String ,default:""},
  stateId:{ type: String ,default:""},
  city:{ type: String ,default:""},
  cityId:{ type: String ,default:""},

  type:{ type: String ,default:""},
  agent:{ type: String ,default:""},
  business:{ type: Boolean ,default:false},
  Liability:{ type: String ,default:""},
  Credits:{ type: String ,default:""},
  query:{ type: Object },
  date:{type:Date,default:Date.now()} 
});

module.exports = mongoose.model("customers", customerSchema);