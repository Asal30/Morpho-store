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
  mockup: string;
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

const singleShirtFront = { x: 35, y: 29, width: 30, height: 34 };
const singleShirtBack = { x: 35, y: 27, width: 30, height: 36 };

export const customizationConfig: Record<CustomizationCategory, GarmentConfiguration> = {
  Oversize: {
    defaultLogo: { side: "front", x: 0.5, y: 0.2, width: 0.34 },
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      ["Black", "#111111", "black"],
      ["White", "#F4F1E8", "white"],
      ["Navy Blue", "#18243D", "navy-blue"],
      ["Aqua Blue", "#70CFE3", "aqua-blue"],
      ["Mint Green", "#A9D8C0", "mint-green"],
      ["Baby Pink", "#E9B8C4", "baby-pink"],
      ["Yellow", "#E7C94B", "yellow"],
    ].map(([name, swatch, file]) => ({
      name,
      swatch,
      mockup: `/images/customizer/mockups/oversize/${file}.png`,
      frontArea: singleShirtFront,
      backArea: singleShirtBack,
    })),
  },
  Raglan: {
    defaultLogo: { side: "back", x: 0.5, y: 0.18, width: 0.34 },
    sizes: ["XS", "S", "M", "L", "2XL"],
    colors: [
      ["Black", "#111111", "black"],
      ["Blue", "#315A8C", "blue"],
      ["Red", "#A33B3B", "red"],
      ["Pink", "#D78FA7", "pink"],
    ].map(([name, swatch, file]) => ({
      name,
      swatch,
      mockup: `/images/customizer/mockups/raglan/${file}.png`,
      frontArea: singleShirtFront,
      backArea: singleShirtBack,
    })),
  },
};

const whiteLogoColors = new Set(["Black", "Navy Blue", "Mint Green", "Aqua Blue", "Baby Pink", "Yellow"]);

export function getDefaultMorphoLogo(colorName: string) {
  const variant = whiteLogoColors.has(colorName) ? "white" : "black";
  return { variant, src: `/images/customizer/logos/${variant}_logo.png` } as const;
}

export const customizerFonts = ["Manrope", "Cormorant Garamond", "Arial"] as const;
