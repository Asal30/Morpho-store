export const customizationRules = {
    Oversize : {
        colors : ["Black", "White", "Navy Blue", "Aqua Blue", "Mint Green", "Baby Pink", "Yellow"],
        sizes : ["XS", "S", "M", "L", "XL"],
        basePrice : 250000,
        firstCustomizedSide : 30000,
        secondCustomizedSide : 40000,
        defaultBrandingSide : "front",
        defaultBrandingPosition : { normalizedX : 0.5, normalizedY : 0.15 }
    },
    Raglan : {
        colors : ["Black", "Blue", "Red", "Pink"],
        sizes : ["XS", "S", "M", "L", "2XL"],
        basePrice : 220000,
        firstCustomizedSide : 30000,
        secondCustomizedSide : 30000,
        defaultBrandingSide : "back",
        defaultBrandingPosition : { normalizedX : 0.5, normalizedY : 0.18 }
    }
}

export const customizationCurrency = "LKR"

const oversizedWhiteLogoColors = new Set(["Black", "Navy Blue", "Mint Green", "Aqua Blue", "Baby Pink", "Yellow"])

export function getDefaultBranding(category, color, designObjects = [], position = {}) {
    const rule = customizationRules[category]
    if (!rule) throw new Error("Unsupported customization category")
    const side = rule.defaultBrandingSide
    return {
        applied : !designObjects.some((object) => ["artwork", "text"].includes(object?.type) && object?.placement === side),
        side,
        variant : category === "Oversize" && oversizedWhiteLogoColors.has(color) ? "white" : "black",
        normalizedX : position.normalizedX ?? rule.defaultBrandingPosition.normalizedX,
        normalizedY : position.normalizedY ?? rule.defaultBrandingPosition.normalizedY
    }
}
