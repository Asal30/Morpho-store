import Inventory from "../models/inventoryModel.js";
import Item from "../models/itemModel.js";
import { handleControllerError, isValidObjectId, sendData, sendError } from "../utilities/http.js";

export async function getInventory(req, res) {
    try {
        return sendData(res, await Inventory.find().populate("item").sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getInventoryRecord(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid inventory ID")
        const record = await Inventory.findById(req.params.id).populate("item")
        if (!record) return sendError(res, 404, "Inventory record not found")
        return sendData(res, record)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getItemInventory(req, res) {
    try {
        if (!isValidObjectId(req.params.itemId)) return sendError(res, 400, "Invalid item ID")
        return sendData(res, await Inventory.find({ item : req.params.itemId }).sort({ size : 1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function createInventory(req, res) {
    try {
        if (!isValidObjectId(req.body.item)) return sendError(res, 400, "Invalid item ID")
        if (!(await Item.exists({ _id : req.body.item }))) return sendError(res, 404, "Item not found")
        return sendData(res, await Inventory.create(req.body), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateInventory(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid inventory ID")
        const record = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new : true, runValidators : true })
        if (!record) return sendError(res, 404, "Inventory record not found")
        return sendData(res, record)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function deleteInventory(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid inventory ID")
        const record = await Inventory.findByIdAndDelete(req.params.id)
        if (!record) return sendError(res, 404, "Inventory record not found")
        return sendData(res, record)
    } catch (error) {
        return handleControllerError(error, res)
    }
}
