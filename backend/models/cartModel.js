import mongoose from "mongoose";

const cartModel = mongoose.Schema(
    {
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users",
            required : true,
            unique : true
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
                size : {
                    type : String,
                    required : function () {
                        return this.type === "normal"
                    },
                    enum : ["2XS", "XS", "S", "M", "L", "XL", "2XL"]
                },
                quantity : {
                    type : Number,
                    default : 1,
                    min : 1
                }
            }
        ]
    },
    {
        timestamps : true
    }
)

const Cart = mongoose.model("carts", cartModel)

export default Cart;
