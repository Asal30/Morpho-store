import type { CurrencyCode } from "@/features/region/region-config";

export const productCategories = ["oversized", "raglan"] as const;

export type ProductCategory = (typeof productCategories)[number];

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductImages {
  primary: ProductImage;
  hover?: ProductImage;
  gallery: readonly ProductImage[];
}

export interface ProductPrice {
  /** Integer minor units: cents for USD and cents for LKR. */
  minorAmount: number;
  currency: CurrencyCode;
}

export interface ProductOption {
  id: string;
  label: string;
}

export type ProductAvailability = "available" | "unavailable";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description?: string;
  images: ProductImages;
  colors: readonly ProductOption[];
  sizes: readonly ProductOption[];
  prices: Partial<Record<CurrencyCode, ProductPrice>>;
  availability?: ProductAvailability;
}

