import { ALL_SIZES, CATEGORIES, THEMES, normalizeSlug, validateCategoryColor } from "../config/catalog.js";
import { parseBoolean, pick } from "./http.js";

const fields = ["itemID", "name", "slug", "category", "theme", "color", "price", "availableSizes", "description", "specialDescription", "notes", "isAvailable", "isFeatured"]
const invalid = (message) => Object.assign(new Error(message), { status : 400 })
function json(value, label) {
    if (typeof value !== "string") return value
    try { return JSON.parse(value) } catch { throw invalid(`${label} must be valid JSON`) }
}
export function parseItemInput(body, current = {}) {
    const input = pick(body, fields)
    for (const field of ["itemID", "name", "category", "theme", "color", "description", "specialDescription", "notes"]) if (input[field] !== undefined) input[field] = String(input[field]).trim()
    if (input.itemID !== undefined) input.itemID = input.itemID.toUpperCase()
    if (input.slug !== undefined) input.slug = normalizeSlug(input.slug)
    if (input.availableSizes !== undefined) {
        input.availableSizes = json(input.availableSizes, "availableSizes")
        if (!Array.isArray(input.availableSizes) || input.availableSizes.length === 0 || input.availableSizes.some((size) => !ALL_SIZES.includes(size))) throw invalid("availableSizes contains an unsupported size")
        input.availableSizes = [...new Set(input.availableSizes)]
    }
    if (input.price !== undefined) { input.price = Number(input.price); if (!Number.isFinite(input.price) || input.price < 0) throw invalid("price must be a non-negative number") }
    for (const field of ["isAvailable", "isFeatured"]) if (input[field] !== undefined) { input[field] = parseBoolean(input[field]); if (input[field] === null) throw invalid(`${field} must be true or false`) }
    const category = input.category ?? current.category
    const color = input.color ?? current.color
    if (category && !CATEGORIES.includes(category)) throw invalid("Invalid category")
    if ((input.theme ?? current.theme) && !THEMES.includes(input.theme ?? current.theme)) throw invalid("Invalid theme")
    if (category && color && !validateCategoryColor(category, color)) throw invalid(`${color} is not available for ${category}`)
    return input
}
export function parseImageMetadata(value, count) {
    const metadata = value === undefined ? Array.from({ length : count }, () => ({})) : json(value, "imageMetadata")
    if (!Array.isArray(metadata) || metadata.length !== count) throw invalid("imageMetadata must contain one entry per uploaded image")
    if (metadata.filter((entry) => entry.isPrimary === true).length > 1) throw invalid("Only one image may be primary")
    return metadata.map((entry, index) => ({ alt : String(entry.alt ?? "").trim().slice(0, 200), isPrimary : Boolean(entry.isPrimary), displayOrder : Number.isInteger(Number(entry.displayOrder)) ? Number(entry.displayOrder) : index }))
}
