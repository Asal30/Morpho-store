export type CustomizationCategory = "Oversize" | "Raglan";
export type CustomizationSide = "front" | "back";

export interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CustomizationColor {
  name: string;
  swatch: string;
  frontMockup: string;
  backMockup: string;
  frontArea: PrintArea;
  backArea: PrintArea;
}

export interface DefaultLogoConfiguration {
  side: CustomizationSide;
  /** Placement normalized inside the configured print area. */
  x: number;
  y: number;
  width: number;
}

interface GarmentConfiguration {
  sizes: readonly string[];
  colors: readonly CustomizationColor[];
  defaultLogo: DefaultLogoConfiguration;
}

const singleShirtFront = { x: 32, y: 30, width: 37, height: 38 };
const singleShirtBack = { x: 30, y: 25, width: 40, height: 48 };

export const customizationConfig: Record<CustomizationCategory, GarmentConfiguration> = {
  Oversize: {
    defaultLogo: { side: "front", x: 0.5, y: 0.15, width: 0.40 },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      ["Black", "#111111", "black"],
      ["White", "#F4F1E8", "white"],
      ["Navy Blue", "#08034e", "navy-blue"],
      ["Aqua Blue", "#6cc0d9", "aqua-blue"],
      ["Mint Green", "#bee9b8", "mint-green"],
      ["Baby Pink", "#fc99e6d6", "baby-pink"],
      ["Yellow", "#f3e241", "yellow"],
    ].map(([name, swatch, file]) => ({
      name,
      swatch,
      frontMockup: `/images/customizer/mockups/oversize/${file}.png`,
      backMockup: `/images/customizer/mockups/oversize/${file}_back.png`,
      frontArea: singleShirtFront,
      backArea: singleShirtBack,
    })),
  },
  Raglan: {
    defaultLogo: { side: "front", x: 0.5, y: 0.18, width: 0.40 },
    sizes: ["S", "M", "L", "2XL"],
    colors: [
      ["Black", "#111111", "black"],
      ["Blue", "#011384", "blue"],
      ["Red", "#FF0000", "red"],
      ["Pink", "#ff53c9", "pink"],
    ].map(([name, swatch, file]) => ({
      name,
      swatch,
      frontMockup: `/images/customizer/mockups/raglan/${file}.png`,
      backMockup: `/images/customizer/mockups/raglan/${file}_back.png`,
      frontArea: singleShirtFront,
      backArea: singleShirtBack,
    })),
  },
};

const oversizedWhiteLogoColors = new Set(["Black", "Navy Blue", "Mint Green", "Aqua Blue", "Baby Pink", "Yellow"]);

export function getDefaultMorphoLogo(category: CustomizationCategory, colorName: string) {
  const variant = category === "Oversize" && oversizedWhiteLogoColors.has(colorName) ? "white" : "black";
  return { variant, src: `/images/customizer/logos/${variant}_logo.png` } as const;
}

export const customizerFonts = ["Manrope", "Cormorant Garamond", "Arial"] as const;
