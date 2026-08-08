"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { adminMutation, csrfToken } from "@/features/admin/admin-client";
import type { MediaAsset } from "@/features/admin/admin.types";

export function MediaManager({ initialAssets }: Readonly<{ initialAssets: MediaAsset[] }>) {
  const router = useRouter();
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const queue = Array.from(files);
    const next = (index: number) => {
      if (index >= queue.length) { setProgress(null); router.refresh(); return; }
      const request = new XMLHttpRequest();
      request.open("POST", "/api/admin-proxy/media");
      request.setRequestHeader("x-csrf-token", csrfToken());
      request.upload.onprogress = (event) => event.lengthComputable && setProgress(Math.round((event.loaded / event.total) * 100));
      request.onload = () => request.status < 300 ? next(index + 1) : (setError(JSON.parse(request.responseText || "{}").detail ?? "Upload failed"), setProgress(null));
      request.onerror = () => { setError("Upload failed"); setProgress(null); };
      const data = new FormData(); data.append("file", queue[index]); request.send(data);
    };
    next(0);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this unused media asset?")) return;
    const response = await adminMutation(`/media/${id}`, { method: "DELETE" });
    if (!response.ok) { const body = await response.json(); setError(body.detail ?? "Unable to delete media"); return; }
    router.refresh();
  }

  return (
    <div>
      <label className="inline-flex min-h-12 cursor-pointer items-center bg-primary px-6 text-xs font-semibold tracking-[0.14em] text-surface uppercase">Upload images<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(event) => upload(event.target.files)} /></label>
      {progress !== null ? <p className="mt-3 text-sm" aria-live="polite">Uploading… {progress}%</p> : null}
      {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
      {initialAssets.length ? <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{initialAssets.map((asset) => <article key={asset.id} className="border border-border bg-surface p-3"><div className="relative aspect-square bg-surface-muted"><Image src={asset.publicUrl} alt="" fill unoptimized className="object-contain" /></div><p className="mt-3 truncate text-xs font-semibold">{asset.originalFilename}</p><p className="mt-1 text-[0.625rem] text-muted">{asset.width} × {asset.height} · {(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB</p><button type="button" onClick={() => remove(asset.id)} className="mt-2 min-h-11 text-xs font-semibold text-destructive uppercase">Delete</button></article>)}</div> : <p className="mt-10 border-y border-border py-12 text-sm text-muted">No media has been uploaded yet.</p>}
    </div>
  );
}
