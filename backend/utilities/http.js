import mongoose from "mongoose";

export function sendData(res, data, status = 200) {
    return res.status(status).json({
        success : true,
        data
    })
}

export function sendError(res, status, message) {
    return res.status(status).json({
        success : false,
        message
    })
}

export function handleControllerError(error, res) {
    if (error?.status) return sendError(res, error.status, error.message)
    if (error?.name === "ValidationError" || error?.name === "CastError") {
        return sendError(res, 400, error.message)
    }

    if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern ?? error.keyValue ?? {})[0]
        return sendError(res, 409, field ? `${field} already exists` : "Resource already exists")
    }

    console.error(error)
    return sendError(res, 500, "An unexpected server error occurred")
}

export function isValidObjectId(value) {
    return mongoose.isValidObjectId(value)
}

export function pick(source, fields) {
    return fields.reduce((result, field) => {
        if (source[field] !== undefined) {
            result[field] = source[field]
        }
        return result
    }, {})
}

export function parseBoolean(value) {
    if (value === undefined) return undefined
    if (value === "true" || value === true) return true
    if (value === "false" || value === false) return false
    return null
}
