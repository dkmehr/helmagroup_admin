const FindColor = require("./FindColor")

const FindQuery=async(queryData)=>{
    var result ={}
    for (var prop in queryData) {
        try{
            
            var finalFilter = await FindColor(queryData[prop])
            var value = finalFilter&&finalFilter.title
            result["filters."+prop] = value
        } catch{}
    }
    var finalResult = ''
    if(result == {}){}
    else
        finalResult = result
    
    return(finalResult)
}

module.exports =FindQuery