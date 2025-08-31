const express = require('express');
const router = express.Router();
const zarin = require('../middleware/ZarinPal');

//payment
router.get('/testPay', (req,res)=>{
    res.json("test")
});
router.get('/zarin', zarin.pay);
router.get('/test/:credit',(req, res) => {
    res.render('index.ejs');
});
router.get('/callback', zarin.callBack);
//router.post('/mellatBankCallback', mellatBank.callBack);



module.exports = router;