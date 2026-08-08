"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatProductPrice } from "@/features/catalog/price-format";
import { apiRequest, getAuthToken } from "@/lib/api-client";

import type { CartRecord } from "./cart.types";

export function CartView() {
  const [authenticated] = useState(() => Boolean(getAuthToken()));
  const [cart, setCart] = useState<CartRecord | null>(null);
  const [error, setError] = useState(authenticated ? "" : "Sign in to view your cart.");

  useEffect(() => {
    if (!authenticated) return;
    apiRequest<CartRecord>("/api/cart")
      .then(setCart)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load cart"));
  }, [authenticated]);

  async function removeCustom(id: string) {
    try {
      setCart(await apiRequest<CartRecord>(`/api/cart/customizations/${id}`, { method: "DELETE" }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update cart");
    }
  }

  if (error) return <p role="alert" className="text-sm text-destructive">{error} {error.startsWith("Sign in") ? <Link href="/account?redirect=/cart">Sign in</Link> : null}</p>;
  if (!cart) return <p className="text-sm text-muted">Loading your cart…</p>;
  if (!cart.items.length) return <div className="py-20"><h2 className="font-display text-4xl text-primary">Your cart is waiting.</h2><Link href="/customize" className="mt-5 inline-block">Create a custom piece</Link></div>;

  const total = cart.items.reduce(
    (sum, entry) => sum + (entry.type === "custom" ? entry.customization?.totalPrice ?? 0 : (entry.item?.price ?? 0) * entry.quantity),
    0,
  );

  return (
    <div>
      <ul className="divide-y divide-border border-y border-border">
        {cart.items.map((entry) => entry.type === "custom" && entry.customization ? (
          <li key={entry._id} className="grid gap-5 py-6 sm:grid-cols-[7rem_1fr_auto] sm:items-center">
            {entry.customization.artwork[0] ? (
              <div className="relative aspect-square overflow-hidden bg-surface-muted">
                <Image src={entry.customization.artwork[0].secureUrl} alt={entry.customization.artwork[0].originalFilename} fill sizes="7rem" className="object-contain" />
              </div>
            ) : <div className="grid aspect-square place-items-center bg-surface-muted text-xs text-muted">Text design</div>}
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-highlight uppercase">Customized {entry.customization.category} T-shirt</p>
              <h2 className="mt-1 font-display text-2xl text-primary">{entry.customization.color}</h2>
              <p className="mt-1 text-sm text-muted">Size {entry.customization.size} · Qty {entry.customization.quantity} · {entry.customization.artwork.map((art) => art.placement).join(" + ") || entry.customization.customText?.placement}</p>
              {entry.customization.customText?.text ? <p className="mt-2 text-sm">“{entry.customization.customText.text}”</p> : null}
            </div>
            <div className="sm:text-right">
              <p className="font-semibold">{formatProductPrice({ currency: "LKR", minorAmount: entry.customization.totalPrice })}</p>
              <button type="button" className="mt-3 text-xs text-destructive" onClick={() => removeCustom(entry.customization!._id)}>Remove</button>
            </div>
          </li>
        ) : (
          <li key={entry._id} className="flex justify-between gap-5 py-6">
            <span>{entry.item?.name ?? "MORPHO item"} · {entry.size} · Qty {entry.quantity}</span>
            <span>{formatProductPrice({ currency: "LKR", minorAmount: (entry.item?.price ?? 0) * entry.quantity })}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-col items-end gap-4">
        <p className="font-display text-3xl">Total {formatProductPrice({ currency: "LKR", minorAmount: total })}</p>
        <Link href="/checkout" className="inline-flex min-h-14 items-center bg-primary px-8 text-sm font-semibold tracking-[0.14em] text-surface uppercase no-underline">Continue to checkout</Link>
      </div>
    </div>
  );
}
