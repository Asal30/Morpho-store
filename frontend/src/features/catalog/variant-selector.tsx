"use client";

import { useMemo, useState } from "react";

import { ProductPrice } from "@/features/catalog/product-price";
import type { Product, ProductOption } from "@/features/catalog/product.types";
import {
  findVariant,
  getVariantResolution,
  isColorAvailable,
  isSizeAvailable,
  resolveProductPrice,
} from "@/features/catalog/variant-utils";
import { useRegion } from "@/features/region/region-provider";

function initialOption(options: readonly ProductOption[]): string | undefined {
  return options.length === 1 ? options[0].id : undefined;
}

type VariantSelectionProduct = Pick<
  Product,
  "colors" | "sizes" | "variants" | "prices" | "availability"
>;

export function VariantSelector({ product }: Readonly<{ product: VariantSelectionProduct }>) {
  const { currency } = useRegion();
  const [colorId, setColorId] = useState(() => initialOption(product.colors));
  const [sizeId, setSizeId] = useState(() => initialOption(product.sizes));
  const variant = useMemo(
    () => findVariant(product, colorId, sizeId),
    [product, colorId, sizeId],
  );
  const resolution = getVariantResolution(product, colorId, sizeId);
  const price = resolveProductPrice(product, currency, variant);
  const selectedColor = product.colors.find((color) => color.id === colorId);

  return (
    <div>
      <p className="font-display text-2xl font-medium text-primary" aria-live="polite">
        <ProductPrice price={price} />
      </p>

      {product.colors.length ? (
        <fieldset className="mt-9">
          <legend className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
            Color{selectedColor ? ` — ${selectedColor.label}` : ""}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colors.map((color) => {
              const available = isColorAvailable(product, color.id);
              const selected = colorId === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${color.label}${available ? "" : ", unavailable"}`}
                  disabled={!available && !selected}
                  onClick={() => setColorId(color.id)}
                  className="inline-flex min-h-11 items-center gap-2 border border-border-strong px-4 text-sm transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {color.swatch ? (
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full border border-border-strong"
                      style={{ backgroundColor: color.swatch }}
                    />
                  ) : null}
                  {color.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {product.sizes.length ? (
        <fieldset className="mt-8">
          <legend className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
            Size
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.map((size) => {
              const available = isSizeAvailable(product, size.id, colorId);
              const selected = sizeId === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${size.label}${available ? "" : ", unavailable for this color"}`}
                  disabled={!available && !selected}
                  onClick={() => setSizeId(size.id)}
                  className="inline-flex min-h-11 min-w-12 items-center justify-center border border-border-strong px-3 text-sm transition-colors aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-surface disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {size.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <p className="mt-7 border-t border-border pt-5 text-sm text-foreground-soft" aria-live="polite">
        {product.variants.length === 0
          ? "Configuration details are not available."
          : resolution === "available" && variant
          ? `Selected configuration: ${selectedColor?.label}, ${product.sizes.find((size) => size.id === sizeId)?.label}.`
          : resolution === "unavailable"
            ? "This configuration is currently unavailable."
            : resolution === "nonexistent"
              ? "This color and size combination is not offered."
              : "Choose a color and size to identify an exact configuration."}
      </p>
    </div>
  );
}
