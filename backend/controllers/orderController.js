import { randomUUID } from "node:crypto";

import Item from "../models/itemModel.js";
import CustomizationRequest from "../models/customizationRequestModel.js";
import Order from "../models/orderModel.js";
import { handleControllerError, isValidObjectId, pick, sendData, sendError } from "../utilities/http.js";

function createOrderID() {
    return `MORPHO-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`
}

export async function createOrder(req, res) {
    try {
        if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
            return sendError(res, 400, "At least one order item is required")
        }

        const snapshots = []
        for (const requestedItem of req.body.items) {
            if (requestedItem.customization) {
                if (!isValidObjectId(requestedItem.customization)) return sendError(res, 400, "Invalid customization ID")
                const customization = await CustomizationRequest.findOne({
                    _id : requestedItem.customization,
                    customer : req.user._id,
                    status : { $ne : "cancelled" }
                })
                if (!customization) return sendError(res, 400, "A customization is unavailable")
                snapshots.push({
                    type : "custom",
                    customization : customization._id,
                    size : customization.size,
                    color : customization.color,
                    quantity : customization.quantity,
                    unitPrice : customization.unitPrice,
                    totalPrice : customization.totalPrice,
                    customizationSnapshot : {
                        requestID : customization.requestID,
                        category : customization.category,
                        color : customization.color,
                        size : customization.size,
                        artwork : customization.artwork.map((artwork) => ({
                            secureUrl : artwork.secureUrl,
                            publicId : artwork.publicId,
                            originalFilename : artwork.originalFilename,
                            placement : artwork.placement,
                            format : artwork.format,
                            width : artwork.width,
                            height : artwork.height
                        })),
                        customText : customization.customText
                    }
                })
                continue
            }

            if (!isValidObjectId(requestedItem.item)) return sendError(res, 400, "Invalid item ID")
            const item = await Item.findById(requestedItem.item)
            if (!item || !item.isAvailable) return sendError(res, 400, "An order item is unavailable")

            const quantity = Number(requestedItem.quantity)
            if (!Number.isInteger(quantity) || quantity < 1) {
                return sendError(res, 400, "Order item quantity must be a positive integer")
            }
            if (!item.availableSizes.includes(requestedItem.size)) {
                return sendError(res, 400, `${item.name} is not available in the requested size`)
            }

            snapshots.push({
                type : "normal",
                item : item._id,
                itemID : item.itemID,
                name : item.name,
                size : requestedItem.size,
                color : item.color,
                quantity,
                unitPrice : item.price,
                totalPrice : item.price * quantity
            })
        }

        const subtotal = snapshots.reduce((total, item) => total + item.totalPrice, 0)
        const deliveryFee = 0
        const contact = pick(req.body, ["customerName", "email", "phone", "whatsApp", "shippingAddress", "paymentMethod", "notes"])

        const order = await Order.create({
            ...contact,
            orderID : createOrderID(),
            customer : req.user._id,
            items : snapshots,
            customerName : contact.customerName ?? `${req.user.firstName} ${req.user.lastName}`,
            email : contact.email ?? req.user.email,
            phone : contact.phone ?? req.user.phone,
            whatsApp : contact.whatsApp ?? req.user.whatsApp,
            subtotal,
            deliveryFee,
            total : subtotal + deliveryFee,
            paymentStatus : "pending",
            orderStatus : "pending"
        })

        return sendData(res, order, 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getMyOrders(req, res) {
    try {
        return sendData(res, await Order.find({ customer : req.user._id }).sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getOrder(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid order ID")
        const filter = req.user.type === "admin"
            ? { _id : req.params.id }
            : { _id : req.params.id, customer : req.user._id }
        const order = await Order.findOne(filter)
        if (!order) return sendError(res, 404, "Order not found")
        return sendData(res, order)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getOrders(req, res) {
    try {
        return sendData(res, await Order.find().populate("customer", "-password").sort({ createdAt : -1 }))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

async function updateOrderField(req, res, field) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid order ID")
        if (req.body[field] === undefined) return sendError(res, 400, `${field} is required`)
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { [field] : req.body[field] },
            { new : true, runValidators : true }
        )
        if (!order) return sendError(res, 404, "Order not found")
        return sendData(res, order)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export function updateOrderStatus(req, res) {
    return updateOrderField(req, res, "orderStatus")
}

export function updatePaymentStatus(req, res) {
    return updateOrderField(req, res, "paymentStatus")
}
