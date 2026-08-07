import Link from "next/link";

import { Container } from "@/components/layout/container";

export default function NotFound() {
  return (
    <main>
      <Container className="flex min-h-[60vh] flex-col items-start justify-center py-section-sm">
        <p className="text-caption font-semibold tracking-[0.2em] text-highlight uppercase">
          404 / Not found
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-page-title font-medium text-primary">
          This piece isn’t here.
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-foreground-soft sm:text-base">
          The address may have changed, or this product is not part of the published collection.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex min-h-12 items-center border-b border-primary text-xs font-semibold tracking-[0.15em] uppercase no-underline"
        >
          Return to shop
        </Link>
      </Container>
    </main>
  );
}
