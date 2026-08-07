import Image from "next/image";

import { Container } from "@/components/layout/container";
import { lookbookImages } from "@/config/home";

export function LookbookSection() {
  return (
    <section className="py-section-lg" aria-labelledby="lookbook-title">
      <Container>
        <div className="grid gap-8 md:grid-cols-12 md:gap-6 lg:gap-10">
          <div className="md:col-span-7">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted md:aspect-[4/5]">
              <Image
                src={lookbookImages.lead.src}
                alt={lookbookImages.lead.alt}
                fill
                sizes="(max-width: 767px) 100vw, 58vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="flex flex-col md:col-span-5 md:pt-24">
            <p className="text-caption font-semibold tracking-[0.2em] text-highlight uppercase">
              Campaign 01
            </p>
            <h2 id="lookbook-title" className="mt-5 font-display text-page-title font-medium tracking-[-0.035em] text-primary">
              Familiar,<br />seen anew.
            </h2>
            <p className="mt-7 max-w-sm text-body-sm leading-7 text-foreground-soft">
              Color, character, and the feeling of something you have known before—reframed through MORPHO.
            </p>
            <div className="relative mt-12 aspect-[5/4] overflow-hidden bg-surface-muted md:mt-auto">
              <Image
                src={lookbookImages.detail.src}
                alt={lookbookImages.detail.alt}
                fill
                sizes="(max-width: 767px) 100vw, 42vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="relative mt-3 aspect-[16/10] overflow-hidden bg-surface-muted md:col-span-8 md:col-start-3 md:mt-20">
            <Image
              src={lookbookImages.group.src}
              alt={lookbookImages.group.alt}
              fill
              sizes="(max-width: 767px) 100vw, 66vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
