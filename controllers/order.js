

const {Order,ProductCart} = require("../models/order")

exports.getOrderByID = (req,res,next,id)=>{
    Order.findById(id)
        .populate("products.product","name price")
        .exec( (err,order)=>{
        if(err){
            return res.status(400).json({
                error:"No Order Found"
            })
        }
        req.order = order
        next()
    })
}

exports.createOrder = (req,res,next) =>{

    req.body.order.user = req.profile
    const order = new Order(req.body.order)

    order.save( (err,order)=>{
        if(err){
            return res.status(400).json({
                error:"Failed to Save Order"
            })
        }

        res.json(order)
    })
    next()
}



exports.getAllOrders = (req,res)=>{

    Order.find()
        .populate("user","_id,name")
        .exec((err,orders)=>{
            if(err){
                return res.status(400).json({
                    error:"No orders Found"
                })
            }
            res.json(orders)
        })

}



exports.getOrderStatus = (req,res)=>{
    res.json(Order.Schema.path("status").enumValues)
}


exports.updateStatus = (req,res) =>{

    Order.update(
        {_id: req.body.orderId},
        {$set: {status: req.body.status}},
        (err, order) =>{
            if(err){
                return res.status(400).json({
                    error:"Cannot update Order status"
                })
            }
            res.json(order)
        }
    )
}




exports.getOrder = (req,res) =>{
    return res.json(req.order)
}





