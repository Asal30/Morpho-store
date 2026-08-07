import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type HomeLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    tone?: "light" | "dark";
  };

export function HomeLink({ className, tone = "dark", children, ...props }: HomeLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-control border px-6 text-xs font-semibold tracking-[0.14em] uppercase transition-[color,background-color,border-color,transform] duration-(--motion-micro) ease-(--ease-morpho) hover:-translate-y-px",
        tone === "dark"
          ? "border-primary bg-primary text-surface hover:border-primary-light hover:bg-primary-light"
          : "border-secondary/65 bg-secondary text-primary hover:border-surface hover:bg-surface",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function TextLink({ className, children, ...props }: Omit<HomeLinkProps, "tone">) {
  return (
    <Link
      className={cn(
        "group inline-flex min-h-11 items-center gap-3 text-xs font-semibold tracking-[0.14em] uppercase",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="h-px w-8 bg-current transition-[width] duration-(--motion-ui) ease-(--ease-morpho) group-hover:w-12"
      />
    </Link>
  );
}
