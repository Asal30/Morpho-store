import { notFound } from "next/navigation";

import type { AdminProduct, CatalogOptions } from "@/features/admin/admin.types";
import { ProductForm } from "@/features/admin/product-form";
import { adminServerFetch, apiUrl } from "@/lib/admin-api";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [productResponse, optionsResponse] = await Promise.all([adminServerFetch(`/products/${id}`), fetch(apiUrl("/api/catalog/options"), { cache: "no-store" })]);
  if (productResponse.status === 404) notFound();
  const product = (await productResponse.json()) as AdminProduct;
  const options = (await optionsResponse.json()) as CatalogOptions;
  return <div><p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">Catalog / Edit item</p><h1 className="mt-2 font-display text-page-title font-medium">Edit product</h1><ProductForm options={options} product={product} /></div>;
}
