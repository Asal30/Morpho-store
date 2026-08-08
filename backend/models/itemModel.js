import mongoose from "mongoose";

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
            enum : ["Oversize", "Raglan"]
        },
        theme : {
            type : String,
            required : true,
            enum : ["Toon Art", "Anime", "Motor", "Street Art", "Essentials", "Customized"]
        },
        availableSizes : {
            type : [
                {
                    type : String,
                    enum : ["2XS", "XS", "S", "M", "L", "XL", "2XL"]
                }
            ],
            required : true
        },
        color : {
            type : String,
            required : true,
            enum : ["Black", "White", "Navy Blue", "Aqua Blue", "Mint Green", "Baby Pink", "Yellow", "Blue", "Red", "Pink"]
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

const Item = mongoose.model("items", itemModel)

export default Item;
