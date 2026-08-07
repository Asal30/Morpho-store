import type { CarouselImage } from "@/components/ui/cylinder-carousel";

export interface HomeImage {
  src: string;
  alt: string;
}

export interface HomeCollection {
  name: string;
  eyebrow: string;
  href: string;
  image: HomeImage;
  position?: string;
}

const heroBase = "/images/home/hero";

export const heroImages = [
  { src: `${heroBase}/morpho-03.webp`, alt: "Model wearing a black MORPHO elephant artwork T-shirt" },
  { src: `${heroBase}/morpho-06.webp`, alt: "Model wearing a white MORPHO T-shirt" },
  { src: `${heroBase}/morpho-01.webp`, alt: "MORPHO models in black campaign T-shirts" },
  { src: `${heroBase}/morpho-12.webp`, alt: "Model in a white MORPHO campaign look" },
  { src: `${heroBase}/morpho-07.webp`, alt: "Back artwork on a white MORPHO T-shirt" },
  { src: `${heroBase}/morpho-04.webp`, alt: "Model in a navy MORPHO T-shirt" },
  { src: `${heroBase}/morpho-09.webp`, alt: "Model wearing colorful MORPHO artwork" },
  { src: `${heroBase}/morpho-05.webp`, alt: "Two models in MORPHO campaign pieces" },
  { src: `${heroBase}/morpho-11.webp`, alt: "Close view of MORPHO artwork on white fabric" },
  { src: `${heroBase}/morpho-08.webp`, alt: "Model in a minimal white MORPHO look" },
  { src: `${heroBase}/morpho-02.webp`, alt: "MORPHO elephant artwork on a black T-shirt" },
  { src: `${heroBase}/morpho-10.webp`, alt: "MORPHO models in a studio campaign" },
] as const satisfies readonly CarouselImage[];

export const collections = [
  {
    name: "Oversized",
    eyebrow: "Volume / Ease",
    href: "/shop?category=oversized",
    image: heroImages[0],
    position: "center 42%",
  },
  {
    name: "Raglan",
    eyebrow: "Contrast / Motion",
    href: "/shop?category=raglan",
    image: {
      src: `${heroBase}/morpho-17.webp`,
      alt: "Two MORPHO models photographed together outdoors",
    },
    position: "center 44%",
  },
  {
    name: "Custom",
    eyebrow: "Personal / One of one",
    href: "/customize",
    image: heroImages[4],
    position: "center 45%",
  },
] as const satisfies readonly HomeCollection[];

export const lookbookImages = {
  lead: {
    src: `${heroBase}/morpho-21.webp`,
    alt: "MORPHO campaign portrait in a pink T-shirt",
  },
  detail: {
    src: `${heroBase}/morpho-23.webp`,
    alt: "Back artwork photographed in the MORPHO campaign",
  },
  group: {
    src: `${heroBase}/morpho-15.webp`,
    alt: "Three MORPHO models wearing campaign T-shirts",
  },
} as const satisfies Record<string, HomeImage>;

export const customStoryImage = {
  src: `${heroBase}/morpho-11.webp`,
  alt: "Detailed back artwork on a white MORPHO T-shirt",
} as const satisfies HomeImage;
