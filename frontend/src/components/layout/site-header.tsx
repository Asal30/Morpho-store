"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const lastScrollY = useRef(0);
  const frame = useRef<number | null>(null);
  const [statePathname, setStatePathname] = useState(pathname);
  const [isOverHero, setIsOverHero] = useState(isHome);
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  if (statePathname !== pathname) {
    setStatePathname(pathname);
    setIsOverHero(isHome);
    setIsVisible(true);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    lastScrollY.current = window.scrollY;

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

  useEffect(() => {
    function handleScroll() {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(() => {
        const nextScrollY = Math.max(window.scrollY, 0);
        const delta = nextScrollY - lastScrollY.current;

        if (isMenuOpen || hasFocus || nextScrollY < 24) {
          setIsVisible(true);
        } else if (Math.abs(delta) >= 12) {
          setIsVisible(delta < 0);
          lastScrollY.current = nextScrollY;
        }
        frame.current = null;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [hasFocus, isMenuOpen]);

  const overlay = isHome && isOverHero;

  return (
    <header
      data-storefront-chrome
      data-header-state={overlay ? "overlay" : "surface"}
      data-header-visible={isVisible || isMenuOpen || hasFocus}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
      }}
      className={cn(
        "z-40 w-full absolute transition-[transform,background-color,border-color,box-shadow,top] duration-(--motion-ui) ease-(--ease-morpho)",
        isHome ? "fixed top-8" : "sticky top-0",
        overlay
          ? "border-b border-transparent bg-gradient-to-b from-primary/60 to-transparent text-surface"
          : "top-0 border-b border-border/80 bg-background/95 text-primary shadow-[0_8px_30px_rgba(17,17,15,0.06)] backdrop-blur-xl",
        isVisible || isMenuOpen || hasFocus ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <Container className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-2 lg:min-h-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
        <Link href="/" aria-label="MORPHO home" className={cn("w-28 lg:w-32", overlay ? "drop-shadow-sm" : "drop-shadow-none")}>
          <img src="images/logos/white.png" alt="MORPHO" />
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
