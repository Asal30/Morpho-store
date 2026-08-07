import type { Metadata } from "next";

import { BrandStatement } from "@/components/home/brand-statement";
import { ClosingBrandSection } from "@/components/home/closing-brand-section";
import { CollectionShowcase } from "@/components/home/collection-showcase";
import { CustomStory } from "@/components/home/custom-story";
import { HomeHero } from "@/components/home/home-hero";
import { LookbookSection } from "@/components/home/lookbook-section";

export const metadata: Metadata = {
  title: "MORPHO",
  description: "Wear Your Memories. Original and custom T-shirts by MORPHO, Sri Lanka.",
};

export default function HomePage() {
  return (
    <main>
      <HomeHero />
      <BrandStatement />
      <CollectionShowcase />
      <LookbookSection />
      <CustomStory />
      <ClosingBrandSection />
    </main>
  );
}
