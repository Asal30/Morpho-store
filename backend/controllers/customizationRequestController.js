import Cart from "../models/cartModel.js";
import CustomizationRequest from "../models/customizationRequestModel.js";
import { configureCloudinary, uploadArtworkBuffer } from "../config/cloudinary.js";
import { getDefaultBranding } from "../config/customization.js";
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

function parseJson(value, message) {
    if (value === undefined) return undefined
    if (typeof value === "object") return value
    try {
        return JSON.parse(value)
    } catch {
        throw new Error(message)
    }
}

function parseDesignObjects(value) {
    const objects = parseJson(value, "Invalid design configuration")
    if (objects === undefined) return undefined
    if (!Array.isArray(objects) || objects.length > 20) throw new Error("Invalid design configuration")
    return objects.map((object, zIndex) => {
        if (!["artwork", "text"].includes(object.type) || !["front", "back"].includes(object.placement)) {
            throw new Error("Invalid design configuration")
        }
        const numericFields = ["x", "y", "width", "height", "scaleX", "scaleY", "rotation"]
        if (numericFields.some((field) => !Number.isFinite(Number(object[field])))) {
            throw new Error("Invalid design configuration")
        }
        const base = {
            id : String(object.id ?? "").slice(0, 100),
            type : object.type,
            placement : object.placement,
            x : Number(object.x),
            y : Number(object.y),
            width : Number(object.width),
            height : Number(object.height),
            scaleX : Number(object.scaleX),
            scaleY : Number(object.scaleY),
            rotation : Number(object.rotation),
            zIndex
        }
        if (!base.id || base.x < -1 || base.x > 2 || base.y < -1 || base.y > 2 ||
            base.width <= 0 || base.width > 3 || base.height <= 0 || base.height > 3 ||
            base.scaleX <= 0 || base.scaleX > 20 || base.scaleY <= 0 || base.scaleY > 20 ||
            base.rotation < -3600 || base.rotation > 3600) {
            throw new Error("Invalid design configuration")
        }
        if (object.type === "text" && (!object.text?.trim() || !["left", "center", "right"].includes(object.textAlign) ||
            !Number.isFinite(Number(object.fontSize)) || Number(object.fontSize) < 8 || Number(object.fontSize) > 96)) {
            throw new Error("Invalid design configuration")
        }
        return object.type === "artwork"
            ? { ...base, assetKey : object.placement === "front" ? "frontArtwork" : "backArtwork" }
            : {
                ...base,
                text : String(object.text ?? "").slice(0, 80),
                fontFamily : object.fontFamily,
                fontSize : Number(object.fontSize),
                fill : String(object.fill ?? "").slice(0, 20),
                textAlign : object.textAlign
            }
    })
}

function artworkFiles(req) {
    return [
        ...(req.files?.frontArtwork ?? []).map((file) => ({ file, placement : "front" })),
        ...(req.files?.backArtwork ?? []).map((file) => ({ file, placement : "back" }))
    ]
}

function validateCustomerContent(designObjects, artworkPlacements, customText) {
    const configuredArtworkSides = new Set(designObjects.filter((object) => object.type === "artwork").map((object) => object.placement))
    const availableArtworkSides = new Set(artworkPlacements)
    if ([...configuredArtworkSides].some((side) => !availableArtworkSides.has(side)) ||
        [...availableArtworkSides].some((side) => !configuredArtworkSides.has(side))) {
        throw new Error("Artwork and design configuration do not match")
    }
    const textSides = new Set(designObjects.filter((object) => object.type === "text").map((object) => object.placement))
    const hasCustomText = Boolean(customText?.text?.trim())
    if (hasCustomText !== (textSides.size > 0) || (hasCustomText && !textSides.has(customText.placement))) {
        throw new Error("Custom text and design configuration do not match")
    }
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

export async function quoteCustomization(req, res) {
    try {
        const designObjects = parseDesignObjects(req.body.designObjects ?? [])
        const quote = await calculateCustomizationPrice({
            category : req.body.category,
            color : req.body.color,
            size : req.body.size,
            quantity : req.body.quantity,
            designObjects
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
        const designObjects = parseDesignObjects(req.body.designObjects) ?? []
        const files = artworkFiles(req)
        validateCustomerContent(designObjects, files.map((entry) => entry.placement), customText)

        const artwork = await uploadArtwork(files, req.user._id.toString())
        const quote = await calculateCustomizationPrice({
            category : req.body.category,
            color : req.body.color,
            size : req.body.size,
            quantity : req.body.quantity,
            designObjects
        })
        const request = await CustomizationRequest.create({
            ...pick(req.body, customerFields),
            requestID : `CUSTOM-${Date.now()}-${req.user._id.toString().slice(-6).toUpperCase()}`,
            customer : req.user._id,
            quantity : quote.quantity,
            artwork,
            customText,
            designObjects,
            defaultBranding : getDefaultBranding(req.body.category, req.body.color, designObjects),
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
        if (["Invalid custom text configuration", "Invalid design configuration", "Artwork and design configuration do not match", "Custom text and design configuration do not match"].includes(error.message) || error.message?.startsWith("Unsupported") || error.message?.startsWith("Quantity")) {
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
        const designObjects = parseDesignObjects(req.body.designObjects) ?? current.designObjects
        const removedPlacements = parseJson(req.body.removedArtworkPlacements, "Invalid artwork removal configuration") ?? []
        if (!Array.isArray(removedPlacements) || removedPlacements.some((placement) => !["front", "back"].includes(placement))) {
            return sendError(res, 400, "Invalid artwork removal configuration")
        }
        const files = artworkFiles(req)
        const replacedFilePlacements = new Set(files.map((entry) => entry.placement))
        const retainedArtworkPlacements = current.artwork
            .filter((item) => !removedPlacements.includes(item.placement) && !replacedFilePlacements.has(item.placement))
            .map((item) => item.placement)
        validateCustomerContent(designObjects, [...retainedArtworkPlacements, ...replacedFilePlacements], customText)
        const uploadedArtwork = await uploadArtwork(files, req.user._id.toString())
        const replacedPlacements = new Set(uploadedArtwork.map((item) => item.placement))
        const artwork = [
            ...current.artwork.filter((item) => !removedPlacements.includes(item.placement) && !replacedPlacements.has(item.placement)),
            ...uploadedArtwork
        ]
        const quantity = req.body.quantity ?? current.quantity
        const nextFields = { ...pick(req.body, customerFields), customText, designObjects, artwork, quantity }
        const quote = await calculateCustomizationPrice({
            category : nextFields.category ?? current.category,
            color : nextFields.color ?? current.color,
            size : nextFields.size ?? current.size,
            quantity,
            designObjects
        })
        Object.assign(current, nextFields, {
            defaultBranding : getDefaultBranding(nextFields.category ?? current.category, nextFields.color ?? current.color, designObjects),
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
        if (error.message === "Cloudinary is not configured") {
            return sendError(res, 503, "Artwork upload is not configured")
        }
        if (["Invalid custom text configuration", "Invalid design configuration", "Invalid artwork removal configuration", "Artwork and design configuration do not match", "Custom text and design configuration do not match"].includes(error.message) || error.message?.startsWith("Unsupported") || error.message?.startsWith("Quantity")) {
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
