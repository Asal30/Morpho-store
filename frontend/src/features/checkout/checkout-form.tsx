"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, getAuthToken } from "@/lib/api-client";

import type { CartRecord } from "@/features/cart/cart.types";

export function CheckoutForm() {
  const [authenticated] = useState(() => Boolean(getAuthToken()));
  const [cart, setCart] = useState<CartRecord | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(authenticated ? "" : "Sign in to continue to checkout.");
  const [orderID, setOrderID] = useState("");

  useEffect(() => {
    if (!authenticated) return;
    apiRequest<CartRecord>("/api/cart").then(setCart).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load cart"));
  }, [authenticated]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart?.items.length) return;
    setPending(true);
    setError("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const order = await apiRequest<{ orderID: string }>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: fields.customerName,
          email: fields.email,
          phone: fields.phone,
          whatsApp: fields.whatsApp,
          paymentMethod: "cash-on-delivery",
          shippingAddress: {
            addressLine1: fields.addressLine1,
            addressLine2: fields.addressLine2,
            city: fields.city,
            district: fields.district,
            postalCode: fields.postalCode,
          },
          items: cart.items.map((entry) => entry.type === "custom"
            ? { customization: entry.customization?._id }
            : { item: entry.item?._id, size: entry.size, quantity: entry.quantity }),
        }),
      });
      await apiRequest("/api/cart", { method: "DELETE" });
      setOrderID(order.orderID);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Order could not be placed");
    } finally {
      setPending(false);
    }
  }

  if (orderID) return <div className="bg-surface p-8"><p className="text-xs font-semibold tracking-[0.16em] text-success uppercase">Order received</p><h2 className="mt-3 font-display text-4xl text-primary">Thank you.</h2><p className="mt-4 text-foreground-soft">Your order reference is <strong>{orderID}</strong>. MORPHO will review custom artwork before production.</p></div>;
  if (error && !cart) return <p role="alert" className="text-destructive">{error} <Link href="/account?redirect=/checkout">Sign in</Link></p>;

  return <form className="grid gap-5" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2"><Input name="customerName" required placeholder="Full name" aria-label="Full name" /><Input name="email" type="email" required placeholder="Email" aria-label="Email" /><Input name="phone" required placeholder="Phone" aria-label="Phone" /><Input name="whatsApp" placeholder="WhatsApp" aria-label="WhatsApp" /></div><Input name="addressLine1" required placeholder="Address line 1" aria-label="Address line 1" /><Input name="addressLine2" placeholder="Address line 2" aria-label="Address line 2" /><div className="grid gap-5 sm:grid-cols-3"><Input name="city" required placeholder="City" aria-label="City" /><Input name="district" required placeholder="District" aria-label="District" /><Input name="postalCode" placeholder="Postal code" aria-label="Postal code" /></div><p className="text-sm text-muted">Payment method: Cash on delivery. Prices and customization snapshots are recalculated and preserved by the server.</p>{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}<Button type="submit" size="lg" disabled={pending || !cart?.items.length}>{pending ? "Placing order…" : "Place order"}</Button></form>;
}
