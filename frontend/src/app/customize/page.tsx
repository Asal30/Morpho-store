import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { Customizer } from "@/features/customizer/customizer";

export const metadata: Metadata = {
  title: "Customize",
  description: "Create a personal MORPHO T-shirt with your artwork and words.",
};

export default function CustomizePage() {
  return (
    <main className="bg-background py-section-sm">
      <Container>
        <header className="mb-10 max-w-3xl sm:mb-14">
          <p className="text-caption font-semibold tracking-[0.2em] text-highlight uppercase">Your memory, your form</p>
          <h1 className="mt-3 font-display text-page-title font-medium text-primary">Create your MORPHO.</h1>
          <p className="mt-5 max-w-2xl text-body-lg text-foreground-soft">Choose the garment, place your artwork, and shape a piece that belongs only to you.</p>
        </header>
        <Customizer />
      </Container>
    </main>
  );
}
