import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  { slug: { type: String, required: true }, name: { type: String, required: true }, swatch: String, displayOrder: Number },
  { _id: false },
);

const garmentSchema = new mongoose.Schema(
  { slug: { type: String, unique: true, required: true }, name: { type: String, required: true }, displayOrder: { type: Number, default: 0 }, colors: [optionSchema], sizes: [optionSchema] },
  { timestamps: true },
);
const themeSchema = new mongoose.Schema({ slug: { type: String, unique: true }, name: String, displayOrder: { type: Number, default: 0 } }, { timestamps: true });
const pricingRuleSchema = new mongoose.Schema(
  { garmentSlug: { type: String, required: true }, productKind: { type: String, enum: ["standard", "customized"], required: true }, currency: { type: String, enum: ["LKR", "USD"], required: true }, amountMinor: { type: Number, min: 0, required: true } },
  { timestamps: true },
);
pricingRuleSchema.index({ garmentSlug: 1, productKind: 1, currency: 1 }, { unique: true });

export const GarmentType = mongoose.model("GarmentType", garmentSchema);
export const Theme = mongoose.model("Theme", themeSchema);
export const PricingRule = mongoose.model("PricingRule", pricingRuleSchema);
