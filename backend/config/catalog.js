export const CATEGORIES = ["Oversize", "Raglan"]
export const THEMES = ["Toon Art", "Anime", "Motor", "Street Art", "Essentials", "Customized"]
export const LEGACY_SIZES = ["2XS", "XS"]
export const SELLABLE_SIZES = ["S", "M", "L", "XL", "2XL"]
export const ALL_SIZES = [...LEGACY_SIZES, ...SELLABLE_SIZES]
export const COLORS_BY_CATEGORY = {
    Oversize : ["Black", "White", "Navy Blue", "Aqua Blue", "Mint Green", "Baby Pink", "Yellow"],
    Raglan : ["Black", "Blue", "Red", "Pink"]
}

export function normalizeSlug(value) {
    return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export function validateCategoryColor(category, color) {
    return Boolean(COLORS_BY_CATEGORY[category]?.includes(color))
}
