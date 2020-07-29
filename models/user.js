
const mongoose = require("mongoose")
const crypto = require("crypto")
const { v4: uuidv4 } = require('uuid');

let userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        maxlength:32,
        trim:true
    },
    last_name:{
        type:String,
        maxlength:32,
        trim:true
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },
    userinfo: {
        type: String,
        trim: true
    },
    encrypted_password:{
        type:String,
        required:true
    },
    salt:String,
    role:{
        type: Number,
        default:0
    },
    purchases:{
        type:Array,
        default: []
    },
    resetLink:{
        type:String,
        default:""
    }
},{timestamps:true});

// -> this virtual method takes a password from user and uses uuid to set salt and pass the password to crypto in order to encrypt it
userSchema.virtual('password')
    .set(function (password) {
        this._password = password
        this.salt = uuidv4()
        this.encrypted_password = this.securePassword(password)
    })
    .get(function () {
        return this._password
    })

userSchema.methods = {

    authentication: function(plainPassword){
        return this.securePassword(plainPassword) === this.encrypted_password
    },

    securePassword: function (plainPassword) {
        if(!plainPassword) return ""
        try{
            return crypto.createHmac('sha256', this.salt)
                .update(plainPassword)
                .digest('hex');
        }catch (e) {
            return ""
        }
    }
}

module.exports = mongoose.model("User",userSchema)