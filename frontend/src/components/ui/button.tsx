import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/cn";

const variants = {
  primary:
    "border-primary bg-primary text-surface hover:border-primary-light hover:bg-primary-light",
  secondary:
    "border-highlight bg-highlight text-surface hover:border-primary-light hover:bg-primary-light",
  outline:
    "border-border-strong bg-transparent text-primary hover:border-primary hover:bg-surface",
  ghost: "border-transparent bg-transparent text-primary hover:bg-surface-muted",
} as const;

const sizes = {
  sm: "min-h-10 px-4 text-xs",
  md: "min-h-12 px-6 text-xs",
  lg: "min-h-14 px-8 text-sm",
} as const;

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-control border font-semibold tracking-[0.14em] uppercase transition-[color,background-color,border-color,transform] duration-(--motion-micro) ease-(--ease-morpho) hover:-translate-y-px active:translate-y-0 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
