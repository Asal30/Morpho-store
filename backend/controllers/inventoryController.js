import Inventory from "../models/inventoryModel.js";
import Item from "../models/itemModel.js";
import { handleControllerError, isValidObjectId, parseBoolean, pick, sendData, sendError } from "../utilities/http.js";

function inventoryInput(body) {
    const input = pick(body, ["item", "size", "quantity", "sold", "reserved", "isAvailable", "notes"])
    for (const field of ["quantity", "sold", "reserved"]) if (input[field] !== undefined) { input[field] = Number(input[field]); if (!Number.isInteger(input[field]) || input[field] < 0) throw Object.assign(new Error(`${field} must be a non-negative integer`), { status : 400 }) }
    if (input.isAvailable !== undefined) { input.isAvailable = parseBoolean(input.isAvailable); if (input.isAvailable === null) throw Object.assign(new Error("isAvailable must be true or false"), { status : 400 }) }
    return input
}

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
        const input = inventoryInput(req.body)
        if (!isValidObjectId(input.item)) return sendError(res, 400, "Invalid item ID")
        const item = await Item.findById(input.item)
        if (!item) return sendError(res, 404, "Item not found")
        if (!item.availableSizes.includes(input.size)) return sendError(res, 400, "Size is not offered by this item")
        return sendData(res, await Inventory.create(input), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateInventory(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid inventory ID")
        const record = await Inventory.findById(req.params.id)
        if (!record) return sendError(res, 404, "Inventory record not found")
        const input = inventoryInput(req.body)
        const itemId = input.item ?? record.item
        if (!isValidObjectId(itemId)) return sendError(res, 400, "Invalid item ID")
        const item = await Item.findById(itemId); if (!item) return sendError(res, 404, "Item not found")
        if (!item.availableSizes.includes(input.size ?? record.size)) return sendError(res, 400, "Size is not offered by this item")
        Object.assign(record, input); await record.save()
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
