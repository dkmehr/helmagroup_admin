var Kavenegar = require('kavenegar');
var api = Kavenegar.KavenegarApi({
  apikey: process.env.SMS_API
});

const SendSMS=async(phone,template,token,token2)=>{
    const result = api.VerifyLookup({
        token: token,
        token2:token2,
        template: template,
        receptor: phone 
    },function(response, status) {
        console.log(response)
        console.log(status)
        return(response,status);
    });
    return result
}

module.exports =SendSMS