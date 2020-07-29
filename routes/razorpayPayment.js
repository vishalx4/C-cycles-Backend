const express = require('express')
const router = express.Router()

const {razorpayPayment,getPaymentInfo} = require("../controllers/razorpayPayment")






router.post("/razorpay",razorpayPayment)

router.post("/razorpay/bankdetails",getPaymentInfo)




module.exports = router