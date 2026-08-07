import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type InputProps = ComponentPropsWithRef<"input">;

export function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-12 w-full rounded-control border border-border-strong bg-surface px-4 text-sm text-foreground transition-[border-color,background-color] duration-(--motion-micro) placeholder:text-muted/75 hover:border-muted focus-visible:border-highlight focus-visible:outline-highlight disabled:bg-surface-muted disabled:text-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        className,
      )}
      {...props}
    />
  );
}
