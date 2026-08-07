import Link from "next/link";

import { Select } from "@/components/ui/select";
import { CatalogFilters } from "@/features/catalog/catalog-filters";
import type {
  CatalogFilterOptions,
  CatalogState,
} from "@/features/catalog/product-utils";

const categories = [
  { value: undefined, label: "All" },
  { value: "oversized", label: "Oversized" },
  { value: "raglan", label: "Raglan" },
] as const;

export function CatalogToolbar({
  state,
  options,
  resultCount,
  canSortByPrice,
}: Readonly<{
  state: CatalogState;
  options: CatalogFilterOptions;
  resultCount: number;
  canSortByPrice: boolean;
}>) {
  return (
    <div className="border-y border-border">
      <div className="flex min-h-16 items-center justify-between gap-4">
        <nav aria-label="Product categories" className="hidden self-stretch md:block">
          <ul className="flex h-full items-center gap-7">
            {categories.map((category) => {
              const active = state.category === category.value;
              const href = category.value ? `/shop?category=${category.value}` : "/shop";

              return (
                <li key={category.label} className="h-full">
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-full items-center border-b-2 text-xs font-semibold tracking-[0.14em] uppercase no-underline transition-colors duration-(--motion-micro) ${
                      active
                        ? "border-highlight text-primary"
                        : "border-transparent text-muted hover:text-primary"
                    }`}
                  >
                    {category.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <CatalogFilters state={state} options={options} />
        <p aria-live="polite" className="ml-auto text-xs tracking-[0.08em] text-muted">
          {resultCount} {resultCount === 1 ? "piece" : "pieces"}
        </p>
        {canSortByPrice ? (
          <form action="/shop" method="get" className="flex items-center gap-2">
            {state.category ? <input type="hidden" name="category" value={state.category} /> : null}
            {state.colors.map((color) => (
              <input key={color} type="hidden" name="color" value={color} />
            ))}
            {state.sizes.map((size) => (
              <input key={size} type="hidden" name="size" value={size} />
            ))}
            <label htmlFor="catalog-sort" className="sr-only">Sort products</label>
            <Select
              id="catalog-sort"
              name="sort"
              defaultValue={state.sort}
              className="min-h-11 w-44 text-xs"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </Select>
            <button
              type="submit"
              className="min-h-11 border-b border-primary text-xs font-semibold uppercase"
            >
              Apply
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
