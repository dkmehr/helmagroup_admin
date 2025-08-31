const customers = require("../models/auth/customers");
const faktorItems = require("../models/product/faktorItems");
const GetHesabFa = require("./GetHesabFa");

var ObjectID = require('mongodb').ObjectID;

const CreateHesabfaCustomer=async(customerData)=>{
    
    const query = {
        contact:{
            contactType: 1,
            name: customerData.cName+" "+customerData.sName,
            firstName:customerData.cName,
            lastName:customerData.sName,
            nationalCode:customerData.meliCode,
            address:customerData.Address&&customerData.Address.substring(0, 140),
            city:customerData.city,
            state:customerData.state,
            postalCode:customerData.postalCode,
            //phone:customerData.phone,
            mobile:customerData.phone,
            active:true,
            tag:"مشتری سایت"
        }
    }
    const hesabResult = await GetHesabFa(query,"/contact/save")
    if(hesabResult.Success){
        var result = hesabResult.Result
        faktorResult = await customers.updateOne({phone:customerData.phone},
        {$set:{cCode:result.Code}})
        return(result.Code)
    }   
    else{
        await customers.updateOne({phone:customerData.phone},
        {$set:{query:hesabResult}})
        return({error:hesabResult})
    }
}

module.exports =CreateHesabfaCustomer