import CustomizationRequest from "../models/customizationRequestModel.js";
import { handleControllerError, isValidObjectId, pick, sendData, sendError } from "../utilities/http.js";

const customerFields = ["category", "size", "color", "artwork", "description"]
const editableStatuses = ["pending", "reviewing"]

export async function createCustomizationRequest(req, res) {
    try {
        const request = await CustomizationRequest.create({
            ...pick(req.body, customerFields),
            requestID : `CUSTOM-${Date.now()}-${req.user._id.toString().slice(-6).toUpperCase()}`,
            customer : req.user._id,
            status : "pending"
        })
        return sendData(res, request, 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getMyCustomizationRequests(req, res) {
    try {
        return sendData(res, await CustomizationRequest.find({ customer : req.user._id }).sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getCustomizationRequest(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid customization request ID")
        const filter = req.user.type === "admin"
            ? { _id : req.params.id }
            : { _id : req.params.id, customer : req.user._id }
        const request = await CustomizationRequest.findOne(filter)
        if (!request) return sendError(res, 404, "Customization request not found")
        return sendData(res, request)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateMyCustomizationRequest(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid customization request ID")
        const current = await CustomizationRequest.findOne({ _id : req.params.id, customer : req.user._id })
        if (!current) return sendError(res, 404, "Customization request not found")
        if (!editableStatuses.includes(current.status)) return sendError(res, 409, "Customization request can no longer be edited")
        Object.assign(current, pick(req.body, customerFields))
        await current.save()
        return sendData(res, current)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function cancelMyCustomizationRequest(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid customization request ID")
        const request = await CustomizationRequest.findOne({ _id : req.params.id, customer : req.user._id })
        if (!request) return sendError(res, 404, "Customization request not found")
        if (!editableStatuses.includes(request.status)) return sendError(res, 409, "Customization request can no longer be cancelled")
        request.status = "cancelled"
        await request.save()
        return sendData(res, request)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getCustomizationRequests(req, res) {
    try {
        return sendData(res, await CustomizationRequest.find().populate("customer", "-password").sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateCustomizationRequest(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid customization request ID")
        const request = await CustomizationRequest.findByIdAndUpdate(
            req.params.id,
            pick(req.body, [...customerFields, "notes", "price"]),
            { new : true, runValidators : true }
        )
        if (!request) return sendError(res, 404, "Customization request not found")
        return sendData(res, request)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateCustomizationStatus(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid customization request ID")
        if (!req.body.status) return sendError(res, 400, "status is required")
        const request = await CustomizationRequest.findByIdAndUpdate(
            req.params.id,
            { status : req.body.status },
            { new : true, runValidators : true }
        )
        if (!request) return sendError(res, 404, "Customization request not found")
        return sendData(res, request)
    } catch (error) {
        return handleControllerError(error, res)
    }
}
