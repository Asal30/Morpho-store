import type { CurrencyCode } from "@/features/region/region-config";

import type { ProductPrice } from "@/features/catalog/product.types";

const formatters: Record<CurrencyCode, Intl.NumberFormat> = {
  LKR: new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    currencyDisplay: "code",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
};

export function formatProductPrice(price: ProductPrice): string {
  return formatters[price.currency].format(price.minorAmount / 100);
}

