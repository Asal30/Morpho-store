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
                type : {
                    type : String,
                    required : true,
                    enum : ["normal", "custom"],
                    default : "normal"
                },
                item : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "items",
                    required : function () {
                        return this.type === "normal"
                    }
                },
                customization : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "customizationRequests",
                    required : function () {
                        return this.type === "custom"
                    }
                },
                itemID : {
                    type : String,
                    required : function () {
                        return this.type === "normal"
                    },
                    trim : true
                },
                name : {
                    type : String,
                    required : function () {
                        return this.type === "normal"
                    },
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
                },
                totalPrice : {
                    type : Number,
                    required : true,
                    min : 0
                },
                customizationSnapshot : {
                    requestID : { type : String, trim : true },
                    category : { type : String, enum : ["Oversize", "Raglan"] },
                    color : { type : String, enum : ["Black", "White", "Navy Blue", "Aqua Blue", "Mint Green", "Baby Pink", "Yellow", "Blue", "Red", "Pink"] },
                    size : { type : String, enum : ["2XS", "XS", "S", "M", "L", "XL", "2XL"] },
                    artwork : [
                        {
                            secureUrl : String,
                            publicId : String,
                            originalFilename : String,
                            placement : { type : String, enum : ["front", "back"] },
                            format : String,
                            width : Number,
                            height : Number
                        }
                    ],
                    customText : {
                        text : String,
                        font : String,
                        fontSize : Number,
                        color : String,
                        alignment : String,
                        placement : String
                    },
                    designObjects : [
                        {
                            id : String,
                            type : { type : String, enum : ["artwork", "text"] },
                            placement : { type : String, enum : ["front", "back"] },
                            x : Number,
                            y : Number,
                            width : Number,
                            height : Number,
                            scaleX : Number,
                            scaleY : Number,
                            rotation : Number,
                            zIndex : Number,
                            assetKey : String,
                            text : String,
                            fontFamily : String,
                            fontSize : Number,
                            fill : String,
                            textAlign : String
                        }
                    ],
                    defaultBranding : {
                        applied : Boolean,
                        side : { type : String, enum : ["front", "back"] },
                        variant : { type : String, enum : ["black", "white"] }
                    }
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
