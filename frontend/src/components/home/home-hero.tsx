import { Container } from "@/components/layout/container";
import { HomeLink } from "@/components/home/home-link";

export function HomeHero() {
  return (
    <section data-home-video-hero className="relative isolate min-h-[calc(100vh-2rem)] min-h-[calc(100svh-2rem)] overflow-hidden bg-primary bg-[url('/images/home/hero/morpho-01.webp')] bg-cover bg-[50%_center] text-surface sm:bg-center">
      <video autoPlay muted loop playsInline preload="metadata" poster="/images/home/hero/morpho-01.webp" aria-hidden="true" tabIndex={-1} className="absolute inset-0 size-full object-cover object-[50%_center] motion-reduce:hidden sm:object-center">
        <source src="/videos/homepage-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/25 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-primary/20" />

      <Container className="relative z-10 flex min-h-[calc(100vh-2rem)] min-h-[calc(100svh-2rem)] items-end pb-12 pt-28 sm:pb-16 lg:pb-20 lg:pt-32">
        <div className="max-w-3xl">
          <p className="mb-4 text-caption font-semibold tracking-[0.28em] text-accent uppercase">MORPHO · Sri Lanka</p>
          <h1 className="font-display text-[clamp(4rem,15vw,8.5rem)] leading-[0.78] font-medium tracking-[-0.045em] text-surface drop-shadow-sm">
            Wear Your <span className="italic text-secondary">Memories.</span>
          </h1>
          <p className="mt-6 max-w-xs text-body-sm leading-6 text-secondary/80">Old memories. New silhouettes.</p>
          <div className="mt-7 flex flex-col gap-3 min-[390px]:flex-row">
            <HomeLink href="/shop" tone="light" className="border-surface/45 hover:border-accent hover:bg-primary/25">Shop Collection</HomeLink>
            <HomeLink href="/customize" className="border-surface/45 bg-primary/15 text-surface backdrop-blur-sm hover:border-accent hover:bg-primary/25">Create Yours</HomeLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
