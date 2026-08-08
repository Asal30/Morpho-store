import Link from "next/link";

import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import {
  AccountIcon,
  BagIcon,
  HeartIcon,
  SearchIcon,
} from "@/components/shared/storefront-icons";
import { RegionSelector } from "@/features/region/region-selector";

const actionLinks = [
  { label: "Search", href: "/shop", icon: SearchIcon },
  { label: "Account", href: "/account", icon: AccountIcon },
  { label: "Wishlist", href: "/wishlist", icon: HeartIcon },
  { label: "Cart", href: "/cart", icon: BagIcon },
] as const;

export function SiteHeader() {
  return (
    <header data-storefront-chrome className="sticky top-0 z-40 border-b border-border bg-background">
      <Container className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-2 lg:min-h-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <Link
          href="/"
          aria-label="MORPHO home"
          className="w-fit font-sans text-xl font-semibold tracking-[0.19em] text-primary sm:text-2xl lg:text-[1.35rem]"
        >
          MORPHO
        </Link>

        <DesktopNavigation />

        <div className="flex items-center justify-end gap-0.5 lg:gap-1">
          <RegionSelector className="mr-3 hidden w-40 xl:block" />
          {actionLinks.map(({ label, href, icon: ActionIcon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={label === "Cart"
                ? "inline-flex size-11 items-center justify-center text-primary transition-colors duration-(--motion-micro) hover:text-highlight"
                : "hidden size-11 items-center justify-center text-primary transition-colors duration-(--motion-micro) hover:text-highlight lg:inline-flex"}
            >
              <ActionIcon className="size-5" />
            </Link>
          ))}
          <MobileNavigation />
        </div>
      </Container>
    </header>
  );
}
