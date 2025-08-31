const faktor = require("../../models/product/faktor")
const faktorItems = require("../../models/product/faktorItems")
const jMoment = require('moment-jalaali');

const ListFaktor=async(userId,manageId,dataArray={})=>{
    const {search,customer,offset=0,pageSize=10,dateFrom=[],dateTo=[]}=dataArray
   var size = 0
    const fromDate = dateFrom[0] ? jMoment(`${dateFrom[0]}-${dateFrom[1]}-${dateFrom[2]}`).toISOString() : '';//jMoment().startOf('day').toISOString();
        const toDate = dateTo[0] ? jMoment(`${dateTo[0]}-${dateTo[1]}-${dateTo[2]}`).toISOString() : '';//jMoment().endOf('day').toISOString();
        const matchCondition = {
			//manageId,
		};
        if(fromDate){
            matchCondition.initDate={ $gte: new Date(fromDate), $lte: new Date(toDate)}
        }
		if (userId) {
			matchCondition.userId = userId;
		}
        if (search) {
            matchCondition['$or'] = [
                { 'faktorNo': { $regex: search } },
                { 'ItemId': { $regex: search } },
            ]
        }

    const aggregation = [
        { $match: matchCondition },
        { $sort: { initDate: -1 } },
        { $skip: Number(offset) },
        { $limit: Number(pageSize) },
    ];
    const faktorList = await faktor.aggregate([
        aggregation,
        /*{
            $facet: {
                totalSize: [{ $count: 'totalSize' }],
                result: [
                    { $sort: { initDate: -1 } },
                    { $skip: skip },
                    { $limit: limit },
                    { $addFields: { userId: { $toObjectId: '$userId' } } },
                ]
            }
        }
        {
            $lookup: {
                from: 'productprices',
                localField: 'ItemID',
                foreignField: 'ItemID',
                as: 'priceData',
            },
        },*/
        
    ]);
    const faktorSize = await faktor.aggregate([
        { $match: matchCondition }
    ])
    size = faktorSize.length
    return({faktors:faktorList,size,matchCondition,
            message:"لیست فاکتورها"})
}

module.exports =ListFaktor