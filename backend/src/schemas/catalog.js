import { z } from "zod";

const image = z.object({
  media_asset_id: z.string().uuid().nullish(), storage_key: z.string().min(1).nullish(), public_url: z.url().nullish(),
  alt_text: z.string().trim().min(1).max(300), width: z.number().int().positive(), height: z.number().int().positive(),
  position: z.number().int().nonnegative(), role: z.enum(["primary", "hover", "gallery"]),
});
export const productInput = z.object({
  name: z.string().trim().min(1).max(200), slug: z.string().max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().nullish(), category: z.enum(["oversized", "raglan", "customized"]),
  garment_slug: z.enum(["oversized", "raglan"]), theme_slug: z.string().nullish(), color_slug: z.string().min(1),
  size_slugs: z.array(z.string()).min(1), images: z.array(image).min(1),
  availability: z.enum(["available", "unavailable"]).default("available"), display_order: z.number().int().nonnegative().default(0),
});
export const productQuery = z.object({
  page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(24),
  garment: z.enum(["oversized", "raglan"]).optional(), theme: z.string().min(1).max(50).optional(),
  color: z.string().min(1).max(50).optional(), size: z.string().min(1).max(20).optional(),
  sort: z.enum(["display", "name-asc", "name-desc"]).default("display"),
});
