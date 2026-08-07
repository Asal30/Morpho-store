import { Container } from "@/components/layout/container";

export function BrandStatement() {
  return (
    <section className="py-section-lg">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-16">
          <p className="pt-2 text-caption font-semibold tracking-[0.2em] text-highlight uppercase">
            The idea
          </p>
          <div>
            <h2 className="max-w-5xl font-display text-[clamp(3rem,7vw,7rem)] leading-[0.92] font-medium tracking-[-0.04em] text-primary">
              Not just what you wore.
              <span className="block italic text-foreground-soft">What you remember.</span>
            </h2>
            <p className="mt-10 max-w-xl text-body-lg text-foreground-soft lg:ml-auto">
              MORPHO turns remembered characters, personal artwork, and lived moments into pieces shaped for now.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
