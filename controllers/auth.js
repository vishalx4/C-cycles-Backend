
const User = require("../models/user")
const { check, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
const expressJwt = require("express-jwt")
const {OAuth2Client} = require("google-auth-library")
const _ = require("lodash")


const sgMail = require("@sendgrid/mail")
sgMail.setApiKey(process.env.API_KEY_SENDGRID)


const client = new OAuth2Client("365198578896-4atu4uh2ekk4eg2vq3l0gac4k2iojjnl.apps.googleusercontent.com")

exports.signup = (req,res) =>{

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    const {name,email,password} = req.body

    User.findOne({email})
        .exec( (err,user)=> {

            if (user) {
                return res.status(400).json({
                    error: "This Email id has already an Account, plz use Another email"
                })
            }

            const token = jwt.sign({name, email, password}, process.env.ACTIVATION_KEY, {expiresIn: '20m'})


            const msg = {

                to: email,
                from: "khedekarvishal1999@gmail.com",
                subject: "Activate your Account",
                text: "click the link below to activate ur account",
                html: `
                      <h1>GO to the link To Activate Account : </h1> <p><a href="${process.env.CLIENT_URL}/authentication/activate/${token}">Reset Password Link</a></p>
                     `
            }
            sgMail.send(msg).then(() => {
                console.log("email sent")
                return res.send({message:"Email Has bees send, Kindly Reset ur Password"})
            })
                .catch(err => {
                    console.log(err)
                    return res.json({
                        error:err.message
                    })
                })


        })
}










exports.signin = (req,res) =>{

    // get email and password from req.body
    const { email, password } = req.body;

    // check if any error occurs during validating userName and password
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    // find that user in database based on email cuz email is unique
    User.findOne({email}, (err,user) =>{

        if(err || !user){
            return res.status(400).json({
                error:"user dose not exist"
            })
        }

        if(!user.authentication(password)){
            return res.status(401).json({
                error: "Email and password dose not match"
            })
        }

        // if no error in finding user and email and password matches
        // create a sign in token based on user ID
        const token = jwt.sign({_id:user._id},process.env.SECRET)
        // put that token in cookie
        res.cookie("token",token,{expire: new Date() + 9999})

        const {_id,name,email,role} = user

        return res.json({
            token,
            user:{
                _id,name,email,role
            }
        })


    })



}





exports.signout = (req,res) =>{
    res.clearCookie("token")
        res.json({
            message:"User signout Successfully"
        })
}

// protected routes
exports.isSignedIn = expressJwt({
    secret:process.env.SECRET,
    userProperty: "auth"
})

// custom middleware
exports.isAuthenticated = (req,res,next) =>{
    let checker = req.profile && req.auth && (req.profile._id) == (req.auth._id)
    if(!checker){
        return res.status(403).json({
            error:"Access Denied"
        })
    }
    next()
}





exports.isAdmin = (req,res,next) =>{
    if(req.profile.role === 0){
        return res.status(403).json({
            error:"You are not ADMIN, Access Denied"
        })
    }
    next()
}



exports.activateAccount = (req,res)=>{

    const {token} = req.body

    if(token){
        jwt.verify(token,process.env.ACTIVATION_KEY, function (error,decodedToken) {

            if(error){
                return res.status(400).json({error:"Incorrect or Expired Link"})
            }

            const {name,email,password} = decodedToken
            console.log(name,email,password)


            User.findOne({email}).exec( (err,user)=>{

                if(user){
                    return res.status(400).json({error:"User With This Email Already Exists"})
                }

                const createUser = new User({name,email,password})

                createUser.save( (err,user) => {

                    if(err){
                        return res.status(400).json({
                            err: "Failed to save user in Database"
                        })
                    }
                    res.json({
                        name: user.name,
                        email: user.email,
                        id: user._id
                    })

                })

            })
        })
        }
        else{
            return res.json({
                error:"something went wrong"
            })
        }
}




exports.forgetPassword = (req,res)=>{

    const {email} = req.body

    User.findOne({email}, (err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"user with this email dose not exist"
            })
        }

        const token = jwt.sign({_id:user._id}, process.env.RESET_KEY, {expiresIn: '20m'})
        console.log("forgot password token => ",token)

        const msg = {

            to: email,
            from: "khedekarvishal1999@gmail.com",
            subject: "Reset Your password",
            text: "click the link below to Reset your Password",
            html: `<h1>GO to the link To Reset Password : </h1> <p><a href="${process.env.CLIENT_URL}/reset_password/${token}">Password Reset Link</a></p>`
        }

        user.updateOne({resetLink:token} , (err,success)=>{
            if(err){
                return res.status(400).json({
                    error:"reset password link error"
                })
            }
            else{
                sgMail.send(msg).then(() => {
                    console.log("email sent")
                    return res.send({message:"Email Has bees send, Kindly Reset your Password"})
                }).catch(err => {
                    console.log(err)
                    return res.json({
                        error:err.message
                    })
                })
            }
        })

    })
}


exports.resetPassword = (req,res) =>{
    const {resetLink,password,confirmPassword} = req.body
    if(resetLink){
        jwt.verify(resetLink,process.env.RESET_KEY, (error,decodedData) =>{

            if(error){
                return res.status(400).json({
                    error:"Incorrect or Expired Token"
                })
            }

            if(password !== confirmPassword){
                return res.status(400).json({
                    error:"password and confirmPassword dose not match plz type correctly"
                })
            }

            User.findOne( {resetLink}, (err,user) =>{
                if(err || !user){
                    return res.status(400).json({
                        error:"user with this email dose not exist"
                    })
                }


                const newPassword = user.securePassword(password)

                const obj = {
                    encrypted_password:newPassword,
                    resetLink: ""
                }

                user = _.extend(user,obj)

                user.save( (err,result) =>{
                    if(err){
                        return res.status(400).json({
                            error:"Failed tO update Password"
                        })
                    }
                    else{
                        res.status(200).json({message:"Password changed successfully"})
                    }
                })

            })


        })
    }
    else{
        return res.status(400).json({error:"Authentication Error!!!"})
    }
}



exports.googleLogin = (req,res) =>{

    const {tokenId} = req.body

    client.verifyIdToken({idToken:tokenId, audience:'365198578896-4atu4uh2ekk4eg2vq3l0gac4k2iojjnl.apps.googleusercontent.com'}).then(response =>{
        const {email_verified,name,email} = response.getPayload()

        if(email_verified){
            User.findOne({email}).exec( (err,user)=>{

                if(err){
                    return res.status(400).json({
                        error:"something went wrong"
                    })
                }
                else {

                    if(user){

                        const token = jwt.sign({_id:user._id},process.env.SECRET)
                        // put that token in cookie
                        res.cookie("token",token,{expire: new Date() + 9999})

                        const {_id,name,email,role} = user

                        return res.json({
                            token,
                            user:{
                                _id,name,email,role
                            }
                        })

                    }
                    else{

                        let password = email+process.env.RESET_KEY
                        console.log(password)
                        let newUser = new User({name,email,password})

                            newUser.save( (err,data)=>{
                                if(err){
                                    return res.status(400).json({
                                        error:"Failed to save user in database"
                                    })
                                }

                                // if every thing goes well signin user directly
                                const token = jwt.sign({_id:data._id},process.env.SECRET)
                                // put that token in cookie
                                res.cookie("token",token,{expire: new Date() + 9999})

                                const {_id,name,email,role} = newUser

                                return res.json({
                                    token,
                                    user:{
                                        _id,name,email,role
                                    }
                                })


                            })

                    }
                }
            } )
        }

    })
}
































