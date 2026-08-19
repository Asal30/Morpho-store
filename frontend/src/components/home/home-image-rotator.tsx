import { Container } from "@/components/layout/container";
import { CylinderCarousel } from "@/components/ui/cylinder-carousel";
import { heroImages } from "@/config/home";

export function HomeImageRotator() {
  return (
    <section aria-labelledby="campaign-rotator-title" className="bg-primary text-surface">
      {/* <Container>
        <div className="mb-5 flex items-end justify-between gap-6 sm:mb-8">
          <div>
            <p className="text-caption font-semibold tracking-[0.22em] text-accent uppercase">Campaign 01</p>
            <h2 id="campaign-rotator-title" className="mt-2 font-display text-section-title font-medium">In rotation</h2>
          </div>
          <p className="hidden max-w-xs text-right text-body-sm text-secondary/60 sm:block">MORPHO campaign looks and original artwork.</p>
        </div>
      </Container> */}
      <div className="relative">
        <p className="sr-only">A rotating gallery of MORPHO campaign looks and original T-shirt artwork.</p>
        <CylinderCarousel images={heroImages} animationDuration={54} cardWidth={248} className="min-h-80 sm:min-h-[28rem] lg:min-h-[36rem]" cardClassName="border-surface/20" />
      </div>
    </section>
  );
}
