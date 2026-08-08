import Cart from "../models/cartModel.js";
import CustomizationRequest from "../models/customizationRequestModel.js";
import Item from "../models/itemModel.js";
import { handleControllerError, isValidObjectId, sendData, sendError } from "../utilities/http.js";

async function loadCart(userId) {
    return Cart.findOne({ user : userId }).populate(["items.item", "items.customization"])
}

export async function getCart(req, res) {
    try {
        const cart = await loadCart(req.user._id)
        return sendData(res, cart ?? { user : req.user._id, items : [] })
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function addCartItem(req, res) {
    try {
        if (!isValidObjectId(req.body.item)) return sendError(res, 400, "Invalid item ID")
        const item = await Item.findById(req.body.item)
        if (!item || !item.isAvailable) return sendError(res, 404, "Item not found or unavailable")
        if (!item.availableSizes.includes(req.body.size)) return sendError(res, 400, "Requested size is unavailable")

        const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity)
        if (!Number.isInteger(quantity) || quantity < 1) return sendError(res, 400, "Quantity must be a positive integer")

        let cart = await Cart.findOne({ user : req.user._id })
        if (!cart) cart = new Cart({ user : req.user._id, items : [] })
        const existing = cart.items.find((entry) => entry.item?.equals(item._id) && entry.size === req.body.size)
        if (existing) existing.quantity += quantity
        else cart.items.push({ type : "normal", item : item._id, size : req.body.size, quantity })
        await cart.save()

        return sendData(res, await loadCart(req.user._id), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function addCustomizationToCart(req, res) {
    try {
        if (!isValidObjectId(req.params.customizationId)) return sendError(res, 400, "Invalid customization ID")
        const customization = await CustomizationRequest.findOne({
            _id : req.params.customizationId,
            customer : req.user._id,
            status : { $ne : "cancelled" }
        })
        if (!customization) return sendError(res, 404, "Customization not found")

        let cart = await Cart.findOne({ user : req.user._id })
        if (!cart) cart = new Cart({ user : req.user._id, items : [] })
        const existing = cart.items.find((entry) => entry.customization?.equals(customization._id))
        if (!existing) {
            cart.items.push({
                type : "custom",
                customization : customization._id,
                quantity : customization.quantity
            })
            await cart.save()
        }
        return sendData(res, await loadCart(req.user._id), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function removeCustomizationFromCart(req, res) {
    try {
        if (!isValidObjectId(req.params.customizationId)) return sendError(res, 400, "Invalid customization ID")
        const cart = await Cart.findOne({ user : req.user._id })
        if (!cart) return sendError(res, 404, "Cart not found")
        const originalLength = cart.items.length
        cart.items = cart.items.filter((entry) => !entry.customization?.equals(req.params.customizationId))
        if (cart.items.length === originalLength) return sendError(res, 404, "Customized cart item not found")
        await cart.save()
        return sendData(res, await loadCart(req.user._id))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateCartItem(req, res) {
    try {
        if (!isValidObjectId(req.params.itemId)) return sendError(res, 400, "Invalid item ID")
        const cart = await Cart.findOne({ user : req.user._id })
        if (!cart) return sendError(res, 404, "Cart not found")
        const entry = cart.items.find((value) => value.item?.equals(req.params.itemId) && (!req.body.currentSize || value.size === req.body.currentSize))
        if (!entry) return sendError(res, 404, "Cart item not found")

        if (req.body.size !== undefined) {
            const item = await Item.findById(req.params.itemId)
            if (!item?.availableSizes.includes(req.body.size)) return sendError(res, 400, "Requested size is unavailable")
            entry.size = req.body.size
        }
        if (req.body.quantity !== undefined) {
            const quantity = Number(req.body.quantity)
            if (!Number.isInteger(quantity) || quantity < 1) return sendError(res, 400, "Quantity must be a positive integer")
            entry.quantity = quantity
        }

        await cart.save()
        return sendData(res, await loadCart(req.user._id))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function removeCartItem(req, res) {
    try {
        if (!isValidObjectId(req.params.itemId)) return sendError(res, 400, "Invalid item ID")
        const cart = await Cart.findOne({ user : req.user._id })
        if (!cart) return sendError(res, 404, "Cart not found")
        const originalLength = cart.items.length
        cart.items = cart.items.filter((entry) => !entry.item?.equals(req.params.itemId))
        if (cart.items.length === originalLength) return sendError(res, 404, "Cart item not found")
        await cart.save()
        return sendData(res, await loadCart(req.user._id))
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function clearCart(req, res) {
    try {
        await Cart.findOneAndDelete({ user : req.user._id })
        return sendData(res, { user : req.user._id, items : [] })
    } catch (error) {
        return handleControllerError(error, res)
    }
}
