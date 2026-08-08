"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { adminMutation } from "@/features/admin/admin-client";

export function ArchiveProductButton({
  productId,
}: Readonly<{ productId: string }>) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function archive() {
    if (
      !window.confirm(
        "Archive this product? It will be removed from the public catalog.",
      )
    )
      return;
    setPending(true);
    const response = await adminMutation(`/products/${productId}/archive`, {
      method: "POST",
    });
    setPending(false);
    if (response.ok) router.refresh();
  }
  return (
    <button
      type="button"
      onClick={archive}
      disabled={pending}
      className="min-h-11 text-xs font-semibold tracking-[0.12em] text-destructive uppercase"
    >
      {pending ? "Archiving…" : "Archive"}
    </button>
  );
}
