import CategoryItem from "../models/categoryModel.js";
import { handleControllerError, isValidObjectId, sendData, sendError } from "../utilities/http.js";

export async function getCategories(req, res) {
    try {
        return sendData(res, await CategoryItem.find().sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getCategory(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid category ID")
        const category = await CategoryItem.findById(req.params.id)
        if (!category) return sendError(res, 404, "Category not found")
        return sendData(res, category)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function createCategory(req, res) {
    try {
        return sendData(res, await CategoryItem.create(req.body), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateCategory(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid category ID")
        const category = await CategoryItem.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true })
        if (!category) return sendError(res, 404, "Category not found")
        return sendData(res, category)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function deleteCategory(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid category ID")
        const category = await CategoryItem.findByIdAndDelete(req.params.id)
        if (!category) return sendError(res, 404, "Category not found")
        return sendData(res, category)
    } catch (error) {
        return handleControllerError(error, res)
    }
}
