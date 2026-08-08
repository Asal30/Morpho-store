import crypto from "node:crypto";
import { GarmentType, PricingRule, Theme } from "../models/reference.js";
import { MediaAsset } from "../models/media.js";
import { Product } from "../models/product.js";
import { HttpError } from "../middleware/errors.js";
import { env } from "../config/env.js";

const priceResponse = (rules) => Object.fromEntries(rules.map((r) => [r.currency, { minorAmount: r.amountMinor, currency: r.currency }]));
const imageResponse = (image) => ({ src: image.publicUrl || `${env.PUBLIC_API_URL.replace(/\/$/, "")}/media/${image.storageKey}`, alt: image.altText, width: image.width, height: image.height });

export async function serializeProduct(product) {
  const [garment, theme, rules] = await Promise.all([
    GarmentType.findOne({ slug: product.garmentSlug }).lean(),
    product.themeSlug ? Theme.findOne({ slug: product.themeSlug }).lean() : null,
    PricingRule.find({ garmentSlug: product.garmentSlug, productKind: product.category === "customized" ? "customized" : "standard" }).lean(),
  ]);
  const primary = product.images.find((item) => item.role === "primary");
  if (!primary) throw new Error(`Published product ${product.productId} has no primary image`);
  const hover = product.images.find((item) => item.role === "hover");
  const sizes = new Map(garment.sizes.map((item) => [item.slug, item]));
  const variants = [...product.variants].sort((a, b) => sizes.get(a.sizeSlug).displayOrder - sizes.get(b.sizeSlug).displayOrder);
  return {
    id: product.productId, slug: product.slug, name: product.name, category: product.category, garmentType: product.garmentSlug,
    theme: theme ? { id: theme.slug, label: theme.name } : null, description: product.description ?? null,
    images: { primary: imageResponse(primary), hover: hover ? imageResponse(hover) : null, gallery: product.images.filter((item) => item.role === "gallery").sort((a, b) => a.position - b.position).map(imageResponse) },
    colors: garment.colors.filter((item) => item.slug === product.colorSlug).map((item) => ({ id: item.slug, label: item.name, swatch: item.swatch ?? null })),
    sizes: variants.map((variant) => ({ id: variant.sizeSlug, label: sizes.get(variant.sizeSlug).name, swatch: null })),
    prices: priceResponse(rules),
    variants: variants.map((variant) => ({ id: variant.id, colorId: product.colorSlug, sizeId: variant.sizeSlug, availability: variant.availability, prices: variant.prices?.size ? Object.fromEntries([...variant.prices].map(([currency, amount]) => [currency, { minorAmount: amount, currency }])) : null })),
    availability: product.availability, displayOrder: product.displayOrder,
  };
}

export async function catalogOptions() {
  const [themes, garments, rules] = await Promise.all([Theme.find().sort({ displayOrder: 1 }).lean(), GarmentType.find().sort({ displayOrder: 1 }).lean(), PricingRule.find().lean()]);
  return { themes: themes.map((item) => ({ id: item.slug, label: item.name })), garments: garments.map((garment) => ({ id: garment.slug, label: garment.name, colors: garment.colors.map((item) => ({ id: item.slug, label: item.name, swatch: item.swatch ?? null })), sizes: garment.sizes.map((item) => ({ id: item.slug, label: item.name, swatch: null })), standardPrices: priceResponse(rules.filter((r) => r.garmentSlug === garment.slug && r.productKind === "standard")), customizedPrices: priceResponse(rules.filter((r) => r.garmentSlug === garment.slug && r.productKind === "customized")) })) };
}

export async function validateConfiguration(payload, currentId) {
  const [garment, theme, duplicate] = await Promise.all([
    GarmentType.findOne({ slug: payload.garment_slug }).lean(),
    payload.theme_slug ? Theme.findOne({ slug: payload.theme_slug }).lean() : null,
    Product.findOne({ slug: payload.slug, ...(currentId ? { productId: { $ne: currentId } } : {}) }).lean(),
  ]);
  if (!garment) throw new HttpError(422, "Unknown garment type");
  if (payload.category !== "customized" && payload.category !== garment.slug) throw new HttpError(422, "Standard product category must match its garment type");
  if (payload.category === "customized" && payload.theme_slug) throw new HttpError(422, "Customized products cannot use predefined themes");
  if (payload.category !== "customized" && !payload.theme_slug) throw new HttpError(422, "Standard products require a theme");
  if (payload.theme_slug && !theme) throw new HttpError(422, "Unknown theme");
  if (!garment.colors.some((item) => item.slug === payload.color_slug)) throw new HttpError(422, "Color is not available for this garment");
  const requested = [...new Set(payload.size_slugs)];
  if (requested.length !== payload.size_slugs.length || requested.some((slug) => !garment.sizes.some((item) => item.slug === slug))) throw new HttpError(422, "Size is not available for this garment");
  if (duplicate) throw new HttpError(422, "Product slug already exists");
  if (payload.images.filter((item) => item.role === "primary").length !== 1) throw new HttpError(422, "A product requires exactly one primary image");
  if (new Set(payload.images.map((item) => item.position)).size !== payload.images.length) throw new HttpError(422, "Image positions must be unique");
  if (payload.images.some((item) => !item.media_asset_id && !item.storage_key && !item.public_url)) throw new HttpError(422, "Every image requires a storage reference");
  return garment;
}

async function buildImages(images) {
  return Promise.all(images.map(async (image) => {
    const asset = image.media_asset_id ? await MediaAsset.findOne({ assetId: image.media_asset_id }).lean() : null;
    if (image.media_asset_id && !asset) throw new HttpError(422, "Unknown media asset");
    return { id: crypto.randomUUID(), mediaAssetId: asset?.assetId, storageKey: asset?.storageKey ?? image.storage_key, publicUrl: asset?.publicUrl ?? image.public_url, altText: image.alt_text, width: asset?.width ?? image.width, height: asset?.height ?? image.height, position: image.position, role: image.role };
  }));
}

export async function createProduct(payload) {
  const garment = await validateConfiguration(payload);
  const sizeOrder = new Map(garment.sizes.map((item) => [item.slug, item.displayOrder]));
  const product = await Product.create({ slug: payload.slug, name: payload.name, description: payload.description, category: payload.category, garmentSlug: payload.garment_slug, themeSlug: payload.theme_slug, colorSlug: payload.color_slug, availability: payload.availability, displayOrder: payload.display_order, images: await buildImages(payload.images), variants: [...payload.size_slugs].sort((a, b) => sizeOrder.get(a) - sizeOrder.get(b)).map((sizeSlug) => ({ id: crypto.randomUUID(), sizeSlug, availability: payload.availability })) });
  return serializeProduct(product);
}

export async function updateProduct(productId, payload) {
  const product = await Product.findOne({ productId });
  if (!product) throw new HttpError(404, "Product not found");
  const garment = await validateConfiguration(payload, productId);
  const existing = new Map(product.variants.map((item) => [item.sizeSlug, item.id]));
  const sizeOrder = new Map(garment.sizes.map((item) => [item.slug, item.displayOrder]));
  Object.assign(product, { slug: payload.slug, name: payload.name, description: payload.description, category: payload.category, garmentSlug: payload.garment_slug, themeSlug: payload.theme_slug, colorSlug: payload.color_slug, availability: payload.availability, displayOrder: payload.display_order, archivedAt: null, images: await buildImages(payload.images), variants: [...payload.size_slugs].sort((a, b) => sizeOrder.get(a) - sizeOrder.get(b)).map((sizeSlug) => ({ id: existing.get(sizeSlug) ?? crypto.randomUUID(), sizeSlug, availability: payload.availability })) });
  await product.save(); return serializeProduct(product);
}
