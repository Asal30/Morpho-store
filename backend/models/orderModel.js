import mongoose from "mongoose";

const orderModel = mongoose.Schema(
    {
        orderID : {
            type : String,
            required : true,
            unique : true,
            trim : true
        },
        customer : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users"
        },
        items : [
            {
                item : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "items",
                    required : true
                },
                itemID : {
                    type : String,
                    required : true,
                    trim : true
                },
                name : {
                    type : String,
                    required : true,
                    trim : true
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
                quantity : {
                    type : Number,
                    required : true,
                    min : 1
                },
                unitPrice : {
                    type : Number,
                    required : true,
                    min : 0
                }
            }
        ],
        customerName : {
            type : String,
            required : true,
            trim : true
        },
        email : {
            type : String,
            required : true,
            lowercase : true,
            trim : true
        },
        phone : {
            type : String,
            required : true,
            trim : true
        },
        whatsApp : {
            type : String,
            trim : true
        },
        shippingAddress : {
            addressLine1 : {
                type : String,
                required : true,
                trim : true
            },
            addressLine2 : {
                type : String,
                trim : true
            },
            city : {
                type : String,
                required : true,
                trim : true
            },
            district : {
                type : String,
                required : true,
                trim : true
            },
            postalCode : {
                type : String,
                trim : true
            }
        },
        subtotal : {
            type : Number,
            required : true,
            min : 0
        },
        deliveryFee : {
            type : Number,
            required : true,
            min : 0
        },
        total : {
            type : Number,
            required : true,
            min : 0
        },
        paymentMethod : {
            type : String,
            required : true,
            trim : true
        },
        paymentStatus : {
            type : String,
            enum : ["pending", "paid", "failed", "refunded"],
            default : "pending"
        },
        orderStatus : {
            type : String,
            enum : ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default : "pending"
        },
        notes : {
            type : String,
            trim : true
        }
    },
    {
        timestamps : true
    }
)

const Order = mongoose.model("orders", orderModel)

export default Order;
