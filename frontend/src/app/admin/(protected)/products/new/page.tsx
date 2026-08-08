import { ProductForm } from "@/features/admin/product-form";
import type { CatalogOptions } from "@/features/admin/admin.types";
import { apiUrl } from "@/lib/admin-api";

export default async function NewProductPage() {
  const response = await fetch(apiUrl("/api/catalog/options"), { cache: "no-store" });
  const options = (await response.json()) as CatalogOptions;
  return <div><p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">Catalog / Add item</p><h1 className="mt-2 font-display text-page-title font-medium">New product</h1><ProductForm options={options} /></div>;
}
