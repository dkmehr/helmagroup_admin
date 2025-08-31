
const UniqueFilter=(FilterData)=>{
    var result = []
    if(!FilterData) return([])
    for (var i =0;i<FilterData.length;i++) {
      if(!result.find(item=>item.value == FilterData[i].value)){
        result.push(FilterData[i])
      }
    }
    
    return(result)
}

module.exports =UniqueFilter