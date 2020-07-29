
require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
// my Routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const categoryRoutes = require("./routes/category")
const productRoutes = require("./routes/product")
const orderRoutes = require("./routes/order")
const StripeRoutes = require("./routes/stripePayment")
const RazorpayRoutes = require("./routes/razorpayPayment")


// DATABASE CONNECTION
mongoose
    .connect(process.env.DATABASE, {useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex:true}).then(()=>{
            console.log("DB CONNECTED")
})

// MY MIDDLEWARE (which comes in between)
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())


// MY ROUTES
app.use("/api",authRoutes)
app.use("/api",userRoutes)
app.use("/api",categoryRoutes)
app.use("/api",productRoutes)
app.use("/api",orderRoutes)
app.use("/api",StripeRoutes)
app.use("/api",RazorpayRoutes)


// SERVER CONNECTION
const port = process.env.port | 7000
app.listen(port,()=>{
    console.log(`app is running at port ${port}`)
})

