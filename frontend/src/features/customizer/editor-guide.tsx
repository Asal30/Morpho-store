const items = [
  ["Select", "Tap or click a design to select it.", "◎"],
  ["Move & edit", "Drag the selected item. Use handles to resize or rotate artwork and text.", "↔"],
  ["Touch", "Use two fingers to pinch and rotate artwork or text on touch screens.", "◇"],
  ["Default logo", "Drag the MORPHO logo to reposition it. Its size and angle stay fixed.", "M"],
] as const;

export function EditorGuide() {
  return (
    <section className="mt-4 rounded-card border border-border bg-surface-muted/55 p-4" aria-labelledby="editor-guide-title">
      <h2 id="editor-guide-title" className="text-xs font-semibold tracking-[0.15em] text-primary uppercase">How to customize</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map(([label, description, icon]) => (
          <div key={label} className="flex gap-3">
            <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-primary">{icon}</span>
            <p className="text-xs leading-5 text-muted"><strong className="block text-[0.625rem] tracking-[0.12em] text-primary uppercase">{label}</strong>{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
