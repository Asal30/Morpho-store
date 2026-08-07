import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  titleAs?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  titleAs: Title = "h2",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
      {...props}
    >
      {eyebrow ? (
        <p className="mb-4 text-caption font-semibold tracking-[0.2em] text-highlight uppercase">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <Title className="font-display text-section-title font-medium tracking-[-0.025em] text-primary">
          {title}
        </Title>
      ) : null}
      {description ? (
        <p className={cn("mt-5 max-w-2xl text-body-lg text-foreground-soft", align === "center" && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
