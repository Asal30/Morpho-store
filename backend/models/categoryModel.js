import mongoose from "mongoose";

const categoryItemModel = mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            unique : true,
            trim : true
        },
        price : {
            type : Number,
            required : true,
            min : 0
        },
        description : {
            type : String,
            required : true,
            trim : true
        },
        features : [
            {
                type : String,
                trim : true
            }
        ],
        image : {
            type : String,
            required : true,
            trim : true
        }
    },
    {
        timestamps : true
    }
)

const CategoryItem = mongoose.model("categoryItem", categoryItemModel)

export default CategoryItem;
