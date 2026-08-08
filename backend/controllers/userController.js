import argon2 from "argon2";
import jwt from "jsonwebtoken";

import User from "../models/userModel.js";
import { handleControllerError, isValidObjectId, pick, sendData, sendError } from "../utilities/http.js";

const publicProfileFields = ["firstName", "lastName", "email", "whatsApp", "phone"]
const adminProfileFields = [...publicProfileFields, "type", "isDisabled", "isEmailVerified"]

function safeUser(user) {
    const value = user.toObject ? user.toObject() : { ...user }
    delete value.password
    return value
}

export async function register(req, res) {
    try {
        if (!req.body.password) return sendError(res, 400, "Password is required")

        const email = String(req.body.email ?? "").trim().toLowerCase()
        if (await User.exists({ email })) return sendError(res, 409, "email already exists")

        const user = await User.create({
            ...pick(req.body, publicProfileFields),
            email,
            password : await argon2.hash(req.body.password),
            type : "customer"
        })

        return sendData(res, safeUser(user), 201)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function login(req, res) {
    try {
        const email = String(req.body.email ?? "").trim().toLowerCase()
        const password = req.body.password
        if (!email || !password) return sendError(res, 400, "Email and password are required")

        const user = await User.findOne({ email })
        if (!user || !(await argon2.verify(user.password, password))) {
            return sendError(res, 401, "Incorrect email or password")
        }
        if (user.isDisabled) return sendError(res, 403, "Account is disabled")
        if (!process.env.JWT_KEY) return sendError(res, 500, "Authentication is not configured")

        const token = jwt.sign({ id : user._id.toString() }, process.env.JWT_KEY, { expiresIn : "7d" })
        return sendData(res, { token, user : safeUser(user) })
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getMe(req, res) {
    return sendData(res, safeUser(req.user))
}

export async function updateMe(req, res) {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            pick(req.body, publicProfileFields),
            { new : true, runValidators : true }
        ).select("-password")
        return sendData(res, user)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getUsers(req, res) {
    try {
        const users = await User.find().select("-password").sort({ createdAt : -1 })
        return sendData(res, users)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function getUser(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid user ID")
        const user = await User.findById(req.params.id).select("-password")
        if (!user) return sendError(res, 404, "User not found")
        return sendData(res, user)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateUser(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid user ID")
        const user = await User.findByIdAndUpdate(
            req.params.id,
            pick(req.body, adminProfileFields),
            { new : true, runValidators : true }
        ).select("-password")
        if (!user) return sendError(res, 404, "User not found")
        return sendData(res, user)
    } catch (error) {
        return handleControllerError(error, res)
    }
}

export async function updateUserStatus(req, res) {
    try {
        if (!isValidObjectId(req.params.id)) return sendError(res, 400, "Invalid user ID")
        if (typeof req.body.isDisabled !== "boolean") {
            return sendError(res, 400, "isDisabled must be a boolean")
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isDisabled : req.body.isDisabled },
            { new : true, runValidators : true }
        ).select("-password")
        if (!user) return sendError(res, 404, "User not found")
        return sendData(res, user)
    } catch (error) {
        return handleControllerError(error, res)
    }
}
