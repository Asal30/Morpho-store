import assert from "node:assert/strict";
import test from "node:test";

import { getDefaultBranding } from "../config/customization.js";
import { calculateCustomizationPrice, getCustomerCustomizedSides } from "../utilities/customizationPricing.js";

const artwork = (placement, id = placement) => ({ id, type : "artwork", placement })
const text = (placement, id = placement) => ({ id, type : "text", placement })

test("customization pricing follows garment and unique customer-side rules", async () => {
    const cases = [
        ["Oversize", [], 250000],
        ["Oversize", [artwork("front")], 280000],
        ["Oversize", [artwork("front"), text("back")], 320000],
        ["Raglan", [], 220000],
        ["Raglan", [text("back")], 250000],
        ["Raglan", [text("front"), artwork("back")], 280000]
    ]
    for (const [category, designObjects, expected] of cases) {
        const color = category === "Oversize" ? "White" : "Blue"
        const quote = await calculateCustomizationPrice({ category, color, size : "M", quantity : 1, designObjects })
        assert.equal(quote.unitPrice, expected)
    }
})

test("side detection ignores system branding and deduplicates customer objects", () => {
    assert.deepEqual(getCustomerCustomizedSides([
        { type : "system-logo", placement : "front" },
        artwork("back", "a"),
        artwork("back", "b"),
        text("back", "c")
    ]), ["back"])
    assert.deepEqual(getCustomerCustomizedSides([text("front")]), ["front"])
})

test("quantity applies to the authoritative unit price", async () => {
    assert.equal((await calculateCustomizationPrice({ category : "Oversize", color : "Black", size : "M", quantity : 2, designObjects : [artwork("front")] })).totalPrice, 560000)
    assert.equal((await calculateCustomizationPrice({ category : "Oversize", color : "Black", size : "M", quantity : 2, designObjects : [artwork("front"), text("back")] })).totalPrice, 640000)
    assert.equal((await calculateCustomizationPrice({ category : "Raglan", color : "Black", size : "M", quantity : 2, designObjects : [artwork("front")] })).totalPrice, 500000)
    assert.equal((await calculateCustomizationPrice({ category : "Raglan", color : "Black", size : "M", quantity : 2, designObjects : [artwork("front"), text("back")] })).totalPrice, 560000)
})

test("default MORPHO branding uses category side and garment-color variant", () => {
    for (const color of ["Black", "Navy Blue", "Mint Green", "Aqua Blue", "Baby Pink", "Yellow"]) {
        assert.equal(getDefaultBranding("Oversize", color).variant, "white")
    }
    for (const color of ["White", "Blue", "Red", "Pink"]) {
        assert.equal(getDefaultBranding(color === "White" ? "Oversize" : "Raglan", color).variant, "black")
    }
    assert.equal(getDefaultBranding("Oversize", "White").side, "front")
    assert.equal(getDefaultBranding("Raglan", "Black").side, "back")
    assert.equal(getDefaultBranding("Oversize", "White", [artwork("front")]).applied, false)
    assert.equal(getDefaultBranding("Oversize", "White", [artwork("back")]).applied, true)
    assert.equal(getDefaultBranding("Raglan", "Black", [text("back")]).applied, false)
})
