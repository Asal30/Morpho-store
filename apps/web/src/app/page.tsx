import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const colors = [
  { name: "Obsidian", value: "#11110F", className: "bg-primary" },
  { name: "Warm Ivory", value: "#F3EFE6", className: "bg-secondary" },
  { name: "Champagne", value: "#C5A46D", className: "bg-accent" },
  { name: "Deep Sage", value: "#425B50", className: "bg-highlight" },
  { name: "Soft Cream", value: "#F6F3EC", className: "bg-background" },
  { name: "Warm White", value: "#FEFCF7", className: "bg-surface" },
] as const;

function PreviewLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="mb-5 text-caption font-semibold tracking-[0.18em] text-muted uppercase">
      {children}
    </p>
  );
}

export default function DesignFoundationPage() {
  return (
    <main>
      <section className="border-b border-border py-section-sm">
        <Container>
          <p className="mb-8 text-caption font-semibold tracking-[0.28em] text-accent uppercase">
            Design Foundation · Phase 02
          </p>
          <h1 className="max-w-full font-sans text-display font-semibold tracking-[0.12em] text-primary sm:tracking-[0.18em]">
            MORPHO
          </h1>
          <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2 sm:items-end">
            <p className="font-display text-3xl font-medium italic text-foreground-soft sm:text-4xl">
              Wear Your Memories.
            </p>
            <p className="max-w-md text-body-sm text-muted sm:justify-self-end sm:text-right">
              An internal visual reference for typography, color, spacing, and interface primitives.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          <SectionHeading
            eyebrow="Typography"
            title="Memory, transformed into form."
            description="Expressive editorial type carries the story. A precise modern sans-serif keeps every functional moment clear."
          />
          <div className="mt-16 grid gap-12 border-t border-border pt-10 lg:grid-cols-2">
            <div>
              <PreviewLabel>Cormorant Garamond · Display</PreviewLabel>
              <p className="font-display text-page-title font-medium tracking-[-0.035em] text-primary">
                Crafted to be remembered.
              </p>
            </div>
            <div>
              <PreviewLabel>Manrope · Functional</PreviewLabel>
              <p className="max-w-xl text-body-lg text-foreground-soft">
                MORPHO turns personal ideas, familiar characters, and meaningful artwork into considered pieces made to live with you.
              </p>
              <p className="mt-8 text-caption font-semibold tracking-[0.2em] text-highlight uppercase">
                Oversized · Raglan · Custom
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-surface py-section-sm">
        <Container>
          <SectionHeading eyebrow="Palette" title="Warmth, restraint, character." />
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {colors.map((color) => (
              <div key={color.name}>
                <div className={`aspect-[4/5] border border-border ${color.className}`} />
                <p className="mt-3 text-body-sm font-semibold text-foreground">{color.name}</p>
                <p className="mt-0.5 text-caption tracking-[0.08em] text-muted uppercase">{color.value}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-section">
        <Container>
          <SectionHeading
            eyebrow="Interface"
            title="Precise, quiet interactions."
            description="Controls rely on proportion, typography, and clear states—not decoration."
          />
          <div className="mt-14 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <PreviewLabel>Button variants</PreviewLabel>
              <div className="flex flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>

            <form className="grid gap-6" aria-label="Form component preview">
              <div>
                <label htmlFor="preview-name" className="mb-2 block text-body-sm font-semibold text-foreground">
                  Name
                </label>
                <Input id="preview-name" name="name" placeholder="Your name" autoComplete="name" />
              </div>
              <div>
                <label htmlFor="preview-fit" className="mb-2 block text-body-sm font-semibold text-foreground">
                  Preferred fit
                </label>
                <Select id="preview-fit" name="fit" defaultValue="">
                  <option value="" disabled>Select a silhouette</option>
                  <option value="oversized">Oversized</option>
                  <option value="raglan">Raglan</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div>
                <label htmlFor="preview-memory" className="mb-2 block text-body-sm font-semibold text-foreground">
                  A memory worth wearing
                </label>
                <Textarea id="preview-memory" name="memory" placeholder="Describe the feeling, artwork, or moment…" />
              </div>
            </form>
          </div>
        </Container>
      </section>

      <section className="bg-primary py-section-sm text-surface">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Editorial surface"
            title="Some stories ask for deeper contrast."
            description="Obsidian sections are intentional moments within the warm storefront—not a separate theme."
            className="[&_h2]:text-surface [&_p:last-child]:text-secondary/75 [&_p:first-child]:text-accent"
          />
          <div className="mx-auto mt-10 h-px w-16 bg-accent" />
        </Container>
      </section>
    </main>
  );
}
