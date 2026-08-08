import CategoryItem from "../models/categoryModel.js";
import { customizationCosts, customizationCurrency, customizationRules } from "../config/customization.js";

export async function calculateCustomizationPrice({ category, color, size, quantity, placements }) {
    const rule = customizationRules[category]
    if (!rule) throw new Error("Unsupported customization category")
    if (!rule.colors.includes(color)) throw new Error("Unsupported color for this garment")
    if (!rule.sizes.includes(size)) throw new Error("Unsupported size for this garment")

    const normalizedQuantity = Number(quantity)
    if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
        throw new Error("Quantity must be a positive integer")
    }

    const categoryItem = await CategoryItem.findOne({ name : category })
    const basePrice = categoryItem?.price ?? rule.fallbackBasePrice
    const printedSides = new Set(placements).size
    const printPrice = printedSides > 0
        ? customizationCosts.firstPrint + Math.max(0, printedSides - 1) * customizationCosts.secondPrint
        : 0
    const unitPrice = basePrice + printPrice

    return {
        currency : customizationCurrency,
        basePrice,
        printPrice,
        unitPrice,
        quantity : normalizedQuantity,
        totalPrice : unitPrice * normalizedQuantity
    }
}
