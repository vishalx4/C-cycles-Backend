const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const productCartSchema = new mongoose.Schema({
    product:{
        type:ObjectId,
        ref:"Product"
    },
    name:String,
    count:Number,
    price:Number
})

const ProductCart = mongoose.model("ProductCartSchema",productCartSchema)

const orderSchema = new mongoose.Schema({
    products:[productCartSchema],
    transactionId:{},
    amount:{
        type:Number
    },
    address:String,
    status:{
        type:String,
        default:"Received",
        enum:["Cancelled","Delivered","shipped","Processing","Received"]
    },
    paymentMethod:"",
    userName:{
        type:String
    },
    userEmail:{
        type:String
    },
    phone_number:{
        type:String
    },
    updated: Date,
    user:{
        type: ObjectId,
        ref:"User"
    },
    landmark:{
        type:String,
    },
    city:{
        type:String
    },
    postalCode:{
         type:String
    }
},{timestamps:true})

const Order = mongoose.model("OrderSchema",orderSchema)

module.exports = {Order,ProductCart}
