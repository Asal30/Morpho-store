import Image from "next/image";
import Link from "next/link";

import { ProductPrice } from "@/features/catalog/product-price";
import type { Product } from "@/features/catalog/product.types";
import { getCategoryLabel } from "@/features/catalog/product-utils";

export function ProductCard({
  product,
  href,
}: Readonly<{ product: Product; href?: string }>) {
  const content = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
        <Image
          src={product.images.primary.src}
          alt={product.images.primary.alt}
          fill
          sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 30vw"
          className="object-cover transition-opacity duration-(--motion-ui) ease-(--ease-morpho)"
        />
        {product.images.hover ? (
          <Image
            src={product.images.hover.src}
            alt=""
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1199px) 33vw, 30vw"
            className="hidden object-cover opacity-0 transition-opacity duration-(--motion-ui) ease-(--ease-morpho) group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:md:block"
          />
        ) : null}
      </div>
      <div className="border-b border-border py-4">
        <p className="text-[0.625rem] font-semibold tracking-[0.16em] text-muted uppercase">
          {getCategoryLabel(product.category)}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h2 className="font-display text-2xl leading-tight font-medium text-primary sm:text-3xl">
            {product.name}
          </h2>
          <p className="pt-1 text-xs font-semibold whitespace-nowrap text-foreground-soft sm:text-sm">
            <ProductPrice prices={product.prices} />
          </p>
        </div>
      </div>
    </>
  );

  if (!href) return <article>{content}</article>;

  return (
    <article>
      <Link href={href} className="group block no-underline">
        {content}
      </Link>
    </article>
  );
}

