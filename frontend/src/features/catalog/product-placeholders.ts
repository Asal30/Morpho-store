import type {
  Product,
  ProductCategory,
  ProductImage,
  ProductOption,
} from "@/features/catalog/product.types";

const OVERSIZED_PRICE_LKR = 250_000;
const RAGLAN_PRICE_LKR = 220_000;

const oversizedSizes: readonly ProductOption[] = ["xs", "s", "m", "l", "xl"].map((id) => ({
  id,
  label: id.toUpperCase(),
}));

const raglanSizes: readonly ProductOption[] = ["xs", "s", "m", "l", "2xl"].map((id) => ({
  id,
  label: id.toUpperCase(),
}));

const colors = {
  black: { id: "black", label: "Black", swatch: "#111111" },
  white: { id: "white", label: "White", swatch: "#F4F1E8" },
  "navy-blue": { id: "navy-blue", label: "Navy Blue", swatch: "#18243D" },
  "aqua-blue": { id: "aqua-blue", label: "Aqua Blue", swatch: "#70CFE3" },
  "mint-green": { id: "mint-green", label: "Mint Green", swatch: "#A9D8C0" },
  "baby-pink": { id: "baby-pink", label: "Baby Pink", swatch: "#E9B8C4" },
  yellow: { id: "yellow", label: "Yellow", swatch: "#E7C94B" },
  blue: { id: "blue", label: "Blue", swatch: "#315A8C" },
  red: { id: "red", label: "Red", swatch: "#A33B3B" },
  pink: { id: "pink", label: "Pink", swatch: "#D78FA7" },
} satisfies Record<string, ProductOption>;

const images: readonly ProductImage[] = [
  {
    src: "/images/placeholders/products/oversized-black.png",
    alt: "Temporary blank black oversized T-shirt presentation mockup",
    width: 1_122,
    height: 1_402,
  },
  {
    src: "/images/placeholders/products/oversized-white.png",
    alt: "Temporary blank white oversized T-shirt presentation mockup",
    width: 1_122,
    height: 1_402,
  },
  {
    src: "/images/placeholders/products/raglan-navy.png",
    alt: "Temporary blank navy raglan T-shirt presentation mockup",
    width: 1_122,
    height: 1_402,
  },
];

interface PlaceholderDefinition {
  category: Exclude<ProductCategory, "customized">;
  color: ProductOption;
  theme: string;
}

const definitions: readonly PlaceholderDefinition[] = [
  { category: "oversized", color: colors.black, theme: "Toon Art" },
  { category: "oversized", color: colors.white, theme: "Anime" },
  { category: "oversized", color: colors["navy-blue"], theme: "Motor" },
  { category: "oversized", color: colors["aqua-blue"], theme: "Street Art" },
  { category: "oversized", color: colors["mint-green"], theme: "Essentials" },
  { category: "oversized", color: colors["baby-pink"], theme: "Toon Art" },
  { category: "oversized", color: colors.yellow, theme: "Street Art" },
  { category: "raglan", color: colors.black, theme: "Essentials" },
  { category: "raglan", color: colors.blue, theme: "Anime" },
  { category: "raglan", color: colors.red, theme: "Motor" },
  { category: "raglan", color: colors.pink, theme: "Toon Art" },
];

function createPlaceholderProduct(
  definition: PlaceholderDefinition,
  zeroBasedIndex: number,
): Product {
  const productNumber = String(zeroBasedIndex + 1).padStart(2, "0");
  const sizes = definition.category === "oversized" ? oversizedSizes : raglanSizes;
  const price = definition.category === "oversized" ? OVERSIZED_PRICE_LKR : RAGLAN_PRICE_LKR;
  const primaryImageIndex = zeroBasedIndex % images.length;

  return {
    id: `placeholder-product-${productNumber}`,
    slug: `morpho-placeholder-${productNumber}`,
    name: `MORPHO Placeholder ${productNumber}`,
    category: definition.category,
    description: `Temporary presentation record for the ${definition.theme} direction. This is not a released MORPHO design and will be replaced when the catalog API is rebuilt.`,
    images: {
      primary: images[primaryImageIndex],
      hover: images[(primaryImageIndex + 1) % images.length],
      gallery: [images[(primaryImageIndex + 2) % images.length]],
    },
    colors: [definition.color],
    sizes,
    prices: {
      LKR: { minorAmount: price, currency: "LKR" },
    },
    variants: sizes.map((size) => ({
      id: `placeholder-variant-${productNumber}-${definition.color.id}-${size.id}`,
      colorId: definition.color.id,
      sizeId: size.id,
      availability: "available",
    })),
    availability: "available",
  };
}

/**
 * Temporary storefront-only catalog used while the backend is absent.
 * TODO: Reconnect the catalog repository to the API when the new backend is implemented.
 */
export const productPlaceholders: readonly Product[] = definitions.map(createPlaceholderProduct);
