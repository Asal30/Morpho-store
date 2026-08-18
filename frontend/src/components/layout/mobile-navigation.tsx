"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CloseIcon, MenuIcon } from "@/components/shared/storefront-icons";
import { primaryNavigation, utilityNavigation } from "@/config/navigation";
import { RegionSelector } from "@/features/region/region-selector";
import { cn } from "@/lib/cn";

export function MobileNavigation({
  tone = "light",
  onOpenChange,
}: Readonly<{ tone?: "light" | "dark"; onOpenChange?: (isOpen: boolean) => void }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => () => {
    document.body.style.removeProperty("overflow");
  }, []);

  function openMenu() {
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    setIsOpen(true);
    onOpenChange?.(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
    document.body.style.removeProperty("overflow");
    setIsOpen(false);
    onOpenChange?.(false);
  }

  useEffect(() => {
    function closeOnDesktop() {
      if (window.innerWidth >= 1024 && dialogRef.current?.open) closeMenu();
    }
    window.addEventListener("resize", closeOnDesktop);
    return () => window.removeEventListener("resize", closeOnDesktop);
  });

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={openMenu}
        className={cn(
          "inline-flex size-11 items-center justify-center transition-colors duration-(--motion-micro) hover:text-accent lg:hidden",
          tone === "dark" ? "text-surface drop-shadow-sm" : "text-primary",
        )}
      >
        <MenuIcon className="size-5" />
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-navigation"
        aria-label="Mobile navigation"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onClose={() => {
          document.body.style.removeProperty("overflow");
          setIsOpen(false);
          onOpenChange?.(false);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-primary p-0 text-secondary backdrop:bg-primary/60 lg:hidden"
      >
        <div className="flex min-h-full flex-col overflow-y-auto px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between border-b border-surface/15 pb-4">
            <Link
              href="/"
              onClick={closeMenu}
              className="font-sans text-xl font-semibold tracking-[0.2em] text-surface"
            >
              MORPHO
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMenu}
              className="inline-flex size-11 items-center justify-center text-secondary transition-colors duration-(--motion-micro) hover:text-accent"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <nav aria-label="Mobile primary navigation" className="py-8">
            <ul>
              {primaryNavigation.map((item, index) => (
                <li key={item.href} className="border-b border-surface/10">
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex min-h-14 items-center justify-between font-display text-[clamp(1.8rem,9vw,2.6rem)] font-medium text-surface transition-colors duration-(--motion-micro) hover:text-accent"
                  >
                    {item.label}
                    <span className="font-sans text-[0.625rem] tracking-[0.12em] text-muted">
                      0{index + 1}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="grid grid-cols-2 gap-x-5 gap-y-1 border-b border-surface/15 pb-7">
            {utilityNavigation.slice(0, 3).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className="flex min-h-11 items-center text-caption font-semibold tracking-[0.12em] text-secondary uppercase transition-colors duration-(--motion-micro) hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-auto pt-7">
            <p className="mb-2 text-[0.625rem] font-semibold tracking-[0.16em] text-muted uppercase">
              Shopping region
            </p>
            <RegionSelector tone="dark" className="max-w-52" />
            <p className="mt-8 font-display text-xl italic text-secondary/75">
              Wear Your Memories.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
