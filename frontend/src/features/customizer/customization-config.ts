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

interface GarmentConfiguration {
  sizes: readonly string[];
  colors: readonly CustomizationColor[];
}

const singleShirtFront = { x: 35, y: 29, width: 30, height: 34 };
const singleShirtBack = { x: 35, y: 27, width: 30, height: 36 };

export const customizationConfig: Record<CustomizationCategory, GarmentConfiguration> = {
  Oversize: {
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

export const customizerFonts = ["Manrope", "Cormorant Garamond", "Arial"] as const;
