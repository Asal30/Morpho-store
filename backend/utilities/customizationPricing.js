import { customizationCurrency, customizationRules } from "../config/customization.js";

export function getCustomerCustomizedSides(designObjects = []) {
    return [...new Set(designObjects
        .filter((object) => ["artwork", "text"].includes(object?.type) && ["front", "back"].includes(object?.placement))
        .map((object) => object.placement))]
}

export async function calculateCustomizationPrice({ category, color, size, quantity, designObjects = [] }) {
    const rule = customizationRules[category]
    if (!rule) throw new Error("Unsupported customization category")
    if (!rule.colors.includes(color)) throw new Error("Unsupported color for this garment")
    if (!rule.sizes.includes(size)) throw new Error("Unsupported size for this garment")

    const normalizedQuantity = Number(quantity)
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
        throw new Error("Quantity must be a positive integer")
    }

    const basePrice = rule.basePrice
    const customizedSides = getCustomerCustomizedSides(designObjects)
    const customizedSideCount = customizedSides.length
    const printPrice = customizedSideCount > 0
        ? rule.firstCustomizedSide + Math.max(0, customizedSideCount - 1) * rule.secondCustomizedSide
        : 0
    const unitPrice = basePrice + printPrice

    return {
        currency : customizationCurrency,
        basePrice,
        printPrice,
        customizedSides,
        customizedSideCount,
        unitPrice,
        quantity : normalizedQuantity,
        totalPrice : unitPrice * normalizedQuantity
    }
}
