"use client";

import Image from "next/image";
import type { CSSProperties, HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface CarouselImage {
  src: string;
  alt?: string;
}

export interface CylinderCarouselProps extends HTMLAttributes<HTMLDivElement> {
  images: readonly CarouselImage[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number;
  cardWidth?: number;
}

type CarouselStyle = CSSProperties & {
  "--n": number;
  "--w": string;
  "--ba": string;
  "--anim-dur": string;
};

export function CylinderCarousel({
  images,
  className,
  containerClassName,
  cardClassName,
  animationDuration = 48,
  cardWidth = 250,
  style,
  ...props
}: CylinderCarouselProps) {
  if (images.length < 3) {
    return null;
  }

  const customStyle: CarouselStyle = {
    "--n": images.length,
    "--w": `clamp(7.25rem, 17vw, ${cardWidth}px)`,
    "--ba": "calc(1turn / var(--n))",
    "--anim-dur": `${animationDuration}s`,
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid min-h-72 w-full place-items-center overflow-hidden sm:min-h-96 lg:min-h-[32rem]",
        className,
      )}
      style={{
        perspective: "35em",
        maskImage: "linear-gradient(90deg, transparent, #000 12% 88%, transparent)",
        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12% 88%, transparent)",
        ...style,
      }}
      {...props}
    >
      <div
        className={cn(
          "morpho-cylinder-track grid place-items-center [transform-style:preserve-3d]",
          containerClassName,
        )}
        style={customStyle}
      >
        {images.map((image, index) => (
          <div
            key={image.src}
            className={cn(
              "relative [grid-area:1/1] aspect-[7/10] overflow-hidden rounded-surface border border-surface/15 bg-primary-light [backface-visibility:hidden]",
              cardClassName,
            )}
            style={{
              width: "var(--w)",
              transform:
                "rotateY(calc(var(--i) * var(--ba))) translateZ(calc(-1 * (0.5 * var(--w) + 0.5em) / tan(0.5 * var(--ba))))",
              "--i": index,
            } as CSSProperties}
          >
            <Image
              src={image.src}
              alt=""
              fill
              preload={index === 0}
              loading={index > 0 ? "eager" : undefined}
              quality={75}
              sizes="(max-width: 639px) 116px, (max-width: 1023px) 17vw, 250px"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>
      <style>{`
        .morpho-cylinder-track {
          animation: morpho-cylinder-rotate var(--anim-dur) linear infinite;
        }

        @keyframes morpho-cylinder-rotate {
          to { transform: rotateY(1turn); }
        }

        @media (prefers-reduced-motion: reduce) {
          .morpho-cylinder-track {
            animation: none !important;
            transform: rotateY(-8deg);
          }
        }
      `}</style>
    </div>
  );
}
