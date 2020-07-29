const express = require("express")
const router = express.Router()


const { isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth")
const {getUserByID} = require("../controllers/user")
const { getCategoryById,
        createCategory,
        getCategory,
        getAllCategories,
        updateCategories,
        deleteCategories} = require("../controllers/category")

router.param("userId",getUserByID)
router.param("categoryId",getCategoryById)

// create route
router.post("/category/create/:userId",isSignedIn,isAuthenticated,isAdmin,createCategory)

// read Routes
router.get("/category/:categoryId",getCategory)
router.get("/categories",getAllCategories)

// update
router.put("/categories/:categoryId/:userId",isSignedIn,isAuthenticated,isAdmin,updateCategories)

//delete
router.delete("/categories/:categoryId/:userId",isSignedIn,isAuthenticated,isAdmin,deleteCategories)

module.exports = router