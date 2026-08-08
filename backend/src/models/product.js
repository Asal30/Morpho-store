import crypto from "node:crypto";
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  { id: { type: String, default: () => crypto.randomUUID() }, mediaAssetId: String, storageKey: String, publicUrl: String, altText: { type: String, required: true }, width: { type: Number, min: 1, required: true }, height: { type: Number, min: 1, required: true }, position: { type: Number, min: 0, required: true }, role: { type: String, enum: ["primary", "hover", "gallery"], required: true } },
  { _id: false },
);
const variantSchema = new mongoose.Schema(
  { id: { type: String, default: () => crypto.randomUUID() }, sizeSlug: { type: String, required: true }, availability: { type: String, enum: ["available", "unavailable"], required: true }, prices: { type: Map, of: Number, default: {} } },
  { _id: false },
);
const productSchema = new mongoose.Schema(
  { productId: { type: String, unique: true, default: () => crypto.randomUUID() }, slug: { type: String, unique: true, required: true }, name: { type: String, required: true }, description: String, category: { type: String, enum: ["oversized", "raglan", "customized"], required: true }, garmentSlug: { type: String, required: true, index: true }, themeSlug: { type: String, index: true }, colorSlug: { type: String, required: true, index: true }, availability: { type: String, enum: ["available", "unavailable"], default: "available" }, displayOrder: { type: Number, min: 0, default: 0 }, archivedAt: { type: Date, default: null, index: true }, images: [imageSchema], variants: [variantSchema] },
  { timestamps: true },
);
productSchema.index({ displayOrder: 1, createdAt: 1 });
export const Product = mongoose.model("Product", productSchema);
