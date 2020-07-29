const User = require("../models/user")
const OrderSchema = require("../models/order")

exports.getUserByID = (req,res,next,id) =>{

    User.findById(id).exec( (err,user)=>{

        if(err || !user){
            return res.status(400).json({
                err:"user not found"
            })
        }
        console.log(req.profile)
        req.profile = user
        console.log(req.profile)
        next();
    })

}

// give whole user Schema
exports.getUser = (req,res) =>{
    req.profile.salt = undefined
    req.profile.encrypted_password = undefined
    req.profile.createdAt = undefined
    req.profile.updatedAt = undefined
    console.log(req.profile)
    return res.json(req.profile)
}



// exports.getAllUsers = (req,res) =>{
//     User.find().exec( (err,users)=>{
//         if(err|| !users) {
//             return res.status(400).json({
//                 error:"NO user found in DB"
//             })
//         }
//         res.json(users)
//     })
// }




exports.updateUser = (req,res) =>{

    User.findByIdAndUpdate(
        {_id:req.profile._id},
        {$set:req.body},
        {new:true, useFindAndModify:false},
        (err,user)=>{

            if(err){
                return res.status(400).json({
                    error:"failed to Update User"
                })
            }

            req.profile.salt = undefined
            req.profile.encrypted_password = undefined
            req.profile.createdAt = undefined
            req.profile.updatedAt = undefined
            res.json(user)

        }
    )

}

//populate method is used to populate the property from another model
// here we populate user property with name and id
// it means we are setting user property inside order

exports.userPurchaseList = (req,res) =>{

    OrderSchema.find({user: req.profile._id})
        .populate("user","_id name")
        .exec( (err, order) =>{
            if(err){
                return res.status(400).json({
                    error: "NO order in this account"
                })
            }
            return res.json(order)
        })

}






exports.pushOrderInPurchaseList = (req,res,next) =>{

    let add_purchases = []
    console.log("orders =>",req.body.order)
    req.body.order.products.forEach(product =>{
        add_purchases.push({
            _id : product._id,
            name:product.name,
            description : product.description,
            category: product.category,
            status: product.status,
            quantity: product.quantity,
            amount : req.body.order.amount,
            transactionId: req.body.order.transactionId
        })
    })

    // save in DB
    User.findOneAndUpdate(

        {_id:req.profile._id},
        {$push:{purchases:add_purchases}},
        {new:true},
        (err,purchases)=>{
            if(err){
                return res.status(400).json({
                    error:"Unable to save purchases"
                })
            }
            next()
        }

    )


}