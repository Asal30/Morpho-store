"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatProductPrice } from "@/features/catalog/price-format";
import { useRegion } from "@/features/region/region-provider";
import { apiRequest, getAuthToken } from "@/lib/api-client";

import { customizationConfig, customizerFonts, type CustomizationCategory, type CustomizationSide } from "./customization-config";
import type { CustomizationQuote, CustomTextState } from "./customizer.types";
import { TshirtPreview } from "./tshirt-preview";

const initialText: CustomTextState = {
  text: "",
  font: "Manrope",
  fontSize: 32,
  color: "#111111",
  alignment: "center",
  placement: "front",
};

interface SavedDraft {
  category?: CustomizationCategory;
  colorName?: string;
  size?: string;
  quantity?: number;
  customText?: CustomTextState;
  description?: string;
}

function readDraft(): SavedDraft {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem("morpho_customizer_draft") ?? "{}") as SavedDraft;
  } catch {
    return {};
  }
}

function fileError(file: File): string | null {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return "Choose a PNG, JPEG, or WEBP image.";
  if (file.size > 10 * 1024 * 1024) return "Artwork must be 10 MB or smaller.";
  return null;
}

export function Customizer() {
  const { currency } = useRegion();
  const [category, setCategory] = useState<CustomizationCategory>("Oversize");
  const [colorName, setColorName] = useState("Black");
  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [activeSide, setActiveSide] = useState<CustomizationSide>("front");
  const [artwork, setArtwork] = useState<Record<CustomizationSide, File | null>>({ front: null, back: null });
  const [customText, setCustomText] = useState<CustomTextState>(initialText);
  const [description, setDescription] = useState("Customer-created MORPHO T-shirt design");
  const [quote, setQuote] = useState<CustomizationQuote | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const garment = customizationConfig[category];
  const color = garment.colors.find((entry) => entry.name === colorName) ?? garment.colors[0];

  useEffect(() => {
    const draft = readDraft();
    Promise.resolve().then(() => {
      if (draft.category) setCategory(draft.category);
      if (draft.colorName) setColorName(draft.colorName);
      if (draft.size) setSize(draft.size);
      if (draft.quantity) setQuantity(draft.quantity);
      if (draft.customText) setCustomText(draft.customText);
      if (draft.description) setDescription(draft.description);
    });
  }, []);

  const artworkUrls = useMemo(
    () => ({
      front: artwork.front ? URL.createObjectURL(artwork.front) : undefined,
      back: artwork.back ? URL.createObjectURL(artwork.back) : undefined,
    }),
    [artwork],
  );

  useEffect(() => () => {
    if (artworkUrls.front) URL.revokeObjectURL(artworkUrls.front);
    if (artworkUrls.back) URL.revokeObjectURL(artworkUrls.back);
  }, [artworkUrls]);

  useEffect(() => {
    const placements = [
      ...(artwork.front ? ["front"] : []),
      ...(artwork.back ? ["back"] : []),
      ...(customText.text.trim() ? [customText.placement] : []),
    ];
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      apiRequest<CustomizationQuote>("/api/customizations/quote", {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ category, color: color.name, size, quantity, placements }),
      })
        .then((nextQuote) => {
          setQuote(nextQuote);
          setError("");
        })
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
          setQuote(null);
          setError(reason instanceof Error ? reason.message : "Price could not be calculated");
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [artwork.back, artwork.front, category, color.name, customText.placement, customText.text, quantity, size]);

  function changeCategory(nextCategory: CustomizationCategory) {
    const next = customizationConfig[nextCategory];
    setCategory(nextCategory);
    setColorName(next.colors[0].name);
    if (!next.sizes.includes(size)) setSize(next.sizes[0]);
  }

  function chooseArtwork(file: File | undefined) {
    if (!file) return;
    const message = fileError(file);
    if (message) {
      setError(message);
      return;
    }
    setError("");
    setArtwork((current) => ({ ...current, [activeSide]: file }));
  }

  async function submit() {
    setError("");
    setSuccess("");
    if (!artwork.front && !artwork.back && !customText.text.trim()) {
      setError("Add artwork or custom text before saving your design.");
      return;
    }
    if (!getAuthToken()) {
      window.sessionStorage.setItem("morpho_customizer_draft", JSON.stringify({ category, colorName, size, quantity, customText, description }));
      setError("Sign in before adding this design to your cart. Your selections are saved in this browser; reselect artwork after signing in.");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.set("category", category);
      form.set("color", color.name);
      form.set("size", size);
      form.set("quantity", String(quantity));
      form.set("description", description);
      if (customText.text.trim()) form.set("customText", JSON.stringify(customText));
      if (artwork.front) form.set("frontArtwork", artwork.front);
      if (artwork.back) form.set("backArtwork", artwork.back);
      await apiRequest("/api/customizations", { method: "POST", body: form });
      window.sessionStorage.removeItem("morpho_customizer_draft");
      setSuccess("Your custom design was saved and added to your cart.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The customization could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(20rem,0.78fr)_minmax(0,1.22fr)] lg:items-start">
      <div className="space-y-9 lg:order-1">
        <fieldset>
          <legend className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">1. Garment</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["Oversize", "Raglan"] as const).map((value) => (
              <Button key={value} variant={category === value ? "primary" : "outline"} onClick={() => changeCategory(value)} aria-pressed={category === value}>{value}</Button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">2. Color</legend>
          <div className="mt-4 flex flex-wrap gap-3">
            {garment.colors.map((entry) => (
              <button key={entry.name} type="button" onClick={() => setColorName(entry.name)} aria-label={`Select ${entry.name}`} aria-pressed={color.name === entry.name} className="group flex flex-col items-center gap-2 text-[0.625rem] text-muted">
                <span className={`size-9 rounded-full border-2 transition-transform group-hover:scale-105 ${color.name === entry.name ? "border-highlight ring-2 ring-highlight/25" : "border-border-strong"}`} style={{ backgroundColor: entry.swatch }} />
                {entry.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">3. Print side</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["front", "back"] as const).map((side) => (
              <Button key={side} variant={activeSide === side ? "secondary" : "outline"} onClick={() => setActiveSide(side)} aria-pressed={activeSide === side}>{side}</Button>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="artwork" className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">4. {activeSide} artwork</label>
          <Input id="artwork" type="file" accept="image/png,image/jpeg,image/webp" className="mt-3 pt-2.5" onChange={(event) => chooseArtwork(event.target.files?.[0])} />
          {artwork[activeSide] ? <div className="mt-2 flex items-center justify-between gap-4 text-xs text-muted"><span className="truncate">{artwork[activeSide]?.name}</span><button type="button" className="font-semibold text-destructive" onClick={() => setArtwork((current) => ({ ...current, [activeSide]: null }))}>Remove</button></div> : null}
        </div>

        <div className="space-y-3">
          <label htmlFor="custom-text" className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">5. Optional text</label>
          <Input id="custom-text" maxLength={80} value={customText.text} placeholder="Your memory, in words" onChange={(event) => setCustomText((current) => ({ ...current, text: event.target.value, placement: activeSide }))} />
          <div className="grid grid-cols-2 gap-3">
            <Select aria-label="Text font" value={customText.font} onChange={(event) => setCustomText((current) => ({ ...current, font: event.target.value }))}>{customizerFonts.map((font) => <option key={font}>{font}</option>)}</Select>
            <Input aria-label="Text size" type="number" min={8} max={96} value={customText.fontSize} onChange={(event) => setCustomText((current) => ({ ...current, fontSize: Number(event.target.value) }))} />
            <Input aria-label="Text color" type="color" value={customText.color} onChange={(event) => setCustomText((current) => ({ ...current, color: event.target.value }))} />
            <Select aria-label="Text alignment" value={customText.alignment} onChange={(event) => setCustomText((current) => ({ ...current, alignment: event.target.value as CustomTextState["alignment"] }))}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">6. Size<Select className="mt-2 normal-case" value={size} onChange={(event) => setSize(event.target.value)}>{garment.sizes.map((value) => <option key={value}>{value}</option>)}</Select></label>
          <label className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">7. Quantity<Input className="mt-2 normal-case" type="number" min={1} max={20} value={quantity} onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))} /></label>
        </div>

        <label htmlFor="design-notes" className="block text-xs font-semibold tracking-[0.16em] text-primary uppercase">Design notes<Textarea id="design-notes" className="mt-2 normal-case" maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} /></label>

        <div className="border-y border-border py-5">
          <div className="flex items-end justify-between gap-5"><div><p className="text-xs tracking-[0.15em] text-muted uppercase">Estimated total</p><p className="mt-1 font-display text-3xl text-primary">{quote && currency === "LKR" ? formatProductPrice({ currency: "LKR", minorAmount: quote.totalPrice }) : currency === "USD" ? "Available in LKR only" : "Calculating…"}</p></div>{quote ? <p className="text-right text-xs text-muted">{quantity} × {formatProductPrice({ currency: "LKR", minorAmount: quote.unitPrice })}</p> : null}</div>
        </div>

        {error ? <p role="alert" className="text-sm text-destructive">{error} {error.startsWith("Sign in") ? <Link href="/account?redirect=/customize" className="font-semibold">Sign in</Link> : null}</p> : null}
        {success ? <p role="status" className="text-sm text-success">{success} <Link href="/cart" className="font-semibold">View cart</Link></p> : null}
        <Button size="lg" className="w-full" disabled={saving || !quote} onClick={submit}>{saving ? "Uploading & saving…" : "Add custom design to cart"}</Button>
      </div>

      <div className="lg:sticky lg:top-28">
        <TshirtPreview color={color} side={activeSide} artworkUrl={artworkUrls[activeSide]} customText={customText} />
        <p className="mt-3 text-xs leading-5 text-muted">Preview placement is proportional to the replaceable garment mockup. Final print positioning is reviewed by MORPHO production.</p>
      </div>
    </div>
  );
}
