import Link from "next/link";

import { primaryNavigation } from "@/config/navigation";

export function DesktopNavigation() {
  return (
    <nav aria-label="Primary navigation" className="hidden lg:block">
      <ul className="flex items-center gap-6 xl:gap-9">
        {primaryNavigation.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group relative block py-3 text-xs font-semibold tracking-[0.11em] text-foreground-soft uppercase transition-colors duration-(--motion-micro) hover:text-primary"
            >
              {item.label}
              <span className="absolute right-0 bottom-2 left-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-(--motion-ui) ease-(--ease-morpho) group-hover:scale-x-100" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
