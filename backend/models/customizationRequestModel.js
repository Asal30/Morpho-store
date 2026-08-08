import mongoose from "mongoose";

const customizationRequestModel = mongoose.Schema(
    {
        requestID : {
            type : String,
            required : true,
            unique : true,
            trim : true
        },
        customer : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        },
        category : {
            type : String,
            required : true,
            enum : ["Oversize", "Raglan"]
        },
        size : {
            type : String,
            required : true,
            enum : ["2XS", "XS", "S", "M", "L", "XL", "2XL"]
        },
        color : {
            type : String,
            required : true,
            enum : ["Black", "White", "Navy Blue", "Aqua Blue", "Mint Green", "Baby Pink", "Yellow", "Blue", "Red", "Pink"]
        },
        artwork : [
            {
                type : String,
                trim : true
            }
        ],
        description : {
            type : String,
            required : true,
            trim : true
        },
        notes : {
            type : String,
            trim : true
        },
        price : {
            type : Number,
            min : 0
        },
        status : {
            type : String,
            enum : ["pending", "reviewing", "approved", "rejected", "in-progress", "completed", "cancelled"],
            default : "pending"
        }
    },
    {
        timestamps : true
    }
)

const CustomizationRequest = mongoose.model("customizationRequests", customizationRequestModel)

export default CustomizationRequest;
