import Cart from "../models/cartModel.js";
import CustomizationRequest from "../models/customizationRequestModel.js";
import { configureCloudinary, uploadArtworkBuffer } from "../config/cloudinary.js";
import { calculateCustomizationPrice } from "../utilities/customizationPricing.js";
import { handleControllerError, isValidObjectId, pick, sendData, sendError } from "../utilities/http.js";

const customerFields = ["category", "size", "color", "description"]
const editableStatuses = ["pending", "reviewing"]

function parseCustomText(value) {
    if (!value) return undefined
    if (typeof value === "object") return value
    try {
        return JSON.parse(value)
    } catch {
        throw new Error("Invalid custom text configuration")
    }
}

function artworkFiles(req) {
    return [
        ...(req.files?.frontArtwork ?? []).map((file) => ({ file, placement : "front" })),
        ...(req.files?.backArtwork ?? []).map((file) => ({ file, placement : "back" }))
    ]
}

async function uploadArtwork(files, userId) {
    if (files.length === 0) return []
    if (!configureCloudinary()) throw new Error("Cloudinary is not configured")

    return Promise.all(files.map(async ({ file, placement }) => {
        const result = await uploadArtworkBuffer(file, `morpho/customizations/${userId}`)
        if (!result?.secure_url || !result.public_id) throw new Error("Cloudinary upload failed")
        return {
            url : result.url,
            secureUrl : result.secure_url,
            publicId : result.public_id,
            originalFilename : file.originalname,
            placement,
            format : result.format,
            width : result.width,
            height : result.height
        }
    }))
}

function getPlacements(artwork, customText) {
    return [
        ...artwork.map((entry) => entry.placement),
        ...(customText?.text ? [customText.placement] : [])
    ].filter(Boolean)
}

export async function quoteCustomization(req, res) {
    try {
        const quote = await calculateCustomizationPrice({
            category : req.body.category,
            color : req.body.color,
            size : req.body.size,
            quantity : req.body.quantity,
            placements : Array.isArray(req.body.placements) ? req.body.placements : []
        })
        return sendData(res, quote)
    } catch (error) {
        if (error.message?.startsWith("Unsupported") || error.message?.startsWith("Quantity")) {
            return sendError(res, 400, error.message)
        }
        return handleControllerError(error, res)
    }
}

export async function createCustomizationRequest(req, res) {
    try {
        const customText = parseCustomText(req.body.customText)
        const files = artworkFiles(req)
        if (files.length === 0 && !customText?.text?.trim()) {
            return sendError(res, 400, "Add artwork or custom text before saving")
        }

        const artwork = await uploadArtwork(files, req.user._id.toString())
        const quote = await calculateCustomizationPrice({
            category : req.body.category,
            color : req.body.color,
            size : req.body.size,
            quantity : req.body.quantity,
            placements : getPlacements(artwork, customText)
        })
        const request = await CustomizationRequest.create({
            ...pick(req.body, customerFields),
            requestID : `CUSTOM-${Date.now()}-${req.user._id.toString().slice(-6).toUpperCase()}`,
            customer : req.user._id,
            quantity : quote.quantity,
            artwork,
            customText,
            price : quote.totalPrice,
            unitPrice : quote.unitPrice,
            totalPrice : quote.totalPrice,
            status : "pending"
        })

        let cart = await Cart.findOne({ user : req.user._id })
        if (!cart) cart = new Cart({ user : req.user._id, items : [] })
        cart.items.push({
            type : "custom",
            customization : request._id,
            quantity : request.quantity
        })
        await cart.save()
        await cart.populate(["items.item", "items.customization"])

        return sendData(res, { customization : request, cart }, 201)
    } catch (error) {
        if (error.message === "Cloudinary is not configured") {
            return sendError(res, 503, "Artwork upload is not configured")
        }
        if (error.message === "Invalid custom text configuration" || error.message?.startsWith("Unsupported") || error.message?.startsWith("Quantity")) {
            return sendError(res, 400, error.message)
        }
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
        const request = await CustomizationRequest.findOne(filter).populate("customer", "-password")
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

        const customText = parseCustomText(req.body.customText) ?? current.customText
        const quantity = req.body.quantity ?? current.quantity
        const nextFields = { ...pick(req.body, customerFields), customText, quantity }
        const quote = await calculateCustomizationPrice({
            category : nextFields.category ?? current.category,
            color : nextFields.color ?? current.color,
            size : nextFields.size ?? current.size,
            quantity,
            placements : getPlacements(current.artwork, customText)
        })
        Object.assign(current, nextFields, {
            price : quote.totalPrice,
            unitPrice : quote.unitPrice,
            totalPrice : quote.totalPrice
        })
        await current.save()
        await Cart.updateOne(
            { user : req.user._id, "items.customization" : current._id },
            { $set : { "items.$.quantity" : current.quantity } }
        )
        return sendData(res, current)
    } catch (error) {
        if (error.message === "Invalid custom text configuration" || error.message?.startsWith("Unsupported") || error.message?.startsWith("Quantity")) {
            return sendError(res, 400, error.message)
        }
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
        await Cart.updateOne({ user : req.user._id }, { $pull : { items : { customization : request._id } } })
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
            pick(req.body, ["notes"]),
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
