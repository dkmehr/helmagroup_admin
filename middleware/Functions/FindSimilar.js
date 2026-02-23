const products = require("../../models/product/products");

const prepareResponse = (i) => {
	const temp = {
		id: i._id || '',
		title: i.title || '',
		sku: i.sku || '',
		ItemID: i.ItemID || '',
        score:i.score ||4.6,
		price: i.sellPrice || '',
		filters: i.filters || {},
        imageUrl:i.imageUrl||'/uploads/default.jpg',
        thumbUrl:i.thumbUrl||'/uploads/default.jpg',
	};
	return temp;
};

const FindSimilar=async(similarArray)=>{
    if(!similarArray || !similarArray.length) return([])

    const productList = await products.find({sku:{$in:similarArray}})
    
    return( productList.map(prepareResponse))
}

module.exports =FindSimilar