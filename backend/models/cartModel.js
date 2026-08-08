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
                item : {
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "items",
                    required : true
                },
                size : {
                    type : String,
                    required : true,
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
