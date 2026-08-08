"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { adminMutation, csrfToken } from "@/features/admin/admin-client";
import type {
  AdminProduct,
  CatalogOptions,
  MediaAsset,
} from "@/features/admin/admin.types";

interface FormImage {
  key: string;
  mediaAssetId?: string;
  src: string;
  storageKey?: string;
  width: number;
  height: number;
  alt: string;
}

function uploadFile(
  file: File,
  onProgress: (progress: number) => void,
): Promise<MediaAsset> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin-proxy/media");
    request.setRequestHeader("x-csrf-token", csrfToken());
    request.upload.onprogress = (event) =>
      event.lengthComputable &&
      onProgress(Math.round((event.loaded / event.total) * 100));
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve(JSON.parse(request.responseText))
        : reject(
            new Error(
              JSON.parse(request.responseText || "{}").detail ??
                "Upload failed",
            ),
          );
    request.onerror = () => reject(new Error("Upload failed"));
    const data = new FormData();
    data.append("file", file);
    request.send(data);
  });
}

export function ProductForm({
  options,
  product,
}: Readonly<{ options: CatalogOptions; product?: AdminProduct }>) {
  const router = useRouter();
  const [garmentId, setGarmentId] = useState<"oversized" | "raglan">(
    product?.garmentType ?? "oversized",
  );
  const [kind, setKind] = useState<"standard" | "customized">(
    product?.category === "customized" ? "customized" : "standard",
  );
  const [images, setImages] = useState<FormImage[]>(() => {
    if (!product) return [];
    return [
      product.images.primary,
      product.images.hover,
      ...product.images.gallery,
    ]
      .filter(Boolean)
      .map((image, index) => ({
        key: `${image!.src}-${index}`,
        src: image!.src,
        width: image!.width,
        height: image!.height,
        alt: image!.alt,
      }));
  });
  const [primaryKey, setPrimaryKey] = useState(images[0]?.key ?? "");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const garment = options.garments.find((item) => item.id === garmentId)!;
  const price = useMemo(
    () =>
      kind === "customized"
        ? garment.customizedPrices.LKR
        : garment.standardPrices.LKR,
    [garment, kind],
  );

  async function addImages(files: FileList | null) {
    if (!files) return;
    setError("");
    try {
      for (const file of Array.from(files)) {
        const asset = await uploadFile(file, setUploadProgress);
        const item: FormImage = {
          key: asset.id,
          mediaAssetId: asset.id,
          src: asset.publicUrl,
          storageKey: asset.storageKey,
          width: asset.width,
          height: asset.height,
          alt: "",
        };
        setImages((current) => [...current, item]);
        setPrimaryKey((current) => current || item.key);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed");
    } finally {
      setUploadProgress(null);
    }
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!images.length || !primaryKey) {
      setError("Upload at least one image and choose a primary image.");
      return;
    }
    if (images.some((image) => !image.alt.trim())) {
      setError("Add useful alt text for every image.");
      return;
    }
    const data = new FormData(event.currentTarget);
    const ordered = [
      images.find((image) => image.key === primaryKey)!,
      ...images.filter((image) => image.key !== primaryKey),
    ];
    const payload = {
      name: data.get("name"),
      slug: data.get("slug"),
      description: data.get("description") || null,
      category: kind === "customized" ? "customized" : garmentId,
      garment_slug: garmentId,
      theme_slug: kind === "standard" ? data.get("theme_slug") : null,
      color_slug: data.get("color_slug"),
      size_slugs: data.getAll("size_slugs"),
      availability: data.get("availability"),
      display_order: Number(data.get("display_order")),
      images: ordered.map((image, index) => ({
        media_asset_id: image.mediaAssetId,
        storage_key: image.storageKey,
        public_url: image.mediaAssetId ? undefined : image.src,
        alt_text: image.alt,
        width: image.width,
        height: image.height,
        position: index,
        role: index === 0 ? "primary" : index === 1 ? "hover" : "gallery",
      })),
    };
    setPending(true);
    const response = await adminMutation(
      product ? `/products/${product.id}` : "/products",
      {
        method: product ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    setPending(false);
    if (!response.ok) {
      const body = await response
        .json()
        .catch(() => ({ detail: "Unable to save product" }));
      setError(
        typeof body.detail === "string"
          ? body.detail
          : "Please review the form.",
      );
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <div className="grid gap-7">
        <section className="grid gap-5 border border-border bg-surface p-5 sm:grid-cols-2 sm:p-7">
          <h2 className="font-display text-3xl sm:col-span-2">
            Product identity
          </h2>
          <label className="grid gap-2 text-xs font-semibold uppercase">
            Product name
            <input
              name="name"
              required
              defaultValue={product?.name}
              className="min-h-12 border border-border-strong px-4 text-sm font-normal normal-case"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase">
            Slug
            <input
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={product?.slug}
              className="min-h-12 border border-border-strong px-4 text-sm font-normal normal-case"
            />
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase">
            Garment
            <select
              value={garmentId}
              onChange={(event) =>
                setGarmentId(event.target.value as typeof garmentId)
              }
              className="min-h-12 border border-border-strong px-3 text-sm font-normal normal-case"
            >
              {options.garments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-xs font-semibold uppercase">
            Type
            <select
              value={kind}
              onChange={(event) => setKind(event.target.value as typeof kind)}
              className="min-h-12 border border-border-strong px-3 text-sm font-normal normal-case"
            >
              <option value="standard">Standard design</option>
              <option value="customized">Customized</option>
            </select>
          </label>
          {kind === "standard" ? (
            <label className="grid gap-2 text-xs font-semibold uppercase">
              Theme
              <select
                name="theme_slug"
                required
                defaultValue={product?.theme?.id}
                className="min-h-12 border border-border-strong px-3 text-sm font-normal normal-case"
              >
                <option value="">Select theme</option>
                {options.themes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="grid gap-2 text-xs font-semibold uppercase">
            Color
            <select
              name="color_slug"
              required
              defaultValue={product?.colors[0]?.id}
              className="min-h-12 border border-border-strong px-3 text-sm font-normal normal-case"
            >
              {garment.colors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="sm:col-span-2">
            <legend className="text-xs font-semibold uppercase">
              Available sizes
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {garment.sizes.map((size) => (
                <label
                  key={size.id}
                  className="inline-flex min-h-11 items-center gap-2 border border-border-strong px-4 text-sm"
                >
                  <input
                    type="checkbox"
                    name="size_slugs"
                    value={size.id}
                    defaultChecked={product?.sizes.some(
                      (item) => item.id === size.id,
                    )}
                  />
                  {size.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-2 text-xs font-semibold uppercase sm:col-span-2">
            Description
            <textarea
              name="description"
              defaultValue={product?.description}
              rows={5}
              className="border border-border-strong p-4 text-sm font-normal normal-case"
            />
          </label>
        </section>

        <section className="border border-border bg-surface p-5 sm:p-7">
          <h2 className="font-display text-3xl">Product images</h2>
          <p className="mt-2 text-sm text-muted">
            JPEG, PNG or WebP. Maximum 10 MB each.
          </p>
          <label className="mt-5 inline-flex min-h-12 cursor-pointer items-center border border-primary px-5 text-xs font-semibold uppercase">
            Upload images
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => addImages(event.target.files)}
            />
          </label>
          {uploadProgress !== null ? (
            <p className="mt-3 text-sm" aria-live="polite">
              Uploading… {uploadProgress}%
            </p>
          ) : null}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {images.map((image, index) => (
              <div key={image.key} className="border border-border p-3">
                <div className="relative aspect-[4/5] bg-surface-muted">
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <label className="mt-3 flex min-h-11 items-center gap-2 text-xs font-semibold uppercase">
                  <input
                    type="radio"
                    name="primary"
                    checked={primaryKey === image.key}
                    onChange={() => setPrimaryKey(image.key)}
                  />
                  Primary
                </label>
                <input
                  value={image.alt}
                  onChange={(event) =>
                    setImages((current) =>
                      current.map((item) =>
                        item.key === image.key
                          ? { ...item, alt: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Meaningful alt text"
                  className="min-h-11 w-full border border-border-strong px-3 text-sm"
                />
                <div className="mt-2 flex justify-between">
                  <span>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="min-h-11 px-2"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      className="min-h-11 px-2"
                    >
                      ↓
                    </button>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImages((current) =>
                        current.filter((item) => item.key !== image.key),
                      );
                      if (primaryKey === image.key) setPrimaryKey("");
                    }}
                    className="min-h-11 text-xs text-destructive uppercase"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <aside className="h-fit border border-border bg-surface p-5 xl:sticky xl:top-8">
        <h2 className="font-display text-3xl">Publishing</h2>
        <dl className="mt-5 border-y border-border py-4 text-sm">
          <div className="flex justify-between">
            <dt>Configured LKR price</dt>
            <dd className="font-semibold">
              {price
                ? `LKR ${(price.minorAmount / 100).toLocaleString("en-LK")}`
                : "Unavailable"}
            </dd>
          </div>
        </dl>
        <label className="mt-5 grid gap-2 text-xs font-semibold uppercase">
          Availability
          <select
            name="availability"
            defaultValue={product?.availability ?? "available"}
            className="min-h-12 border border-border-strong px-3 text-sm font-normal normal-case"
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>
        <label className="mt-5 grid gap-2 text-xs font-semibold uppercase">
          Display order
          <input
            name="display_order"
            type="number"
            min="0"
            defaultValue={product?.displayOrder ?? 0}
            className="min-h-12 border border-border-strong px-3 text-sm font-normal"
          />
        </label>
        {error ? (
          <p role="alert" className="mt-5 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={pending || uploadProgress !== null}
          className="mt-6 w-full"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </Button>
      </aside>
    </form>
  );
}
