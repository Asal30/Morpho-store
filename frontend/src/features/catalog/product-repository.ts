import type { Product } from "@/features/catalog/product.types";

interface ProductListResponse {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

function apiUrl(path: string): string {
  const baseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) throw new Error("Catalog API is not configured");
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

async function fetchProductPage(page: number): Promise<ProductListResponse> {
  const response = await fetch(apiUrl(`/api/products?page=${page}&pageSize=100`), {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Catalog API request failed with status ${response.status}`);
  return (await response.json()) as ProductListResponse;
}

export async function listProducts(): Promise<readonly Product[]> {
  const firstPage = await fetchProductPage(1);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, firstPage.pages - 1) }, (_, index) => fetchProductPage(index + 2)),
  );
  return [firstPage, ...remainingPages].flatMap((page) => page.items);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const response = await fetch(apiUrl(`/api/products/${encodeURIComponent(slug)}`), {
    cache: "no-store",
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Catalog API request failed with status ${response.status}`);
  return (await response.json()) as Product;
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
