"use client";

import { formatProductPrice } from "@/features/catalog/price-format";
import type { ProductPrice as Price, ProductPricing } from "@/features/catalog/product.types";
import { useRegion } from "@/features/region/region-provider";

export function ProductPrice({
  prices,
  price,
}: Readonly<{ prices?: ProductPricing; price?: Price }>) {
  const { currency } = useRegion();
  const resolvedPrice = price ?? prices?.[currency];

  if (!resolvedPrice) {
    return <span className="text-muted">Price unavailable in {currency}</span>;
  }

  return <span>{formatProductPrice(resolvedPrice)}</span>;
}
