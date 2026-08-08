export const customizationRules = {
    Oversize : {
        colors : ["Black", "White", "Navy Blue", "Aqua Blue", "Mint Green", "Baby Pink", "Yellow"],
        sizes : ["XS", "S", "M", "L", "XL"],
        basePrice : 250000,
        firstCustomizedSide : 30000,
        secondCustomizedSide : 40000,
        defaultBrandingSide : "front"
    },
    Raglan : {
        colors : ["Black", "Blue", "Red", "Pink"],
        sizes : ["XS", "S", "M", "L", "2XL"],
        basePrice : 220000,
        firstCustomizedSide : 30000,
        secondCustomizedSide : 30000,
        defaultBrandingSide : "back"
    }
}

export const customizationCurrency = "LKR"

const whiteLogoColors = new Set(["Black", "Navy Blue", "Mint Green", "Aqua Blue", "Baby Pink", "Yellow"])

export function getDefaultBranding(category, color, designObjects = []) {
    const side = customizationRules[category]?.defaultBrandingSide
    if (!side) throw new Error("Unsupported customization category")
    return {
        applied : !designObjects.some((object) => ["artwork", "text"].includes(object?.type) && object?.placement === side),
        side,
        variant : whiteLogoColors.has(color) ? "white" : "black"
    }
}
