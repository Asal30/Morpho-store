import multer from "multer";
import { sendError } from "../utilities/http.js";

export const MAX_PRODUCT_IMAGES = 8
const acceptedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/avif"])
const upload = multer({
    storage : multer.memoryStorage(),
    limits : { fileSize : 10 * 1024 * 1024, files : MAX_PRODUCT_IMAGES },
    fileFilter : (req, file, callback) => {
        if (!acceptedMimeTypes.has(file.mimetype)) {
            const error = new Error("Product images must be PNG, JPEG, WEBP, or AVIF")
            error.code = "UNSUPPORTED_PRODUCT_IMAGE"
            return callback(error)
        }
        callback(null, true)
    }
})

export function handleProductImages(req, res, next) {
    upload.array("images", MAX_PRODUCT_IMAGES)(req, res, (error) => {
        if (!error) return next()
        if (error.code === "LIMIT_FILE_SIZE") return sendError(res, 413, "Each product image must be 10 MB or smaller")
        if (error.code === "LIMIT_FILE_COUNT" || error.code === "LIMIT_UNEXPECTED_FILE") return sendError(res, 400, `Upload at most ${MAX_PRODUCT_IMAGES} images using the images field`)
        if (error.code === "UNSUPPORTED_PRODUCT_IMAGE") return sendError(res, 400, error.message)
        return sendError(res, 400, "Unable to read product images")
    })
}
