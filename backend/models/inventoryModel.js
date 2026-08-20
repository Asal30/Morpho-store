import mongoose from "mongoose";
import { ALL_SIZES } from "../config/catalog.js";

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
            enum : ALL_SIZES
        },
        quantity : {
            type : Number,
            required : true,
            default : 0,
            min : 0,
            validate : {
                validator : function (quantity) { return quantity - (this.sold ?? 0) - (this.reserved ?? 0) >= 0 },
                message : "Available stock cannot be negative"
            }
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
inventoryModel.virtual("availableStock").get(function () { return this.quantity - this.sold - this.reserved })
inventoryModel.set("toJSON", { virtuals : true })

const Inventory = mongoose.model("inventory", inventoryModel)

export default Inventory;
