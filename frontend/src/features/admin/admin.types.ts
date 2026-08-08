import type { Product } from "@/features/catalog/product.types";

export interface CatalogOption { id: string; label: string; swatch?: string }
export interface CatalogGarment {
  id: "oversized" | "raglan";
  label: string;
  colors: CatalogOption[];
  sizes: CatalogOption[];
  standardPrices: Record<string, { minorAmount: number; currency: string }>;
  customizedPrices: Record<string, { minorAmount: number; currency: string }>;
}
export interface CatalogOptions { themes: CatalogOption[]; garments: CatalogGarment[] }
export interface AdminProduct extends Product {
  garmentType: "oversized" | "raglan";
  theme: CatalogOption | null;
  displayOrder: number;
}
export interface MediaAsset {
  id: string;
  storageKey: string;
  publicUrl: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  createdAt: string;
}
