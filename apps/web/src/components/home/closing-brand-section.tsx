import { Container } from "@/components/layout/container";
import { HomeLink } from "@/components/home/home-link";

export function ClosingBrandSection() {
  return (
    <section className="border-b border-primary-light bg-primary py-section-lg text-surface">
      <Container className="text-center">
        <p className="text-caption font-semibold tracking-[0.3em] text-accent uppercase">
          MORPHO
        </p>
        <h2 className="mx-auto mt-7 max-w-5xl font-display text-[clamp(4rem,12vw,10rem)] leading-[0.82] font-medium tracking-[-0.05em]">
          Wear Your<br /><span className="italic text-secondary/80">Memories.</span>
        </h2>
        <p className="mx-auto mt-9 max-w-sm text-body-sm text-secondary/60">
          Stories you remember, reimagined to wear.
        </p>
        <HomeLink href="/shop" tone="light" className="mt-9">
          Discover MORPHO
        </HomeLink>
      </Container>
    </section>
  );
}
