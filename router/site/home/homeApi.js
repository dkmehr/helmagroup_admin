const express = require('express');
const bodyParser = require('body-parser');
const slider = require('../../../models/main/slider');
const MostSale = require('../../../middleware/Functions/MostSale');
const SortFilter = require('../../../middleware/Calc/SortFilters');
const products = require('../../../models/product/products');
const FindCount = require('../../../middleware/Calc/FindCount');
const FindColor = require('../../../middleware/Calc/FindColor');
const UniqueFilter = require('../../../middleware/Calc/UniqueFilters');
const jsonParser = bodyParser.json();
const router = express.Router()
const {StockId,SaleType} = process.env;

router.get('/slider', jsonParser,async (req,res)=>{
    try{
        const sliderList = await slider.find({}).limit(3)

        res.json({data:sliderList,error:[],message:"لیست اسلایدرها"})
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})
router.get('/most-sale', jsonParser,async (req,res)=>{
    try{
        const mostSale = await MostSale()
        //var productData = await productSchema.findOne({sku:sku}).lean()
        for(var m=0;m<mostSale.length;m++){
            var filters ={}
            var productList = await products.find({masterSku:{$in:mostSale[m].sku}}).lean()
            for(var f=0;f<productList.length;f++){
                const stock = await FindCount(productList[f].sku,1)
                if(stock<0) continue
                if(productList[f].filters){
                    var filterData = productList[f].filters
                    for (var prop in filterData) {
                        if(prop == "undefined"||!filterData[prop])continue
                        if(!filters[prop])
                            filters[prop]=[]
                        var outData = await FindColor(filterData[prop])
                        filters[prop].push(outData)
                    }
                }
            }
            var sortFilters = SortFilter(filters)
            var result ={}
            result.size = UniqueFilter(sortFilters.size)
            result.color = UniqueFilter(sortFilters.color)
            mostSale[m].filters = result
        }
        res.json({data:mostSale,error:[],message:"لیست محصولات"})
        
            
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
})

module.exports = router;