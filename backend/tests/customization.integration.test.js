import assert from "node:assert/strict";
import test from "node:test";

import argon2 from "argon2";
import jwt from "jsonwebtoken";

import app from "../index.js";
import Cart from "../models/cartModel.js";
import CategoryItem from "../models/categoryModel.js";
import CustomizationRequest from "../models/customizationRequestModel.js";
import Item from "../models/itemModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

test("customization API enforces upload, ownership, pricing, cart, and order boundaries", async (context) => {
    process.env.JWT_KEY = "customizer-test-key"
    const userId = "507f1f77bcf86cd799439011"
    const customId = "507f1f77bcf86cd799439013"
    const user = {
        _id : userId,
        firstName : "Test",
        lastName : "Customer",
        email : "customer@example.com",
        phone : "1",
        whatsApp : "1",
        type : "customer",
        isDisabled : false
    }

    User.findById = () => ({ select : async () => user })
    User.exists = async () => false
    User.create = async (data) => ({
        _id : userId,
        ...data,
        toObject : () => ({ _id : userId, ...data })
    })
    const passwordHash = await argon2.hash("ValidPassword1")
    User.findOne = async () => ({
        ...user,
        password : passwordHash,
        toObject : () => ({ ...user, password : passwordHash })
    })
    CategoryItem.findOne = async () => null

    let createdCustomization
    CustomizationRequest.create = async (data) => {
        createdCustomization = new CustomizationRequest({ _id : customId, ...data })
        const validationError = createdCustomization.validateSync()
        if (validationError) throw validationError
        return createdCustomization
    }

    const cart = {
        items : [],
        save : async function () { return this },
        populate : async function () { return this }
    }
    Cart.findOne = async () => cart

    let orderPayload
    Order.create = async (data) => {
        orderPayload = data
        return { orderID : "ORDER-TEST", ...data }
    }

    const server = app.listen(0)
    await new Promise((resolve) => server.once("listening", resolve))
    context.after(() => server.close())
    const baseUrl = `http://127.0.0.1:${server.address().port}`
    const token = jwt.sign({ id : userId }, process.env.JWT_KEY)
    const authorization = { Authorization : `Bearer ${token}` }
    const read = async (response) => ({ status : response.status, body : await response.json() })

    const quote = await read(await fetch(`${baseUrl}/api/customizations/quote`, {
        method : "POST",
        headers : { "content-type" : "application/json" },
        body : JSON.stringify({
            category : "Oversize",
            color : "Black",
            size : "M",
            quantity : 2,
            placements : ["front"]
        })
    }))
    assert.equal(quote.status, 200)
    assert.equal(quote.body.data.unitPrice, 300000)
    assert.equal(quote.body.data.totalPrice, 600000)

    const form = new FormData()
    form.set("category", "Oversize")
    form.set("color", "Black")
    form.set("size", "M")
    form.set("quantity", "2")
    form.set("description", "Text design")
    form.set("unitPrice", "1")
    form.set("totalPrice", "1")
    form.set("customText", JSON.stringify({
        text : "MORPHO",
        font : "Manrope",
        fontSize : 32,
        color : "#111111",
        alignment : "center",
        placement : "front"
    }))
    const created = await read(await fetch(`${baseUrl}/api/customizations`, {
        method : "POST",
        headers : authorization,
        body : form
    }))
    assert.equal(created.status, 201)
    assert.equal(created.body.data.customization.unitPrice, 300000)
    assert.equal(created.body.data.customization.totalPrice, 600000)
    assert.equal(cart.items.length, 1)
    assert.equal(cart.items[0].type, "custom")

    const invalidForm = new FormData()
    invalidForm.set("frontArtwork", new Blob(["<svg/>"] , { type : "image/svg+xml" }), "bad.svg")
    const invalidFile = await read(await fetch(`${baseUrl}/api/customizations`, {
        method : "POST",
        headers : authorization,
        body : invalidForm
    }))
    assert.equal(invalidFile.status, 400)

    const largeForm = new FormData()
    largeForm.set(
        "frontArtwork",
        new Blob([new Uint8Array(10 * 1024 * 1024 + 1)], { type : "image/png" }),
        "large.png"
    )
    const largeFile = await read(await fetch(`${baseUrl}/api/customizations`, {
        method : "POST",
        headers : authorization,
        body : largeForm
    }))
    assert.equal(largeFile.status, 400)

    delete process.env.CLOUDINARY_CLOUD_NAME
    delete process.env.CLOUDINARY_API_KEY
    delete process.env.CLOUDINARY_API_SECRET
    const validArtworkForm = new FormData()
    validArtworkForm.set("frontArtwork", new Blob([new Uint8Array([137, 80, 78, 71])], { type : "image/png" }), "transparent.png")
    const unavailableUpload = await read(await fetch(`${baseUrl}/api/customizations`, {
        method : "POST",
        headers : authorization,
        body : validArtworkForm
    }))
    assert.equal(unavailableUpload.status, 503)

    CustomizationRequest.findOne = () => ({ populate : async () => null })
    const otherCustomer = await read(await fetch(`${baseUrl}/api/customizations/${customId}`, {
        headers : authorization
    }))
    assert.equal(otherCustomer.status, 404)

    CustomizationRequest.findOne = async () => createdCustomization
    const order = await read(await fetch(`${baseUrl}/api/orders`, {
        method : "POST",
        headers : { ...authorization, "content-type" : "application/json" },
        body : JSON.stringify({
            items : [{ customization : customId, unitPrice : 1, totalPrice : 1 }],
            customerName : "Test Customer",
            email : "customer@example.com",
            phone : "1",
            shippingAddress : { addressLine1 : "1 Main", city : "Colombo", district : "Colombo" },
            paymentMethod : "cash-on-delivery"
        })
    }))
    assert.equal(order.status, 201)
    assert.equal(orderPayload.items[0].unitPrice, 300000)
    assert.equal(orderPayload.items[0].totalPrice, 600000)
    assert.equal(orderPayload.items[0].customizationSnapshot.customText.text, "MORPHO")

    Item.findById = async () => ({
        _id : "507f1f77bcf86cd799439014",
        itemID : "MORPHO-001",
        name : "Standard item",
        availableSizes : ["M"],
        color : "Black",
        price : 250000,
        isAvailable : true
    })
    const normalOrder = await read(await fetch(`${baseUrl}/api/orders`, {
        method : "POST",
        headers : { ...authorization, "content-type" : "application/json" },
        body : JSON.stringify({
            items : [{ item : "507f1f77bcf86cd799439014", size : "M", quantity : 2 }],
            customerName : "Test Customer",
            email : "customer@example.com",
            phone : "1",
            shippingAddress : { addressLine1 : "1 Main", city : "Colombo", district : "Colombo" },
            paymentMethod : "cash-on-delivery"
        })
    }))
    assert.equal(normalOrder.status, 201)
    assert.equal(orderPayload.items[0].type, "normal")
    assert.equal(orderPayload.items[0].totalPrice, 500000)
})
