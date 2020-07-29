
const Product = require("../models/product")
const formidable = require("formidable")
const _ = require("lodash")
const fs = require("fs")

exports.getProductById = (req,res,next,id)=>{
    Product.findById(id)
        .populate("category")
        .exec( (err,product)=>{
        if(err){
            return res.status(400).json({
                error:"Product not found in DB"
            })
        }
        req.product = product
        next()
    })
}

exports.createProduct = (req,res)=>{
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req,(err,fields,file)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }


        const {name,description,price,stock,category} = fields

        if(!name || !description || !price || !stock || !category){
            return res.status(400).json({
                error:"all Fields are required"
            })
        }




        let product = new Product(fields)

        // handle file here
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error:"file size is too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }

        // save ti DB

        product.save( (err,product) =>{
            if(err){
                res.status(400).json({
                    error:"saving tshirt in DB Failed"
                })
            }
            res.json(product)
        })



    })
}


exports.getProduct =(req,res)=>{
    req.product.photo = undefined;
    return res.json(req.product);
}

exports.photo = (req,res,next)=>{
    if (req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
}

exports.deleteProduct = (req,res)=>{
    let product = req.product
    product.remove( (err,deletedProduct)=>{
        if(err){
            res.status(400).json({
                error:"Failed to delete product "
            })
        }
        res.json({
            message:"Deletion was successful",
            deletedProduct
        })

    })
}
exports.updateProduct = (req,res) =>{

    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req,(err,fields,file)=>{
        if(err){
            return res.status(400).json({
                error:"problem with image"
            })
        }



        // updation code
        let product = req.product
        product = _.extend(product,fields)

        // handle file here
        if(file.photo){
            if(file.photo.size > 3000000){
                return res.status(400).json({
                    error:"file size is too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }
        // save ti DB

        product.save( (err,product) =>{
            if(err){
                res.status(400).json({
                    error:"updatinf of product Failed"
                })
            }
            // if no error response back product to user
            res.json(product)
        })

    })
}

exports.getAllProducts = (req,res) =>{

    let limit = req.query.limit ? parseInt(req.query.limit) : 8;
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

    Product.find()
        .select("-photo")
        .populate("category")
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "NO product FOUND"
                });
            }
            res.json(products);
        })
}




// get all categories
exports.getAllUniqueCategories = (req,res) =>{
    Product.distinct("category",{},(err, category)=>{
        if(err){
            return res.status(400).json({
                error:"NO category found"
            })
        }
        res.json(category)
    })
}







exports.updateStock = (req,res,next)=>{
    let myOperations  = req.body.order.products.map(prod =>{
        return {
            updateOne:{
                filter: {_id:prod._id},
                update: {$inc: {stock:-prod.count, sold:+prod.count}}
            }
        }
    })

    Product.bulkWrite(myOperations,{},(err,products)=>{
        if(err){
            return res.status(400).json({
                error:"Bulk operation Failed"
            })
        }
        next()
    })
}