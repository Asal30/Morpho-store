"use client";

import { regionOptions, type StoreRegion } from "@/features/region/region-config";
import { useRegion } from "@/features/region/region-provider";
import { cn } from "@/lib/cn";

export function RegionSelector({
  className,
  tone = "light",
}: Readonly<{ className?: string; tone?: "light" | "dark" }>) {
  const { region, setRegion } = useRegion();

  return (
    <label className={cn("group relative block", className)}>
      <span className="sr-only">Store region and currency</span>
      <select
        value={region}
        onChange={(event) => setRegion(event.target.value as StoreRegion)}
        className={cn(
          "min-h-11 w-full appearance-none rounded-none border-0 bg-transparent py-2 pr-7 pl-0 text-caption font-semibold tracking-[0.08em] uppercase transition-colors duration-(--motion-micro) focus-visible:outline-highlight",
          tone === "light"
            ? "text-foreground hover:text-highlight"
            : "text-secondary hover:text-surface",
        )}
      >
        {regionOptions.map((option) => (
          <option key={option.code} value={option.code} className="bg-surface text-foreground">
            {option.label} · {option.currency}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2"
      >
        <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </label>
  );
}
