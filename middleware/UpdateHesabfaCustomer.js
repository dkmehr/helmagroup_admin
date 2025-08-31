
const GetHesabFa = require("./GetHesabFa");

var ObjectID = require('mongodb').ObjectID;

const UpdateHesabfaCustomer=async(customerData)=>{
    
    const query = {
        contact:{
            code:customerData.cCode,
            name: customerData.cName+" "+customerData.sName,
            firstName:customerData.cName,
            lastName:customerData.sName,
            nationalCode:customerData.meliCode,
            address:customerData.Address,
            city:customerData.city,
            state:customerData.state,
            postalCode:customerData.postalCode,
            //phone:customerData.phone,
            mobile:customerData.phone
        }
    }
    const hesabResult = await GetHesabFa(query,"/contact/save")
    if(hesabResult.Success){
        var result = hesabResult.Result
        return({result,query})
    }   
    else return({result:hesabResult,query})
}

module.exports =UpdateHesabfaCustomer