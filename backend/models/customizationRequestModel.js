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
        quantity : {
            type : Number,
            required : true,
            default : 1,
            min : 1
        },
        color : {
            type : String,
            required : true,
            enum : ["Black", "White", "Navy Blue", "Aqua Blue", "Mint Green", "Baby Pink", "Yellow", "Blue", "Red", "Pink"]
        },
        artwork : [
            {
                url : {
                    type : String,
                    required : true,
                    trim : true
                },
                secureUrl : {
                    type : String,
                    required : true,
                    trim : true
                },
                publicId : {
                    type : String,
                    required : true,
                    trim : true
                },
                originalFilename : {
                    type : String,
                    required : true,
                    trim : true
                },
                placement : {
                    type : String,
                    required : true,
                    enum : ["front", "back"]
                },
                format : {
                    type : String,
                    required : true,
                    enum : ["png", "jpg", "jpeg", "webp"]
                },
                width : {
                    type : Number,
                    required : true,
                    min : 1
                },
                height : {
                    type : Number,
                    required : true,
                    min : 1
                }
            }
        ],
        customText : {
            text : {
                type : String,
                maxlength : 80,
                trim : true
            },
            font : {
                type : String,
                enum : ["Manrope", "Cormorant Garamond", "Arial"]
            },
            fontSize : {
                type : Number,
                min : 8,
                max : 96
            },
            color : {
                type : String,
                maxlength : 20,
                trim : true
            },
            alignment : {
                type : String,
                enum : ["left", "center", "right"]
            },
            placement : {
                type : String,
                enum : ["front", "back"]
            }
        },
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
        unitPrice : {
            type : Number,
            required : true,
            min : 0
        },
        totalPrice : {
            type : Number,
            required : true,
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
