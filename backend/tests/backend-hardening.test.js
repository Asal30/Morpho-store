import assert from "node:assert/strict";
import test from "node:test";
import Item from "../models/itemModel.js";
import Inventory from "../models/inventoryModel.js";
import { sanitizeDatabaseError } from "../config/database.js";
import { validateEnvironment } from "../config/environment.js";
import { parseImageMetadata, parseItemInput } from "../utilities/itemInput.js";

test("environment validation rejects missing and browser Atlas URLs", () => {
    assert.throws(() => validateEnvironment({}), /DATABASE_URL, JWT_KEY/)
    assert.throws(() => validateEnvironment({ DATABASE_URL : "https://cloud.mongodb.com/project", JWT_KEY : "secret" }), /MongoDB driver URI/)
})
test("database errors redact MongoDB credentials", () => {
    const result = sanitizeDatabaseError(new Error("failed mongodb+srv://admin:secret@example.net/morpho"))
    assert.equal(result.includes("secret"), false)
})
test("item input parses multipart values and validates category colors", () => {
    const value = parseItemInput({ itemID : "mor-o-1", slug : " Test Product ", category : "Oversize", theme : "Anime", color : "Black", price : "2500", availableSizes : '["S","M"]', isFeatured : "true" })
    assert.deepEqual(value.availableSizes, ["S", "M"]); assert.equal(value.itemID, "MOR-O-1"); assert.equal(value.slug, "test-product"); assert.equal(value.price, 2500); assert.equal(value.isFeatured, true)
    assert.throws(() => parseItemInput({ category : "Raglan", color : "Yellow" }), /not available/)
})
test("image metadata selects stable defaults and rejects multiple primary images", () => {
    assert.deepEqual(parseImageMetadata(undefined, 2).map((item) => item.displayOrder), [0, 1])
    assert.throws(() => parseImageMetadata('[{"isPrimary":true},{"isPrimary":true}]', 2), /Only one/)
})
test("schemas reject invalid category color and negative available stock", async () => {
    const item = new Item({ itemID : "X", name : "X", slug : "x", category : "Raglan", theme : "Anime", color : "Yellow", price : 2200, availableSizes : ["S"] })
    assert.ok(item.validateSync()?.errors.color)
    const inventory = new Inventory({ item : "507f1f77bcf86cd799439011", size : "S", quantity : 2, sold : 2, reserved : 1 })
    assert.ok(inventory.validateSync()?.errors.quantity)
})
