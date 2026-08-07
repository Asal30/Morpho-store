import type { CurrencyCode } from "@/features/region/region-config";

import {
  productCategories,
  type Product,
  type ProductCategory,
  type ProductOption,
} from "@/features/catalog/product.types";

export type CatalogSort = "featured" | "price-asc" | "price-desc";

export interface CatalogState {
  category?: ProductCategory;
  colors: readonly string[];
  sizes: readonly string[];
  sort: CatalogSort;
}

export interface CatalogFilterOptions {
  colors: readonly ProductOption[];
  sizes: readonly ProductOption[];
}

type SearchValue = string | readonly string[] | undefined;

export type CatalogSearchParams = Record<string, SearchValue>;

function values(value: SearchValue): readonly string[] {
  if (!value) return [];
  return typeof value === "string" ? [value] : value;
}

export function parseCatalogState(searchParams: CatalogSearchParams): CatalogState {
  const categoryValue = values(searchParams.category)[0];
  const sortValue = values(searchParams.sort)[0];

  return {
    category: productCategories.find((category) => category === categoryValue),
    colors: values(searchParams.color),
    sizes: values(searchParams.size),
    sort:
      sortValue === "price-asc" || sortValue === "price-desc" ? sortValue : "featured",
  };
}

export function getFilterOptions(products: readonly Product[]): CatalogFilterOptions {
  const uniqueOptions = (groups: readonly (readonly ProductOption[])[]) => {
    const options = new Map<string, ProductOption>();
    groups.flat().forEach((option) => options.set(option.id, option));
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label));
  };

  return {
    colors: uniqueOptions(products.map((product) => product.colors)),
    sizes: uniqueOptions(products.map((product) => product.sizes)),
  };
}

export function filterProducts(
  products: readonly Product[],
  state: CatalogState,
): readonly Product[] {
  return products.filter(
    (product) =>
      (!state.category || product.category === state.category) &&
      (state.colors.length === 0 ||
        product.colors.some((color) => state.colors.includes(color.id))) &&
      (state.sizes.length === 0 || product.sizes.some((size) => state.sizes.includes(size.id))),
  );
}

export function canSortByPrice(products: readonly Product[], currency: CurrencyCode): boolean {
  return products.length > 0 && products.every((product) => product.prices[currency]);
}

export function sortProducts(
  products: readonly Product[],
  sort: CatalogSort,
  currency: CurrencyCode,
): readonly Product[] {
  if (sort === "featured" || !canSortByPrice(products, currency)) return products;

  return [...products].sort((a, b) => {
    const difference = a.prices[currency]!.minorAmount - b.prices[currency]!.minorAmount;
    return sort === "price-asc" ? difference : -difference;
  });
}

export function getCategoryLabel(category: ProductCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
