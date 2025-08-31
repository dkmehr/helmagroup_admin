const NormalNumber=(numberRaw)=>{
    if(!numberRaw) return(0)
    var number = numberRaw.toString().replace(/\//g,'.')
    const RoundPrice = Math.round(parseFloat(number)/100)
    const result = parseInt(RoundPrice)*100
    return(result)
}

module.exports =NormalNumber