
const Razorpay = require('razorpay')
const shortid = require("shortid")


const razorpay = new Razorpay({
    key_id: 'rzp_test_N4U2FpYbwFQfeW',
    key_secret: '6vX2Mn6vzmt3HbsQGqbPaDKW',
});


exports.razorpayPayment = async (req,res) =>{

    const { products } = req.body;
    //
    // products.forEach((product,index)=>{
    //     console.log("name => ",product.name," price => ",product.price," category => ",product.category.name," stock => ",product.stock)
    // })

    let amount = 0;
    products.map(p => {
        amount = amount + p.price;
    });
    const payment_capture = 1
    const options = {
        amount: (amount*100).toString(),
        currency:"INR",
        receipt:shortid.generate(),
        payment_capture:payment_capture
    }
    try{
        const response = await  razorpay.orders.create(options)
        res.json({
            id:response.id
        })
    }
    catch (e) {
        console.log(e)
    }
}


exports.getPaymentInfo = async  (req,res)=>{
    const {order_id} = req.body
    console.log("orderId => ",order_id)
    let paymentType = ""
    try {
        const response = await razorpay.orders.fetchPayments(order_id)
        if(response){

            let length = response.items.length
            while (length) {
                if (response.items[length - 1].bank !== null) {
                    paymentType = "Net Banking"
                } else if (response.items[length - 1].wallet !== null) {
                    paymentType = "Wallet Payment"
                } else if (response.items[length - 1].card_id !== null) {
                    paymentType = "Card Payment"
                } else {
                    paymentType = "Upi payment"
                }
                length = length - 1
            }
            console.log("paymentType => ", paymentType)
        }
        res.json(paymentType)
    }
    catch (e) {
        console.log(e)
    }
}

//
// "card_id": null,
//     "bank": null,
//     "wallet": null,
//     "vpa": "vishal@upi",