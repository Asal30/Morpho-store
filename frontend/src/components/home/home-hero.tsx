import { Container } from "@/components/layout/container";
import { HomeLink } from "@/components/home/home-link";
import { CylinderCarousel } from "@/components/ui/cylinder-carousel";
import { heroImages } from "@/config/home";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary text-surface">
      <Container className="relative grid min-h-[calc(100svh-6rem)] content-center gap-4 py-10 sm:py-14 lg:min-h-[calc(100svh-7rem)] lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-0 lg:py-8">
        <div className="relative z-10 lg:py-10">
          <p className="mb-5 text-caption font-semibold tracking-[0.28em] text-accent uppercase">
            MORPHO · Sri Lanka
          </p>
          <h1 className="font-display text-[clamp(3.9rem,16vw,7rem)] leading-[0.76] font-medium tracking-[-0.045em] text-surface lg:text-[clamp(6rem,9vw,9.5rem)]">
            <span className="block">Wear</span>
            <span className="block pl-[0.28em] italic text-secondary">Your</span>
            <span className="block">Memories.</span>
          </h1>
          <p className="mt-7 max-w-xs text-body-sm leading-6 text-secondary/65">
            Old memories. New silhouettes.
          </p>
          <div className="mt-7 flex flex-col gap-3 min-[390px]:flex-row">
            <HomeLink href="/shop" tone="light">Shop Collection</HomeLink>
            <HomeLink
              href="/customize"
              className="border-surface/30 bg-transparent text-surface hover:border-accent hover:bg-transparent"
            >
              Create Yours
            </HomeLink>
          </div>
        </div>

        <div className="relative -mx-5 -mt-2 min-h-72 sm:-mx-8 lg:-mx-16 lg:mt-0">
          <p className="sr-only">
            A rotating gallery of MORPHO campaign looks and original T-shirt artwork.
          </p>
          <CylinderCarousel
            images={heroImages}
            animationDuration={54}
            cardWidth={248}
            className="lg:min-h-[36rem]"
            cardClassName="border-surface/20"
          />
          <p className="absolute right-5 bottom-1 text-[0.625rem] font-semibold tracking-[0.18em] text-secondary/40 uppercase sm:right-8 lg:right-16 lg:bottom-8">
            Campaign 01 · In rotation
          </p>
        </div>
      </Container>
    </section>
  );
}
