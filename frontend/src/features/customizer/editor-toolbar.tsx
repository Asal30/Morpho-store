import { Button } from "@/components/ui/button";

type SelectionKind = "artwork" | "text" | "system-logo" | null;

function Icon({ children }: Readonly<{ children: React.ReactNode }>) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export function EditorToolbar({ selection, canUndo, canRedo, onUndo, onRedo, onReset, onDelete }: Readonly<{
  selection: SelectionKind;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onDelete: () => void;
}>) {
  const canReset = selection !== null;
  const canDelete = selection === "artwork" || selection === "text";
  const status = selection === "system-logo" ? "MORPHO logo selected — drag to reposition"
    : selection === "artwork" ? "Artwork selected"
      : selection === "text" ? "Text selected"
        : "Select a design to edit it.";

  return (
    <div className="mt-3 rounded-card border border-border bg-surface p-2 shadow-soft">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="toolbar" aria-label="Design editor actions">
        <Button size="sm" variant="ghost" className="min-h-11 gap-2 px-3 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted disabled:opacity-70 motion-reduce:transition-none" disabled={!canUndo} onClick={onUndo} title="Undo last change (Ctrl/Cmd + Z)" aria-label="Undo last change">
          <Icon><path d="M9 7 4 12l5 5" /><path d="M5 12h8a6 6 0 0 1 6 6" /></Icon><span>Undo</span>
        </Button>
        <Button size="sm" variant="ghost" className="min-h-11 gap-2 px-3 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted disabled:opacity-70 motion-reduce:transition-none" disabled={!canRedo} onClick={onRedo} title="Redo last change (Ctrl/Cmd + Shift + Z)" aria-label="Redo last change">
          <Icon><path d="m15 7 5 5-5 5" /><path d="M19 12h-8a6 6 0 0 0-6 6" /></Icon><span>Redo</span>
        </Button>
        <Button size="sm" variant="ghost" className="min-h-11 gap-2 px-3 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted disabled:opacity-70 motion-reduce:transition-none" disabled={!canReset} onClick={onReset} title="Restore the selected design to its default placement" aria-label="Reset selected design">
          <Icon><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></Icon><span>Reset</span>
        </Button>
        <Button size="sm" variant="ghost" className="min-h-11 gap-2 border-destructive/25 px-3 text-destructive hover:bg-destructive/5 disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-muted disabled:opacity-70 motion-reduce:transition-none" disabled={!canDelete} onClick={onDelete} title={selection === "system-logo" ? "The MORPHO logo cannot be removed" : "Remove selected design"} aria-label="Delete selected design">
          <Icon><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="m7 7 1 13h8l1-13" /></Icon><span>Delete</span>
        </Button>
      </div>
      <p className="px-2 pt-2 text-xs text-muted text-center" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
