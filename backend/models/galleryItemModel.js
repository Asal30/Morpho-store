import mongoose from "mongoose";

const galleryItemModel = mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
            trim : true
        },
        image : {
            type : String,
            required : true,
            trim : true
        },
        description : {
            type : String,
            required : true,
            trim : true
        }
    },
    {
        timestamps : true
    }
)

const GalleryItem = mongoose.model("galleryItem", galleryItemModel)

export default GalleryItem;
