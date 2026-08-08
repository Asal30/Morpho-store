import mongoose from "mongoose";

const inventoryModel = mongoose.Schema(
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
            required : true,
            default : 0,
            min : 0
        },
        sold : {
            type : Number,
            default : 0,
            min : 0
        },
        reserved : {
            type : Number,
            default : 0,
            min : 0
        },
        isAvailable : {
            type : Boolean,
            default : true
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

inventoryModel.index({ item : 1, size : 1 }, { unique : true })

const Inventory = mongoose.model("inventory", inventoryModel)

export default Inventory;
