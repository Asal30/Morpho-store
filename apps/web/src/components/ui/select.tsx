import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type SelectProps = ComponentPropsWithRef<"select">;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "min-h-12 w-full appearance-none rounded-control border border-border-strong bg-surface py-2 pr-11 pl-4 text-sm text-foreground transition-[border-color,background-color] duration-(--motion-micro) hover:border-muted focus-visible:border-highlight focus-visible:outline-highlight disabled:bg-surface-muted disabled:text-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
      >
        <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
