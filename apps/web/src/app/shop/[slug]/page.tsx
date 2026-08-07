import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ProductGallery } from "@/features/catalog/product-gallery";
import { ProductGrid } from "@/features/catalog/product-grid";
import {
  getProductBySlug,
  getRelatedProducts,
  listProducts,
} from "@/features/catalog/product-repository";
import { getCategoryLabel } from "@/features/catalog/product-utils";
import { VariantSelector } from "@/features/catalog/variant-selector";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await listProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  const description =
    product.description ?? `View the ${getCategoryLabel(product.category)} piece by MORPHO.`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: [
        {
          url: product.images.primary.src,
          width: product.images.primary.width,
          height: product.images.primary.height,
          alt: product.images.primary.alt,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product);

  return (
    <main>
      <Container className="py-6 sm:py-9 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-[0.625rem] font-semibold tracking-[0.14em] text-muted uppercase">
            <li><Link href="/shop" className="hover:text-primary">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate text-primary">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 md:grid-cols-12 md:items-start lg:gap-16">
          <div className="md:col-span-7">
            <ProductGallery images={product.images} />
          </div>

          <div className="md:col-span-5 md:sticky md:top-32 md:py-4">
            <p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">
              {getCategoryLabel(product.category)}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,5vw,5rem)] leading-[0.96] font-medium text-primary">
              {product.name}
            </h1>

            <div className="mt-7">
              <VariantSelector
                product={{
                  colors: product.colors,
                  sizes: product.sizes,
                  variants: product.variants,
                  prices: product.prices,
                  availability: product.availability,
                }}
              />
            </div>

            {product.description ? (
              <div className="mt-9 border-t border-border pt-7">
                <h2 className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">
                  About this piece
                </h2>
                <p className="mt-3 text-sm leading-7 text-foreground-soft sm:text-base">
                  {product.description}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {relatedProducts.length ? (
        <section className="border-t border-border bg-surface py-section-sm" aria-labelledby="related-products-title">
          <Container>
            <p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">
              More from this form
            </p>
            <h2 id="related-products-title" className="mt-2 mb-10 font-display text-section-title font-medium text-primary">
              You may also like
            </h2>
            <ProductGrid products={relatedProducts} />
          </Container>
        </section>
      ) : null}

      <section className="border-t border-surface/15 bg-primary py-section-sm text-surface" aria-labelledby="pdp-custom-title">
        <Container className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-caption font-semibold tracking-[0.18em] text-accent uppercase">
              Something personal
            </p>
            <h2 id="pdp-custom-title" className="mt-3 font-display text-section-title font-medium">
              Have another memory in mind?
            </h2>
          </div>
          <Link
            href="/customize"
            className="inline-flex min-h-12 shrink-0 items-center border-b border-accent text-xs font-semibold tracking-[0.16em] uppercase no-underline hover:text-accent"
          >
            Create yours <span aria-hidden="true" className="ml-3">↗</span>
          </Link>
        </Container>
      </section>
    </main>
  );
}
