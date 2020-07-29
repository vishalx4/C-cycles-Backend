const express = require("express")
const router = express.Router()

const {isSignedIn,isAuthenticated,isAdmin} = require("../controllers/auth")
const {getUserByID,pushOrderInPurchaseList,} = require("../controllers/user")
const {updateStock} = require("../controllers/product")
const { getOrderByID,createOrder,getAllOrders,updateStatus,getOrderStatus,getOrder } = require("../controllers/order")


//Params
router.param("userId",getUserByID)
router.param("orderId",getOrderByID)

//Actual Routes

// create Order
router.post("/order/create/:userId"
    ,isSignedIn
    ,isAuthenticated
    ,updateStock
    ,createOrder
    ,pushOrderInPurchaseList
)

// read Order
router.get("/order/all/:userId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    getAllOrders
)

router.get("/order/:userId/:orderId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    getOrder
)

// status
router.get("/order/status/:orderId/:userId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    getOrderStatus
)


// update status
router.put("/order/:orderId/status/:userId",
    isSignedIn,
    isAuthenticated,
    isAdmin,
    updateStatus
)

module.exports = router