import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export type ContainerProps = ComponentPropsWithoutRef<"div">;

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12 xl:px-16", className)}
      {...props}
    />
  );
}
