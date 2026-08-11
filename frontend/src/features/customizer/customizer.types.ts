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

export interface DesignTransform {
  /** Center position and source dimensions normalized to the logical print area. */
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  zIndex: number;
}

export interface ArtworkDesignObject extends DesignTransform {
  id: string;
  type: "artwork";
  placement: CustomizationSide;
  assetKey: "frontArtwork" | "backArtwork";
}

export interface TextDesignObject extends DesignTransform {
  id: string;
  type: "text";
  placement: CustomizationSide;
  text: string;
  fontFamily: string;
  fontSize: number;
  fill: string;
  textAlign: "left" | "center" | "right";
}

export type DesignObject = ArtworkDesignObject | TextDesignObject;

export interface DefaultBrandingPosition {
  normalizedX: number;
  normalizedY: number;
}
