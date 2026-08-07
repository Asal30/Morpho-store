"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import type { ProductImages } from "@/features/catalog/product.types";

export function ProductGallery({ images }: Readonly<{ images: ProductImages }>) {
  const galleryImages = useMemo(() => {
    const unique = new Map<string, ProductImages["primary"]>();
    [images.primary, images.hover, ...images.gallery].forEach((image) => {
      if (image) unique.set(image.src, image);
    });
    return [...unique.values()];
  }, [images]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = galleryImages[selectedIndex] ?? images.primary;

  return (
    <section aria-label="Product images">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
        <Image
          key={selectedImage.src}
          src={selectedImage.src}
          alt={selectedImage.alt}
          fill
          unoptimized={selectedImage.src.startsWith("http")}
          priority
          sizes="(max-width: 767px) 100vw, (max-width: 1199px) 58vw, 55vw"
          className="object-contain"
        />
      </div>

      {galleryImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5" role="group" aria-label="Choose product image">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              aria-label={`View image ${index + 1} of ${galleryImages.length}`}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              className="relative aspect-[4/5] min-h-11 overflow-hidden border border-border bg-surface-muted transition-colors aria-pressed:border-highlight aria-pressed:ring-1 aria-pressed:ring-highlight"
            >
              <Image
                src={image.src}
                alt=""
                fill
                unoptimized={image.src.startsWith("http")}
                sizes="(max-width: 767px) 25vw, 10vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
