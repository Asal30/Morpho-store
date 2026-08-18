"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/container";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { AccountIcon, BagIcon, HeartIcon, SearchIcon } from "@/components/shared/storefront-icons";
import { RegionSelector } from "@/features/region/region-selector";
import { cn } from "@/lib/cn";

const actionLinks = [
  { label: "Search", href: "/shop", icon: SearchIcon },
  { label: "Account", href: "/account", icon: AccountIcon },
  { label: "Wishlist", href: "/wishlist", icon: HeartIcon },
  { label: "Cart", href: "/cart", icon: BagIcon },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [statePathname, setStatePathname] = useState(pathname);
  const [isOverHero, setIsOverHero] = useState(isHome);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  if (statePathname !== pathname) {
    setStatePathname(pathname);
    setIsOverHero(isHome);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isHome) return;

    const hero = document.querySelector("[data-home-video-hero]");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsOverHero(entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0.01 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  const overlay = isHome && isOverHero;

  return (
    <header
      data-storefront-chrome
      data-header-state={overlay ? "overlay" : "surface"}
      data-header-visible={isMenuOpen || hasFocus}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
      className={cn(
        "fixed top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-(--motion-ui) ease-(--ease-morpho)",
        overlay
          ? "border-b border-transparent bg-gradient-to-b from-primary/0 to-transparent text-surface"
          : "border-b border-border/50 bg-background/60 text-primary shadow-[0_8px_30px_rgba(17,17,15,0.06)] backdrop-blur-xl",
      )}
    >
      <Container className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-2 lg:min-h-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <Link href="/" aria-label="MORPHO home" className={cn("w-28 lg:w-32", overlay ? "drop-shadow-sm" : "drop-shadow-none")}>
          <Image src={overlay ? "/images/logos/white.png" : "/images/logos/black.png"} alt="MORPHO" width={128} height={32} priority className="h-auto w-full" />
        </Link>
        <DesktopNavigation tone={overlay ? "dark" : "light"} />
        <div className="flex items-center justify-end gap-0.5 lg:gap-1">
          <RegionSelector className="mr-3 hidden w-40 xl:block" tone={overlay ? "dark" : "light"} />
          {actionLinks.map(({ label, href, icon: ActionIcon }) => (
            <Link key={label} href={href} aria-label={label} className={cn("size-11 items-center justify-center transition-colors duration-(--motion-micro) hover:text-accent", label === "Cart" ? "inline-flex" : "hidden lg:inline-flex", overlay ? "text-surface drop-shadow-sm" : "text-primary")}>
              <ActionIcon className="size-5" />
            </Link>
          ))}
          <MobileNavigation tone={overlay ? "dark" : "light"} onOpenChange={setIsMenuOpen} />
        </div>
      </Container>
    </header>
  );
}
