"use client";

import { formatProductPrice } from "@/features/catalog/price-format";
import type { Product } from "@/features/catalog/product.types";
import { useRegion } from "@/features/region/region-provider";

export function ProductPrice({ prices }: Readonly<Pick<Product, "prices">>) {
  const { currency } = useRegion();
  const price = prices[currency];

  if (!price) {
    return <span className="text-muted">Price unavailable in {currency}</span>;
  }

  return <span>{formatProductPrice(price)}</span>;
}

