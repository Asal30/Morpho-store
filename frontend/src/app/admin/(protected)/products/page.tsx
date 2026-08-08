import Link from "next/link";

import { ArchiveProductButton } from "@/features/admin/product-actions";
import type { AdminProduct } from "@/features/admin/admin.types";
import { adminServerFetch } from "@/lib/admin-api";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.garment) query.set("garment", params.garment);
  const response = await adminServerFetch(`/products?${query}`);
  const data = (await response.json()) as {
    items: AdminProduct[];
    total: number;
  };
  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">
            Catalog management
          </p>
          <h1 className="mt-2 font-display text-page-title font-medium">
            Products
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-12 items-center bg-primary px-6 text-xs font-semibold tracking-[0.14em] text-surface uppercase no-underline"
        >
          Add item
        </Link>
      </div>
      <form className="mt-8 grid gap-3 border-y border-border py-4 sm:grid-cols-[1fr_12rem_auto]">
        <input
          name="search"
          defaultValue={params.search}
          placeholder="Search name or slug"
          className="min-h-11 border border-border-strong bg-surface px-4 text-sm"
        />
        <select
          name="garment"
          defaultValue={params.garment ?? ""}
          className="min-h-11 border border-border-strong bg-surface px-3 text-sm"
        >
          <option value="">All garments</option>
          <option value="oversized">Oversized</option>
          <option value="raglan">Raglan</option>
        </select>
        <button className="min-h-11 bg-primary px-5 text-xs font-semibold text-surface uppercase">
          Filter
        </button>
      </form>
      <p className="mt-5 text-xs text-muted">{data.total} products</p>
      {data.items.length ? (
        <div className="mt-4 w-full max-w-full overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-[0.625rem] tracking-[0.14em] text-muted uppercase">
                <th className="py-3">Product</th>
                <th>Garment</th>
                <th>Theme</th>
                <th>Status</th>
              <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((product) => (
                <tr key={product.id} className="border-b border-border">
                  <td className="py-4">
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted">/{product.slug}</p>
                  </td>
                  <td className="text-sm capitalize">{product.garmentType}</td>
                  <td className="text-sm">{product.theme?.label ?? "—"}</td>
                  <td className="text-sm capitalize">{product.availability}</td>
                  <td>
                    <div className="flex justify-end gap-4">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex min-h-11 items-center text-xs font-semibold uppercase"
                      >
                        Edit
                      </Link>
                      <ArchiveProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-12 border-y border-border py-16">
          <h2 className="font-display text-4xl">No products found.</h2>
          <p className="mt-3 text-sm text-muted">
            Add the first verified MORPHO design when its information and
            imagery are ready.
          </p>
        </div>
      )}
    </div>
  );
}
