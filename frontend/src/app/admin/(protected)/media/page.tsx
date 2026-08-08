import type { MediaAsset } from "@/features/admin/admin.types";
import { MediaManager } from "@/features/admin/media-manager";
import { adminServerFetch } from "@/lib/admin-api";

export default async function AdminMediaPage() {
  const response = await adminServerFetch("/media?pageSize=100");
  const data = (await response.json()) as { items: MediaAsset[]; total: number };
  return <div><p className="text-caption font-semibold tracking-[0.18em] text-highlight uppercase">Asset library</p><h1 className="mt-2 font-display text-page-title font-medium">Media</h1><p className="mt-3 mb-8 max-w-2xl text-sm text-muted">Upload verified product imagery progressively. Files are stored outside the database; only references and dimensions are retained.</p><MediaManager initialAssets={data.items} /></div>;
}
