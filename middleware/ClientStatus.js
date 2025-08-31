const ClientStatus=(result)=>{
    if(!result||result.error) return({detail:{},
        remain:0})
    if(result.MandeHesab&&result.MandeHesab[0]){
        var detail = result.MandeHesab[0]
        var remain = parseInt(detail.MandeyeMali)
        return({detail:detail,
            remain:remain})
        }
    return({detail:{},
        remain:0})
    
}

module.exports =ClientStatus