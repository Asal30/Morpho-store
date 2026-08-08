import Item from "../models/itemModel.js";
import Wishlist from "../models/wishlistModel.js";
import { handleControllerError, isValidObjectId, sendData, sendError } from "../utilities/http.js";

async function loadWishlist(userId) {
    return Wishlist.findOne({ user : userId }).populate("items")
}

export async function getWishlist(req, res) {
    try {
        const wishlist = await loadWishlist(req.user._id)
        return sendData(res, wishlist ?? { user : req.user._id, items : [] })
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function addWishlistItem(req, res) {
    try {
        if (!isValidObjectId(req.params.itemId)) return sendError(res, 400, "Invalid item ID")
        if (!(await Item.exists({ _id : req.params.itemId }))) return sendError(res, 404, "Item not found")

        await Wishlist.findOneAndUpdate(
            { user : req.user._id },
            { $setOnInsert : { user : req.user._id }, $addToSet : { items : req.params.itemId } },
            { upsert : true, new : true, runValidators : true }
        )
        return sendData(res, await loadWishlist(req.user._id), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function removeWishlistItem(req, res) {
    try {
        if (!isValidObjectId(req.params.itemId)) return sendError(res, 400, "Invalid item ID")
        const wishlist = await Wishlist.findOneAndUpdate(
            { user : req.user._id },
            { $pull : { items : req.params.itemId } },
            { new : true }
        ).populate("items")
        if (!wishlist) return sendError(res, 404, "Wishlist not found")
        return sendData(res, wishlist)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function clearWishlist(req, res) {
    try {
        await Wishlist.findOneAndDelete({ user : req.user._id })
        return sendData(res, { user : req.user._id, items : [] })
    } catch (error) {
        return handleControllerError(error, res)
    }
}
