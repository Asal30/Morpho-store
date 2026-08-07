import type { CurrencyCode } from "@/features/region/region-config";

import type {
  Product,
  ProductPrice,
  ProductVariant,
} from "@/features/catalog/product.types";

type VariantProduct = Pick<Product, "variants" | "availability">;
type PricedProduct = Pick<Product, "prices">;

export type VariantResolution = "incomplete" | "nonexistent" | "unavailable" | "available";

export function findVariant(
  product: VariantProduct,
  colorId: string | undefined,
  sizeId: string | undefined,
): ProductVariant | undefined {
  if (!colorId || !sizeId) return undefined;
  return product.variants.find(
    (variant) => variant.colorId === colorId && variant.sizeId === sizeId,
  );
}

export function getVariantResolution(
  product: VariantProduct,
  colorId: string | undefined,
  sizeId: string | undefined,
): VariantResolution {
  if (!colorId || !sizeId) return "incomplete";
  const variant = findVariant(product, colorId, sizeId);
  if (!variant) return "nonexistent";
  if (product.availability === "unavailable") return "unavailable";
  return variant.availability;
}

export function isColorAvailable(product: VariantProduct, colorId: string): boolean {
  if (product.availability === "unavailable") return false;
  return product.variants.some(
    (variant) => variant.colorId === colorId && variant.availability === "available",
  );
}

export function isSizeAvailable(
  product: VariantProduct,
  sizeId: string,
  colorId?: string,
): boolean {
  if (product.availability === "unavailable") return false;
  return product.variants.some(
    (variant) =>
      variant.sizeId === sizeId &&
      (!colorId || variant.colorId === colorId) &&
      variant.availability === "available",
  );
}

export function resolveProductPrice(
  product: PricedProduct,
  currency: CurrencyCode,
  variant?: ProductVariant,
): ProductPrice | undefined {
  return variant?.prices?.[currency] ?? product.prices[currency];
}
