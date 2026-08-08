import type { CustomizationCategory, CustomizationSide } from "./customization-config";

export interface CustomTextState {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  alignment: "left" | "center" | "right";
  placement: CustomizationSide;
}

export interface CustomizationQuote {
  currency: "LKR";
  basePrice: number;
  printPrice: number;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CustomizerSelection {
  category: CustomizationCategory;
  color: string;
  size: string;
  quantity: number;
  activeSide: CustomizationSide;
  customText: CustomTextState;
}
