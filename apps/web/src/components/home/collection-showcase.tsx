import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { TextLink } from "@/components/home/home-link";
import { collections } from "@/config/home";

export function CollectionShowcase() {
  return (
    <section className="border-y border-border bg-surface py-section" aria-labelledby="collections-title">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 text-caption font-semibold tracking-[0.2em] text-highlight uppercase">
              Find your form
            </p>
            <h2 id="collections-title" className="font-display text-section-title font-medium text-primary">
              Three ways to wear the story.
            </h2>
          </div>
          <TextLink href="/shop" className="text-primary">Explore all</TextLink>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-12 md:items-start lg:gap-10">
          {collections.map((collection, index) => (
            <Link
              key={collection.name}
              href={collection.href}
              className={index === 1
                ? "group md:col-span-4 md:mt-20"
                : index === 0
                  ? "group md:col-span-4"
                  : "group md:col-span-4 md:mt-10"}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
                <Image
                  src={collection.image.src}
                  alt={collection.image.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-(--ease-morpho) group-hover:scale-[1.025]"
                  style={{ objectPosition: collection.position }}
                />
                <span className="absolute top-4 left-4 bg-primary px-3 py-1.5 text-[0.625rem] font-semibold tracking-[0.16em] text-surface uppercase">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-5 text-[0.625rem] font-semibold tracking-[0.18em] text-muted uppercase">
                {collection.eyebrow}
              </p>
              <div className="mt-1 flex items-end justify-between gap-4 border-b border-border pb-4 transition-colors duration-(--motion-micro) group-hover:border-primary">
                <h3 className="font-display text-4xl font-medium text-primary lg:text-5xl">
                  {collection.name}
                </h3>
                <span aria-hidden="true" className="pb-2 text-lg">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
