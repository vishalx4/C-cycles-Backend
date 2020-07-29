const express = require('express')
const router = express.Router()
const { signup,signin,signout,isSignedIn, activateAccount, forgetPassword, resetPassword, googleLogin } = require("../controllers/auth")
const { check, validationResult } = require("express-validator")


// create routes
router.post("/signup",[
    check("name","name should be at least 3 character").isLength({min:3}),
    check("email","email is required").isEmail(),
    check("password","password must be greater then 5 characters").isLength({min:5})
],signup)

router.post("/activate_account",activateAccount)


router.post("/signin",[
    check("email","email is required").isEmail(),
    check("password","password must be greater then 5 characters").isLength({min:5})
],signin)


router.post("/googlelogin",googleLogin)



// retrive routes
router.get("/signout",signout)

router.get("/testroute",isSignedIn,(req,res) =>{
    res.send("A protected Route")
})


// update routes
router.put("/forgotPassword",forgetPassword)
router.put("/resetPassword",resetPassword)

module.exports = router