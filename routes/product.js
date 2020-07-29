
const express = require("express")
const router = express.Router()


const { isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth")
const {getUserByID} = require("../controllers/user")

const {getProductById,
       createProduct,
       getProduct,
       photo,
       deleteProduct,
       updateProduct,
       getAllProducts,
       getAllUniqueCategories} = require("../controllers/product")


router.param("productId",getProductById)
router.param("userId",getUserByID)


// create product
router.post("/product/create/:userId",isSignedIn,isAuthenticated,isAdmin,createProduct)

// retrieve product and photo of product
router.get("/product/:productId",getProduct)
router.get("/product/photo/:productId",photo)

// delete route
router.delete("/product/:productId/:userId",isSignedIn,isAuthenticated,isAdmin,deleteProduct)

//update route
router.put("/product/:productId/:userId",isSignedIn,isAuthenticated,isAdmin,updateProduct)


// listing route : get all product but add a limit to load x number of product
router.get("/products",getAllProducts)

router.get("/products/categories",getAllUniqueCategories)


module.exports = router