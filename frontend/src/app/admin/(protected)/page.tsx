import Link from "next/link";

import type { AdminProduct } from "@/features/admin/admin.types";
import { adminServerFetch } from "@/lib/admin-api";

interface Dashboard {
  totalProducts: number; availableProducts: number; unavailableProducts: number;
  archivedProducts: number; oversizedProducts: number; raglanProducts: number;
  customizedProducts: number; recentProducts: AdminProduct[];
}

export default async function AdminDashboardPage() {
  const response = await adminServerFetch("/dashboard");
  const data = (await response.json()) as Dashboard;
  const metrics = [
    ["Products", data.totalProducts], ["Available", data.availableProducts],
    ["Unavailable", data.unavailableProducts], ["Archived", data.archivedProducts],
    ["Oversized", data.oversizedProducts], ["Raglan", data.raglanProducts],
  ];
  return (
    <div>
      <p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">Catalog overview</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-5">
        <h1 className="font-display text-page-title font-medium text-primary">Dashboard</h1>
        <Link href="/admin/products/new" className="inline-flex min-h-12 items-center bg-primary px-6 text-xs font-semibold tracking-[0.14em] text-surface uppercase no-underline">Add item</Link>
      </div>
      <dl className="mt-10 grid grid-cols-2 border-t border-l border-border md:grid-cols-3 xl:grid-cols-6">
        {metrics.map(([label, value]) => <div key={label} className="border-r border-b border-border bg-surface p-5"><dt className="text-[0.625rem] tracking-[0.14em] text-muted uppercase">{label}</dt><dd className="mt-3 font-display text-4xl text-primary">{value}</dd></div>)}
      </dl>
      <section className="mt-12" aria-labelledby="recent-title">
        <h2 id="recent-title" className="font-display text-3xl font-medium">Recent products</h2>
        {/* {data.recentProducts.length ? <ul className="mt-5 divide-y divide-border border-y border-border">{data.recentProducts.map((product) => <li key={product.id}><Link href={`/admin/products/${product.id}/edit`} className="flex min-h-16 items-center justify-between gap-4 no-underline"><span>{product.name}</span><span className="text-xs text-muted">{product.garmentType}</span></Link></li>)}</ul> : <p className="mt-5 text-sm text-muted">No products have been created yet.</p>} */}
      </section>
    </div>
  );
}
