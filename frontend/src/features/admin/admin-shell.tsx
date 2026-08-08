"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { adminMutation } from "@/features/admin/admin-client";

const links = [
  ["/admin", "Dashboard"],
  ["/admin/products", "Products"],
  ["/admin/products/new", "Add item"],
  ["/admin/media", "Media"],
] as const;

export function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() { await adminMutation("/auth/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }

  return (
    <div data-admin-root className="min-h-screen bg-background lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-border bg-primary px-5 py-5 text-surface lg:min-h-screen lg:border-r lg:border-b-0 lg:px-7 lg:py-8">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="text-lg font-semibold tracking-[0.2em] no-underline">MORPHO</Link>
          <span className="text-[0.625rem] tracking-[0.18em] text-accent uppercase lg:mt-2 lg:block">Administration</span>
        </div>
        <nav aria-label="Admin navigation" className="mt-6 overflow-x-auto lg:mt-12">
          <ul className="flex gap-2 lg:grid">
            {links.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className="flex min-h-11 items-center whitespace-nowrap border-l-2 border-transparent px-3 text-xs font-semibold tracking-[0.12em] uppercase no-underline aria-[current=page]:border-accent aria-[current=page]:bg-surface/10"
                >{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <button type="button" onClick={logout} className="mt-6 min-h-11 text-xs font-semibold tracking-[0.12em] text-secondary uppercase lg:mt-12">Log out</button>
      </aside>
      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
