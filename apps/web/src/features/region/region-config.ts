export type StoreRegion = "LK" | "INTL";
export type CurrencyCode = "LKR" | "USD";

export interface RegionOption {
  code: StoreRegion;
  label: string;
  currency: CurrencyCode;
}

export const REGION_COOKIE_NAME = "morpho_region";
export const DEFAULT_REGION: StoreRegion = "LK";

export const regionOptions = [
  { code: "LK", label: "Sri Lanka", currency: "LKR" },
  { code: "INTL", label: "International", currency: "USD" },
] as const satisfies readonly RegionOption[];

export const regionConfig: Record<StoreRegion, RegionOption> = Object.fromEntries(
  regionOptions.map((region) => [region.code, region]),
) as Record<StoreRegion, RegionOption>;

export function isStoreRegion(value: string | undefined): value is StoreRegion {
  return value === "LK" || value === "INTL";
}
