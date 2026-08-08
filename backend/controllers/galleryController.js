import GalleryItem from "../models/galleryItemModel.js";
import { handleControllerError, isValidObjectId, sendData, sendError } from "../utilities/http.js";

export async function getGallery(req, res) {
    try {
        return sendData(res, await GalleryItem.find().sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getGalleryItem(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid gallery item ID")
        const item = await GalleryItem.findById(req.params.id)
        if (!item) return sendError(res, 404, "Gallery item not found")
        return sendData(res, item)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function createGalleryItem(req, res) {
    try {
        return sendData(res, await GalleryItem.create(req.body), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateGalleryItem(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid gallery item ID")
        const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true })
        if (!item) return sendError(res, 404, "Gallery item not found")
        return sendData(res, item)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function deleteGalleryItem(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid gallery item ID")
        const item = await GalleryItem.findByIdAndDelete(req.params.id)
        if (!item) return sendError(res, 404, "Gallery item not found")
        return sendData(res, item)
    } catch (error) {
        return handleControllerError(error, res)
    }
}
