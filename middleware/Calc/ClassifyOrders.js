const products = require("../../models/product/products")

const ClassifyOrders=async(orderData)=>{
    var result = []

    for(var i=0;i<orderData.length;i++){
        var totalData = orderData[i]
        const cIndex = result.findIndex(item => item.catCode == totalData.catCode)
    //var classResult = totalData
    if (cIndex == -1) {
        result.push({
            catCode: totalData.catCode,
            catName: totalData.catName,
            data: [{
                masterSku: totalData.masterSku,
                masterName: totalData.masterName,
                data: [{
                    count: totalData.count,
                    ...totalData
                }
                ]
            }
            ]
        })
    }
    else {
        const mIndex = result[cIndex].data.findIndex(item => item.masterSku == totalData.masterSku)
        //console.log(totalData[bIndex])
        //console.log(bIndex,iIndex)
        if (mIndex == -1) {
            result[cIndex].data.push(
                {
                    masterSku: totalData.masterSku,
                    masterName: totalData.masterSku,
                    data: [{
                        count: totalData.count,
                        ...totalData
                    }
                    ]
                })
        }
        else {
                sku = {
                    count: totalData.count,
                    ...totalData
                }

                result[cIndex].data[mIndex].data.push(sku)
            }
        }
    }


    return(result)
}

module.exports =ClassifyOrders