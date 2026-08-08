import mongoose from "mongoose";

const reviewModel = mongoose.Schema(
    {
        user : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "users",
            required : true
        },
        item : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "items",
            required : true
        },
        rating : {
            type : Number,
            required : true,
            min : 1,
            max : 5
        },
        title : {
            type : String,
            trim : true
        },
        comment : {
            type : String,
            required : true,
            trim : true
        },
        isApproved : {
            type : Boolean,
            default : false
        }
    },
    {
        timestamps : true
    }
)

reviewModel.index({ user : 1, item : 1 }, { unique : true })

const Review = mongoose.model("reviews", reviewModel)

export default Review;
