const SearchPhrase=(search)=>{
    const searchArray = search?search.split(' '):''
    var searchItems = []
    var searchInfo = []
    for(var i =0;i<(searchArray&&searchArray.length);i++){
        searchItems.push({title:new RegExp(".*" + searchArray[i] + ".*" ,"i") }) 
        searchInfo.push({info:new RegExp(".*" + searchArray[i] + ".*" ,"i") }) 
    }
    const searchPhrase = {"$or":[{"$and":searchItems},{"$and":searchInfo}]}
    return(searchPhrase)
}

module.exports =SearchPhrase