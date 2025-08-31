var tax = process.env.TaxRate

const PureNumber=(number)=>{
    var result = parseInt(number.replace(/\D/g,''))
    return(result)
}

module.exports =PureNumber