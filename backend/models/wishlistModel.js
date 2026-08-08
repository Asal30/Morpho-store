import mongoose from "mongoose";

const wishlistModel = mongoose.Schema(
    {
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users",
            required : true,
            unique : true
        },
        items : [
            {
                type : mongoose.Schema.Types.ObjectId,
                ref : "items"
            }
        ]
    },
    {
        timestamps : true
    }
)

const Wishlist = mongoose.model("wishlists", wishlistModel)

export default Wishlist;
