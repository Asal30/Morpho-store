import mongoose from "mongoose";
import { ALL_SIZES, CATEGORIES, COLORS_BY_CATEGORY, THEMES, validateCategoryColor } from "../config/catalog.js";

const itemModel = mongoose.Schema(
    {
        itemID : {
            type : String,
            required : true,
            unique : true,
            trim : true
        },
        name : {
            type : String,
            required : true,
            trim : true
        },
        slug : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true
        },
        category : {
            type : String,
            required : true,
            enum : CATEGORIES
        },
        theme : {
            type : String,
            required : true,
            enum : THEMES
        },
        availableSizes : {
            type : [
                {
                    type : String,
                    enum : ALL_SIZES
                }
            ],
            required : true
        },
        color : {
            type : String,
            required : true,
            enum : [...new Set(Object.values(COLORS_BY_CATEGORY).flat())],
            validate : {
                validator : function (color) { return !this.category || validateCategoryColor(this.category, color) },
                message : function (properties) { return `${properties.value} is not available for this category` }
            }
        },
        price : {
            type : Number,
            required : true,
            min : 0
        },
        images : [
            {
                image : {
                    type : String,
                    required : true,
                    trim : true
                },
                publicId : { type : String, trim : true },
                alt : {
                    type : String,
                    default : "",
                    trim : true
                },
                isPrimary : {
                    type : Boolean,
                    default : false
                },
                displayOrder : {
                    type : Number,
                    default : 0
                }
            }
        ],
        description : {
            type : String,
            trim : true
        },
        specialDescription : {
            type : String,
            trim : true
        },
        notes : {
            type : String,
            trim : true
        },
        isAvailable : {
            type : Boolean,
            default : true
        },
        isFeatured : {
            type : Boolean,
            default : false
        }
    },
    {
        timestamps : true
    }
)

itemModel.pre("validate", function () {
    if (this.images?.filter((image) => image.isPrimary).length > 1) this.invalidate("images", "Only one image may be primary")
})

const Item = mongoose.model("items", itemModel)

export default Item;
