const { default: fetch } = require("node-fetch");

const { hesabServer, hesabApi,tokenApi} = process.env;

const GetTahHesab=async(rawBody,url)=>{
    var header = {"Content-Type":"application/json"}
    const body = {...rawBody,"apiKey":hesabApi,
        "loginToken":tokenApi,}
    var response = '';
    try{   response = await fetch(hesabServer+url,
            {method: 'POST' ,headers:header,
        body:JSON.stringify(body)});
        const result = await response.json();
        
         return(result)
    } 
    catch(error){
        console.log("error: ",error) 
        return({error:error})
    }
}

module.exports =GetTahHesab