const customers = require("../models/auth/customers");
const faktorItems = require("../models/product/faktorItems");
const faktorService = require("../models/product/faktorService");
const CreateHesabfaCustomer = require("./CreateHesabfaCustomer");

var ObjectID = require('mongodb').ObjectID;

const CalcInvoice=async(invoiceData)=>{
    const faktorItemData = await faktorItems.find({faktorNo:invoiceData.faktorNo})
    const customerData = await customers.findOne({_id:ObjectID(invoiceData.userId)}).lean()

    if(customerData&&!customerData.cCode){
        const customerHesabfa = await CreateHesabfaCustomer(customerData)
        if(customerHesabfa.error)
            return({error:customerHesabfa})
        customerData.cCode = customerHesabfa
    }
    var items = []
    var serialList = []
    for(var i=0;i<faktorItemData.length;i++){
        const fData = faktorItemData[i]
        var faktorServiceData = await faktorService.findOne({faktorItemId:ObjectID(fData._id)})
        var serialNumber = [fData.sku]
        if(serialList&&serialList.find(item=>item==fData.sku)){
            serialNumber = [fData.sku + Math.random()]
        }
        else {
            serialList.push(fData.sku)
            if(fData.sku != fData.ItemID)
                serialNumber.push(fData.ItemID)
        }
        items.push(
            {
                rowNumber: 1,
                description: fData.title,
                itemCode: fData.ItemID,
                unit: 'عدد',
                quantity: fData.count,
                unitPrice: fData.unitPrice,
                discount: fData.discountPrice,
                tax: 0,
                serialNumbers: serialNumber
            }
        )
        if(faktorServiceData)
            items.push(
            {
                rowNumber: 2,
                description: faktorServiceData.title,
                itemCode: faktorServiceData.hesabfa,
                unit: 'عدد',
                quantity: fData.count,
                unitPrice: faktorServiceData.unitPrice,
                tax: 0,
                serialNumbers: [faktorServiceData.hesabfa]
            }
        )
    }
    var dateNow = new Date()
    const discount = Number(invoiceData.totalDiscountCart)
    var disQuery = discount?{
        others : [
                {
                "title": "تخفیف کلی",
                "amount": discount,
                "add": false 
                }
            ]
    }:''
    const query = {
            invoice:{
                reference: invoiceData.faktorNo,
                description:invoiceData.description,
                date: dateNow.toDateString(),
                dueDate: dateNow.toDateString(),
                contactCode: customerData.cCode,
                contactTitle: (customerData.cName?customerData.cName:'')+" "+
                    (customerData.sName?customerData.sName:''),
                note: invoiceData.description,
                sent: false,
                invoiceType: 0,
                status: 2,
                tag: '',
                freight: invoiceData.transportPrice,
                freightPersonCode: '',
                warehouseReceiptStatus: 1,
                project: 'فاحا، وب سایت',
                salesmanCode: 10001,
                salesmanPercent: 30,
                currency: 'IRR',
                invoiceItems: items,
            currency: "IRR",
            taxId: "",
            currencyRate: 1.0000000000,
            ...disQuery
            }
        }
    return(query)
}

module.exports =CalcInvoice