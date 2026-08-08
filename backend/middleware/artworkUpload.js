import multer from "multer";

import { sendError } from "../utilities/http.js";

const acceptedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"])

const artworkUpload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 10 * 1024 * 1024,
        files : 2
    },
    fileFilter : (req, file, callback) => {
        if (!acceptedMimeTypes.has(file.mimetype)) {
            const error = new Error("Artwork must be a PNG, JPEG, or WEBP image")
            error.code = "UNSUPPORTED_ARTWORK_TYPE"
            return callback(error)
        }
        callback(null, true)
    }
})

export const uploadCustomizationArtwork = artworkUpload.fields([
    { name : "frontArtwork", maxCount : 1 },
    { name : "backArtwork", maxCount : 1 }
])

export function handleArtworkUpload(req, res, next) {
    uploadCustomizationArtwork(req, res, (error) => {
        if (!error) return next()
        if (error.code === "LIMIT_FILE_SIZE") return sendError(res, 400, "Artwork must be 10 MB or smaller")
        if (error.code === "UNSUPPORTED_ARTWORK_TYPE") return sendError(res, 400, error.message)
        return sendError(res, 400, "Unable to read the uploaded artwork")
    })
}
