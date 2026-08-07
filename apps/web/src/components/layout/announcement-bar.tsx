import { Container } from "@/components/layout/container";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-secondary">
      <Container className="flex min-h-8 items-center justify-center py-1.5 text-center">
        <p className="text-[0.625rem] font-semibold tracking-[0.18em] uppercase sm:text-caption">
          Islandwide delivery <span aria-hidden="true" className="px-1.5 text-accent">·</span> Worldwide shipping
        </p>
      </Container>
    </div>
  );
}
