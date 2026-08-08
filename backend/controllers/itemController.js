import Item from "../models/itemModel.js";
import { handleControllerError, isValidObjectId, parseBoolean, sendData, sendError } from "../utilities/http.js";

export async function getItems(req, res) {
    try {
        const filter = {}
        for (const field of ["category", "theme", "color"]) {
            if (req.query[field]) filter[field] = req.query[field]
        }
        if (req.query.size) filter.availableSizes = req.query.size

        for (const field of ["isFeatured", "isAvailable"]) {
            const value = parseBoolean(req.query[field])
            if (value === null) return sendError(res, 400, `${field} must be true or false`)
            if (value !== undefined) filter[field] = value
        }

        const items = await Item.find(filter).sort({ createdAt : -1 })
        return sendData(res, items)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getItem(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid item ID")
        const item = await Item.findById(req.params.id)
        if (!item) return sendError(res, 404, "Item not found")
        return sendData(res, item)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getItemBySlug(req, res) {
    try {
        const item = await Item.findOne({ slug : req.params.slug.toLowerCase() })
        if (!item) return sendError(res, 404, "Item not found")
        return sendData(res, item)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function createItem(req, res) {
    try {
        return sendData(res, await Item.create(req.body), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateItem(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid item ID")
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true })
        if (!item) return sendError(res, 404, "Item not found")
        return sendData(res, item)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function archiveItem(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid item ID")
        const item = await Item.findByIdAndUpdate(req.params.id, { isAvailable : false }, { new : true })
        if (!item) return sendError(res, 404, "Item not found")
        return sendData(res, item)
    } catch (error) {
        return handleControllerError(error, res)
    }
}
