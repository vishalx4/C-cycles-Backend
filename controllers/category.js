
const Category = require("../models/category")

exports.getCategoryById = (req,res,next,id) =>{
    Category.findById(id).exec((err,cate)=>{
        if(err){
            return res.status(400).json({
                error:"category not found in DB"
            })
        }
        req.category = cate
        next()
    })
}

exports.createCategory = (req,res) =>{
    const category = new Category(req.body)
    category.save((err,category) =>{
        if(err){
            return res.status(400).json({
                error:" not able to save category in DB"
            })
        }
        res.json(category)
    })
}

exports.getCategory = (req,res) =>{
    return res.json(req.category)
}

exports.getAllCategories = (req,res) =>{
    Category.find().exec((err,categories) => {
        if(err){
            return res.status(400).json({
                error:" no Categories found"
            })
        }
        res.json(categories)
    })
}


exports.updateCategories = (req,res) =>{
    const category = req.category
    category.name = req.body.name

    category.save( (err,updatedCategory) =>{
        if(err){
            return res.status(400).json({
                error:"Failed to update Category"
            })
        }
        res.json(updatedCategory)
    })
}

exports.deleteCategories = (req,res) =>{
    const category = req.category

    category.remove( (err,deletedCategory)=>{
        if(err){
            return res.status(400).json({
                error:"Failed to delete Category"
            })
        }
        res.json({
            message: "category successfully deleted"
        })
    })
}