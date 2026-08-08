import mongoose from "mongoose";

const userModel = mongoose.Schema(
    {
        firstName : {
            type : String,
            required : true,
            trim : true
        },
        lastName : {
            type : String,
            required : true,
            trim : true
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        password : {
            type : String,
            required : true
        },
        type : {
            type : String,
            required : true,
            enum : ["customer", "admin"],
            default : "customer"
        },
        whatsApp : {
            type : String,
            required : true,
            trim : true
        },
        phone : {
            type : String,
            required : true,
            trim : true
        },
        isDisabled : {
            type : Boolean,
            required : true,
            default : false
        },
        isEmailVerified : {
            type : Boolean,
            required : true,
            default : false
        }
    },
    {
        timestamps : true
    }
)

const User = mongoose.model("users", userModel)

export default User;
