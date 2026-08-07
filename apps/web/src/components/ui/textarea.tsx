import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

export type TextareaProps = ComponentPropsWithRef<"textarea">;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full resize-y rounded-control border border-border-strong bg-surface px-4 py-3 text-sm text-foreground transition-[border-color,background-color] duration-(--motion-micro) placeholder:text-muted/75 hover:border-muted focus-visible:border-highlight focus-visible:outline-highlight disabled:bg-surface-muted disabled:text-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive",
        className,
      )}
      {...props}
    />
  );
}
