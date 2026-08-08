import { GarmentType, PricingRule, Theme } from "../models/reference.js";
import { garments, prices, themes } from "../seed-data.js";

export async function seedReferenceData() {
  await Promise.all(themes.map(([slug, name], displayOrder) => Theme.updateOne({ slug }, { $set: { name, displayOrder } }, { upsert: true })));
  await Promise.all(Object.entries(garments).map(([slug, value], displayOrder) => GarmentType.updateOne({ slug }, { $set: { name: value.name, displayOrder, colors: value.colors.map(([itemSlug, name]) => ({ slug: itemSlug, name })), sizes: value.sizes.map(([itemSlug, name], displayOrder) => ({ slug: itemSlug, name, displayOrder })) } }, { upsert: true })));
  await Promise.all(prices.map(([garmentSlug, productKind, currency, amountMinor]) => PricingRule.updateOne({ garmentSlug, productKind, currency }, { $set: { amountMinor } }, { upsert: true })));
}
