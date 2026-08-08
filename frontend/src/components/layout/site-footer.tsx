import Link from "next/link";

import { Container } from "@/components/layout/container";
import { footerNavigation, socialChannels } from "@/config/navigation";

export function SiteFooter() {
  return (
    <footer data-storefront-chrome className="border-t border-primary-light bg-primary text-secondary">
      <Container className="py-section-sm">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1.8fr] lg:gap-20">
          <div className="max-w-sm">
            <Link
              href="/"
              aria-label="MORPHO home"
              className="font-sans text-2xl font-semibold tracking-[0.2em] text-surface"
            >
              MORPHO
            </Link>
            <p className="mt-5 font-display text-2xl italic text-secondary">
              Wear Your Memories.
            </p>
            <p className="mt-5 text-body-sm leading-7 text-secondary/65">
              Memories, reimagined in pieces made to be worn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
            {footerNavigation.map((group) => (
              <nav key={group.label} aria-label={`${group.label} links`}>
                <p className="mb-5 text-[0.625rem] font-semibold tracking-[0.18em] text-accent uppercase">
                  {group.label}
                </p>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-body-sm text-secondary/70 underline decoration-transparent transition-[color,text-decoration-color] duration-(--motion-micro) hover:text-surface hover:decoration-accent"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <nav aria-label="Social links">
              <p className="mb-5 text-[0.625rem] font-semibold tracking-[0.18em] text-accent uppercase">
                Follow
              </p>
              <ul className="space-y-3">
                {socialChannels.map((channel) => (
                  <li key={channel}>
                    <span className="text-body-sm text-secondary/70">{channel}</span>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-surface/15 pt-6 text-[0.625rem] tracking-[0.12em] text-secondary/45 uppercase sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MORPHO</p>
          <p>Designed in Sri Lanka</p>
        </div>
      </Container>
    </footer>
  );
}
