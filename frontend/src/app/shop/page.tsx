import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

import { Container } from "@/components/layout/container";
import { heroImages } from "@/config/home";
import { CatalogToolbar } from "@/features/catalog/catalog-toolbar";
import { ProductGrid } from "@/features/catalog/product-grid";
import { listProducts } from "@/features/catalog/product-repository";
import {
  canSortByPrice,
  filterProducts,
  getFilterOptions,
  parseCatalogState,
  sortProducts,
  type CatalogSearchParams,
} from "@/features/catalog/product-utils";
import {
  DEFAULT_REGION,
  isStoreRegion,
  REGION_COOKIE_NAME,
  regionConfig,
} from "@/features/region/region-config";
import { HomeImageRotator } from "@/components/home/home-image-rotator";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Explore MORPHO Oversized and Raglan T-shirts, or create a custom piece that carries your story.",
};

export default async function ShopPage({
  searchParams,
}: Readonly<{ searchParams: Promise<CatalogSearchParams> }>) {
  const [products, resolvedSearchParams, cookieStore] = await Promise.all([
    listProducts(),
    searchParams,
    cookies(),
  ]);
  const savedRegion = cookieStore.get(REGION_COOKIE_NAME)?.value;
  const region = isStoreRegion(savedRegion) ? savedRegion : DEFAULT_REGION;
  const currency = regionConfig[region].currency;
  const state = parseCatalogState(resolvedSearchParams);
  const filteredProducts = filterProducts(products, state);
  const matchingProducts = sortProducts(filteredProducts, state.sort, currency);
  const filterOptions = getFilterOptions(products);

  return (
    <main>
      <section className="mt-16 lg:mt-20 border-b border-border bg-surface" aria-labelledby="shop-title">
        {/* <Container className="grid min-h-[25rem] items-stretch md:grid-cols-12">
          <div className="flex flex-col justify-center py-16 md:col-span-7 md:py-20 lg:col-span-8">
            <p className="text-caption font-semibold tracking-[0.22em] text-highlight uppercase">
              The collection
            </p>
            <h1 id="shop-title" className="mt-4 font-display text-page-title font-medium text-primary">
              Shop
            </h1>
            <p className="mt-3 font-display text-3xl italic text-foreground-soft sm:text-4xl">
              Wear the story.
            </p>
            <p className="mt-7 text-xs font-semibold tracking-[0.18em] text-muted uppercase">
              Oversized <span aria-hidden="true">·</span> Raglan
            </p>
          </div>
          <div className="relative hidden min-h-[25rem] md:col-span-5 md:block lg:col-span-4">
            <Image
              src={heroImages[0].src}
              alt={heroImages[0].alt}
              fill
              priority
              sizes="(min-width: 1024px) 30vw, 42vw"
              className="object-cover object-center"
            />
          </div>
        </Container> */}
      <HomeImageRotator />
      </section>
      <section className="bg-background" aria-labelledby="catalog-title">
        <Container>
          {/* <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">
                Current forms
              </p>
              <h2 id="catalog-title" className="mt-2 font-display text-section-title font-medium text-primary">
                The pieces
              </h2>
            </div>
          </div> */}

          <CatalogToolbar
            state={state}
            options={filterOptions}
            resultCount={matchingProducts.length}
            canSortByPrice={canSortByPrice(filteredProducts, currency)}
          />

          <div className="pt-10 lg:pt-14">
            {matchingProducts.length ? (
              <ProductGrid products={matchingProducts} />
            ) : (
              <div className="flex min-h-[22rem] flex-col items-start justify-center border-b border-border py-16">
                <p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">
                  Collection update
                </p>
                <h3 className="mt-3 max-w-2xl font-display text-4xl font-medium text-primary sm:text-5xl">
                  {products.length
                    ? "No pieces match these filters."
                    : "The next pieces are taking shape."}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-foreground-soft sm:text-base">
                  {products.length
                    ? "Clear the current selection to return to the full collection."
                    : "Verified product details have not been published yet. Explore the campaign, or begin with a piece made around your own memory."}
                </p>
                {products.length ? (
                  <Link
                    href="/shop"
                    className="mt-7 border-b border-primary pb-1 text-xs font-semibold tracking-[0.15em] uppercase no-underline"
                  >
                    Reset filters
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-surface/15 bg-primary py-section-sm text-surface" aria-labelledby="custom-entry-title">
        <Container className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption font-semibold tracking-[0.2em] text-accent uppercase">
              Your memory, your form
            </p>
            <h2 id="custom-entry-title" className="mt-3 max-w-3xl font-display text-section-title font-medium">
              Can’t find the memory you’re looking for?
            </h2>
          </div>
          <Link
            href="/customize"
            className="inline-flex min-h-12 shrink-0 items-center border-b border-accent text-xs font-semibold tracking-[0.16em] uppercase no-underline transition-colors hover:text-accent"
          >
            Create yours <span aria-hidden="true" className="ml-3">↗</span>
          </Link>
        </Container>
      </section>
    </main>
  );
}
