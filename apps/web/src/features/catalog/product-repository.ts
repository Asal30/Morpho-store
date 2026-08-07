import { productData } from "@/features/catalog/product-data";
import type { Product } from "@/features/catalog/product.types";

export async function listProducts(): Promise<readonly Product[]> {
  return productData;
}

