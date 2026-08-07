import { productData } from "@/features/catalog/product-data";
import type { Product } from "@/features/catalog/product.types";

export async function listProducts(): Promise<readonly Product[]> {
  return productData;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await listProducts();
  return products.find((product) => product.slug === slug);
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
