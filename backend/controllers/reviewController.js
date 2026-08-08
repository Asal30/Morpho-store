import Item from "../models/itemModel.js";
import Review from "../models/reviewModel.js";
import { handleControllerError, isValidObjectId, pick, sendData, sendError } from "../utilities/http.js";

export async function getItemReviews(req, res) {
    try {
        if (!isValidObjectId(req.params.itemId)) return sendError(res, 400, "Invalid item ID")
        const reviews = await Review.find({ item : req.params.itemId, isApproved : true })
            .populate("user", "firstName lastName")
            .sort({ createdAt : -1 })
        return sendData(res, reviews)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getReviews(req, res) {
    try {
        return sendData(res, await Review.find().populate("user", "firstName lastName email").populate("item").sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function createReview(req, res) {
    try {
        if (!isValidObjectId(req.body.item)) return sendError(res, 400, "Invalid item ID")
        if (!(await Item.exists({ _id : req.body.item }))) return sendError(res, 404, "Item not found")
        const review = await Review.create({
            ...pick(req.body, ["item", "rating", "title", "comment"]),
            user : req.user._id,
            isApproved : false
        })
        return sendData(res, review, 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateReview(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid review ID")
        const filter = req.user.type === "admin"
            ? { _id : req.params.id }
            : { _id : req.params.id, user : req.user._id }
        const update = pick(req.body, ["rating", "title", "comment"])
        if (req.user.type !== "admin") update.isApproved = false
        const review = await Review.findOneAndUpdate(filter, update, { new : true, runValidators : true })
        if (!review) return sendError(res, 404, "Review not found")
        return sendData(res, review)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateReviewApproval(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid review ID")
        if (typeof req.body.isApproved !== "boolean") return sendError(res, 400, "isApproved must be a boolean")
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved : req.body.isApproved },
            { new : true, runValidators : true }
        )
        if (!review) return sendError(res, 404, "Review not found")
        return sendData(res, review)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function deleteReview(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid review ID")
        const filter = req.user.type === "admin"
            ? { _id : req.params.id }
            : { _id : req.params.id, user : req.user._id }
        const review = await Review.findOneAndDelete(filter)
        if (!review) return sendError(res, 404, "Review not found")
        return sendData(res, review)
    } catch (error) {
        return handleControllerError(error, res)
    }
}
