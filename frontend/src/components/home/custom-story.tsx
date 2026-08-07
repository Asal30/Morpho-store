import Image from "next/image";

import { Container } from "@/components/layout/container";
import { HomeLink } from "@/components/home/home-link";
import { customStoryImage } from "@/config/home";

export function CustomStory() {
  return (
    <section className="bg-highlight text-surface" aria-labelledby="custom-story-title">
      <Container className="grid px-0 sm:px-0 lg:grid-cols-2 lg:px-0 xl:px-0">
        <div className="relative min-h-[28rem] lg:min-h-[44rem]">
          <Image
            src={customStoryImage.src}
            alt={customStoryImage.alt}
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover object-center"
          />
        </div>
        <div className="flex items-center px-5 py-section-sm sm:px-8 lg:px-16 xl:px-20">
          <div className="max-w-xl">
            <p className="text-caption font-semibold tracking-[0.2em] text-accent uppercase">
              Made personal
            </p>
            <h2 id="custom-story-title" className="mt-5 font-display text-page-title font-medium tracking-[-0.035em] text-surface">
              Your memory.<br />Your artwork.<br /><span className="italic text-secondary/80">Your piece.</span>
            </h2>
            <p className="mt-8 max-w-md text-body-sm leading-7 text-secondary/75">
              Bring your own artwork or idea. MORPHO customization will shape it into a T-shirt that belongs only to you.
            </p>
            <HomeLink href="/customize" tone="light" className="mt-9">
              Create Yours
            </HomeLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
