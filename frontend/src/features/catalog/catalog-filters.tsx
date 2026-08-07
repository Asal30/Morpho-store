"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { CatalogFilterOptions, CatalogState } from "@/features/catalog/product-utils";

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
      <path d="M5 5l14 14M19 5 5 19" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CatalogFilters({
  state,
  options,
}: Readonly<{ state: CatalogState; options: CatalogFilterOptions }>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount = state.colors.length + state.sizes.length + (state.category ? 1 : 0);

  useEffect(
    () => () => {
      document.body.style.removeProperty("overflow");
    },
    [],
  );

  function openFilters() {
    dialogRef.current?.showModal();
    document.body.style.overflow = "hidden";
    setIsOpen(true);
  }

  function closeFilters() {
    dialogRef.current?.close();
    document.body.style.removeProperty("overflow");
    setIsOpen(false);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        type="button"
        aria-expanded={isOpen}
        aria-controls="catalog-filter-dialog"
        onClick={openFilters}
        className="min-h-11 md:hidden"
      >
        Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
      </Button>

      <dialog
        ref={dialogRef}
        id="catalog-filter-dialog"
        aria-labelledby="catalog-filter-title"
        onCancel={(event) => {
          event.preventDefault();
          closeFilters();
        }}
        onClose={() => {
          document.body.style.removeProperty("overflow");
          setIsOpen(false);
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[min(100%,27rem)] max-w-none border-0 bg-surface p-0 text-foreground backdrop:bg-primary/55"
      >
        <form action="/shop" method="get" className="flex h-full flex-col">
          {state.sort !== "featured" ? <input type="hidden" name="sort" value={state.sort} /> : null}
          <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-8">
            <h2 id="catalog-filter-title" className="font-display text-3xl font-medium text-primary">
              Refine the collection
            </h2>
            <button
              type="button"
              aria-label="Close filters"
              onClick={closeFilters}
              className="inline-flex size-11 items-center justify-center text-primary"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-7 sm:px-8">
            <fieldset>
              <legend className="text-caption font-semibold tracking-[0.16em] text-highlight uppercase">
                Category
              </legend>
              <div className="mt-3 grid">
                {[
                  ["", "All"],
                  ["oversized", "Oversized"],
                  ["raglan", "Raglan"],
                ].map(([value, label]) => (
                  <label
                    key={label}
                    className="flex min-h-12 cursor-pointer items-center gap-3 border-b border-border text-sm"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={value}
                      defaultChecked={(state.category ?? "") === value}
                      className="size-4 accent-highlight"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {options.sizes.length ? (
              <fieldset className="mt-8">
                <legend className="text-caption font-semibold tracking-[0.16em] text-highlight uppercase">
                  Size
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-x-5">
                  {options.sizes.map((size) => (
                    <label key={size.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        name="size"
                        value={size.id}
                        defaultChecked={state.sizes.includes(size.id)}
                        className="size-4 accent-highlight"
                      />
                      {size.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {options.colors.length ? (
              <fieldset className="mt-8">
                <legend className="text-caption font-semibold tracking-[0.16em] text-highlight uppercase">
                  Color
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-x-5">
                  {options.colors.map((color) => (
                    <label key={color.id} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        name="color"
                        value={color.id}
                        defaultChecked={state.colors.includes(color.id)}
                        className="size-4 accent-highlight"
                      />
                      {color.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-4 sm:px-8">
            <Link
              href="/shop"
              className="inline-flex min-h-12 items-center justify-center rounded-control border border-border-strong text-xs font-semibold tracking-[0.14em] uppercase no-underline"
            >
              Clear
            </Link>
            <Button type="submit">View pieces</Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
