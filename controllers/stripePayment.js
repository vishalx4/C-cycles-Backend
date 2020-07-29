
const stripe = require("stripe")("sk_test_51H7bRAHCm1SpCjm9M5DOGxnt53kPbwy51Prypb20zhLEKUBNguaQ9ckeUpjKxrIOtFLBIcdwYucvgG0cmcBI5rqX00dC5hS8Tw");

const { v4: uuidv4 } = require('uuid');

exports.makePayment = (req, res) => {

    // grab the products and token from front end
    const { products, token } = req.body;

    products.forEach((product,index)=>{
        console.log("name => ",product.name," price => ",product.price," category => ",product.category.name," stock => ",product.stock)
    })

    // calculate the amount from products
    let amount = 0;
    products.map(p => {
        amount = amount + p.price;
    });

    console.log("amount => ",amount)
    console.log("email => ",token.email)


    const idempotencyKey = uuidv4();


    // 1) create payment
    // 2) charge the user
    return stripe.customers
        .create({
            email: token.email,
            source: token.id
        })
        .then(customer => {
            stripe.charges
                .create(
                    {
                        amount: amount*100,
                        currency: "inr",
                        customer: customer.id,
                        receipt_email: token.email,
                        description: `Purchased the product`,
                        shipping: {
                            name: token.card.name,
                            address: {
                                line1: token.card.address_line1,
                                line2: token.card.address_line2,
                                city: token.card.address_city,
                                country: token.card.address_country,
                                postal_code: token.card.address_zip
                            }
                        }
                    },
                    {idempotencyKey}
                )
                .then(result => res.status(200).json(result))
                .catch(err => console.log(err));
        })
        .catch(console.log("FAILED"));
};
