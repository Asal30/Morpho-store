import type { Product } from "@/features/catalog/product.types";
import { productPlaceholders } from "@/features/catalog/product-placeholders";

export async function listProducts(): Promise<readonly Product[]> {
  // TODO: Replace this temporary source with the rebuilt catalog API.
  return productPlaceholders;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return productPlaceholders.find((product) => product.slug === slug);
}

export async function getRelatedProducts(
  product: Product,
  limit = 3,
): Promise<readonly Product[]> {
  const products = await listProducts();
  return products
    .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
    .slice(0, limit);
}
