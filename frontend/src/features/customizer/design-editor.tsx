"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, FabricObject, IText } from "fabric";

import { getDefaultMorphoLogo, type CustomizationCategory, type CustomizationColor, type CustomizationSide, type DefaultLogoConfiguration, type PrintArea } from "./customization-config";
import type { CustomTextState, DefaultBrandingPosition, DesignObject } from "./customizer.types";
import { EditorToolbar } from "./editor-toolbar";

const LOGICAL_WIDTH = 1000;
const CONTROL_COLOR = "#425b50";

type EditorObject = FabricObject & {
  morphoId?: string;
  morphoType?: "artwork" | "text" | "system-logo";
  morphoAssetKey?: "frontArtwork" | "backArtwork";
  morphoSourceUrl?: string;
};

interface GestureState {
  target: EditorObject;
  distance: number;
  angle: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

interface HistoryState {
  entries: EditorSnapshot[];
  index: number;
}

interface EditorSnapshot {
  objects: DesignObject[];
  brandingPosition: DefaultBrandingPosition;
}

function logicalHeight(area: PrintArea): number {
  return Math.round(LOGICAL_WIDTH * (area.height / area.width));
}

function objectStyle(object: EditorObject) {
  object.set({
    borderColor: CONTROL_COLOR,
    cornerColor: "#fefcf7",
    cornerStrokeColor: CONTROL_COLOR,
    cornerStyle: "circle",
    cornerSize: 18,
    touchCornerSize: 34,
    transparentCorners: false,
    padding: 6,
    centeredRotation: true,
    lockUniScaling: true,
  });
  object.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
}

function systemLogoStyle(object: EditorObject) {
  object.set({
    borderColor: CONTROL_COLOR,
    borderDashArray: [8, 6],
    padding: 8,
    selectable: true,
    evented: true,
    hasControls: false,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hoverCursor: "grab",
    moveCursor: "grabbing",
  });
}

function clampSystemLogo(object: EditorObject, height: number) {
  const halfWidth = object.getScaledWidth() / 2;
  const halfHeight = object.getScaledHeight() / 2;
  object.set({
    left: Math.min(LOGICAL_WIDTH - halfWidth, Math.max(halfWidth, object.left ?? LOGICAL_WIDTH / 2)),
    top: Math.min(height - halfHeight, Math.max(halfHeight, object.top ?? height / 2)),
  });
  object.setCoords();
}

function snapshot(canvas: Canvas, side: CustomizationSide, height: number): DesignObject[] {
  return canvas.getObjects().filter((rawObject) => (rawObject as EditorObject).morphoType !== "system-logo").map((rawObject, zIndex) => {
    const object = rawObject as EditorObject;
    const base = {
      id: object.morphoId ?? crypto.randomUUID(),
      placement: side,
      x: (object.left ?? 0) / LOGICAL_WIDTH,
      y: (object.top ?? 0) / height,
      width: (object.width ?? 1) / LOGICAL_WIDTH,
      height: (object.height ?? 1) / height,
      scaleX: object.scaleX ?? 1,
      scaleY: object.scaleY ?? 1,
      rotation: object.angle ?? 0,
      zIndex,
    };
    if (object.morphoType === "text" && object instanceof IText) {
      return {
        ...base,
        type: "text" as const,
        text: object.text,
        fontFamily: object.fontFamily,
        fontSize: object.fontSize,
        fill: typeof object.fill === "string" ? object.fill : "#111111",
        textAlign: object.textAlign as "left" | "center" | "right",
      };
    }
    return {
      ...base,
      type: "artwork" as const,
      assetKey: object.morphoAssetKey ?? (side === "front" ? "frontArtwork" : "backArtwork"),
    };
  });
}

function readBrandingPosition(canvas: Canvas, height: number, fallback: DefaultBrandingPosition): DefaultBrandingPosition {
  const logo = canvas.getObjects().find((object) => (object as EditorObject).morphoType === "system-logo") as EditorObject | undefined;
  return logo ? {
    normalizedX: (logo.left ?? LOGICAL_WIDTH / 2) / LOGICAL_WIDTH,
    normalizedY: (logo.top ?? height / 2) / height,
  } : fallback;
}

function sameSnapshot(left: DesignObject[], right: DesignObject[]): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sameEditorSnapshot(left: EditorSnapshot, right: EditorSnapshot): boolean {
  return sameSnapshot(left.objects, right.objects) &&
    left.brandingPosition.normalizedX === right.brandingPosition.normalizedX &&
    left.brandingPosition.normalizedY === right.brandingPosition.normalizedY;
}

function fitCanvasDisplay(canvas: Canvas) {
  canvas.wrapperEl.style.width = "100%";
  canvas.wrapperEl.style.height = "100%";
  canvas.wrapperEl.style.position = "absolute";
  canvas.wrapperEl.style.inset = "0";
  canvas.wrapperEl.style.zIndex = "2";
  canvas.lowerCanvasEl.style.width = "100%";
  canvas.lowerCanvasEl.style.height = "100%";
  canvas.upperCanvasEl.style.width = "100%";
  canvas.upperCanvasEl.style.height = "100%";
}

export function DesignEditor({
  category,
  color,
  side,
  defaultLogo,
  brandingPosition,
  artworkUrls,
  customText,
  initialDesign,
  onBrandingPositionChange,
  onTextChange,
  onDesignChange,
  onRemoveArtwork,
}: Readonly<{
  category: CustomizationCategory;
  color: CustomizationColor;
  side: CustomizationSide;
  defaultLogo: DefaultLogoConfiguration;
  brandingPosition: DefaultBrandingPosition;
  artworkUrls: Partial<Record<CustomizationSide, string>>;
  customText: CustomTextState;
  initialDesign: readonly DesignObject[];
  onBrandingPositionChange: (value: DefaultBrandingPosition) => void;
  onTextChange: (value: CustomTextState) => void;
  onDesignChange: (value: DesignObject[]) => void;
  onRemoveArtwork: (side: CustomizationSide) => void;
}>) {
  const [initialRecords] = useState(() => ({
    front: initialDesign.filter((object) => object.placement === "front"),
    back: initialDesign.filter((object) => object.placement === "back"),
  }));
  const elementRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const disposedRef = useRef(false);
  const sideRef = useRef(side);
  const heightRef = useRef(logicalHeight(color.frontArea));
  const recordsRef = useRef<Record<CustomizationSide, DesignObject[]>>(initialRecords);
  const historiesRef = useRef<Record<CustomizationSide, HistoryState>>({
    front: { entries: [{ objects: initialRecords.front, brandingPosition }], index: 0 },
    back: { entries: [{ objects: initialRecords.back, brandingPosition }], index: 0 },
  });
  const loadingRef = useRef(false);
  const loadTokenRef = useRef(0);
  const textTimerRef = useRef<number | undefined>(undefined);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<GestureState | null>(null);
  const artworkUrlsRef = useRef(artworkUrls);
  const customTextRef = useRef(customText);
  const brandingPositionRef = useRef(brandingPosition);
  const removeArtworkRef = useRef(onRemoveArtwork);
  const brandingChangeRef = useRef(onBrandingPositionChange);
  const [selection, setSelection] = useState<{ type: "artwork" | "text" | "system-logo"; rotation: number; scale: number } | null>(null);
  const [historyControls, setHistoryControls] = useState({ canUndo: false, canRedo: false });
  const area = side === "front" ? color.frontArea : color.backArea;
  const logo = getDefaultMorphoLogo(category, color.name);
  const showDefaultLogo = defaultLogo.side === side && !initialDesign.some((object) => object.placement === side);

  useEffect(() => {
    artworkUrlsRef.current = artworkUrls;
    customTextRef.current = customText;
    brandingPositionRef.current = brandingPosition;
    removeArtworkRef.current = onRemoveArtwork;
    brandingChangeRef.current = onBrandingPositionChange;
  }, [artworkUrls, brandingPosition, customText, onBrandingPositionChange, onRemoveArtwork]);

  const notify = useCallback((nextSide: CustomizationSide, next: DesignObject[]) => {
    recordsRef.current[nextSide] = next;
    onDesignChange([...recordsRef.current.front, ...recordsRef.current.back]);
  }, [onDesignChange]);

  const invalidatePendingLoads = useCallback(() => {
    loadTokenRef.current += 1;
  }, []);

  const updateSelection = useCallback(() => {
    const selected = canvasRef.current?.getActiveObject() as EditorObject | undefined;
    setSelection(selected?.morphoType ? {
      type: selected.morphoType,
      rotation: Math.round(selected.angle ?? 0),
      scale: Math.round(((selected.scaleX ?? 1) + (selected.scaleY ?? 1)) * 50),
    } : null);
  }, []);

  const commit = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadingRef.current) return;
    const currentSide = sideRef.current;
    const next = snapshot(canvas, currentSide, heightRef.current);
    const nextBrandingPosition = readBrandingPosition(canvas, heightRef.current, brandingPositionRef.current);
    brandingPositionRef.current = nextBrandingPosition;
    brandingChangeRef.current(nextBrandingPosition);
    notify(currentSide, next);
    const history = historiesRef.current[currentSide];
    const nextSnapshot = { objects: next, brandingPosition: nextBrandingPosition };
    if (sameEditorSnapshot(history.entries[history.index], nextSnapshot)) return;
    history.entries = [...history.entries.slice(0, history.index + 1), nextSnapshot].slice(-30);
    history.index = history.entries.length - 1;
    setHistoryControls({ canUndo: history.index > 0, canRedo: false });
    updateSelection();
  }, [notify, updateSelection]);

  const addRecord = useCallback(async (canvas: Canvas, record: DesignObject, height: number, isCurrent: () => boolean) => {
    let object: EditorObject;
    if (record.type === "artwork") {
      const url = artworkUrlsRef.current[record.placement];
      if (!url) return;
      const image = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      if (!isCurrent() || canvasRef.current !== canvas || disposedRef.current || canvas.destroyed) return;
      object = image as EditorObject;
      object.morphoAssetKey = record.assetKey;
      object.morphoSourceUrl = url;
    } else {
      object = new IText(record.text, {
        fontFamily: record.fontFamily,
        fontSize: record.fontSize,
        fill: record.fill,
        textAlign: record.textAlign,
      }) as EditorObject;
    }
    if (!isCurrent() || canvasRef.current !== canvas || disposedRef.current || canvas.destroyed) return;
    object.morphoId = record.id;
    object.morphoType = record.type;
    object.set({
      originX: "center",
      originY: "center",
      left: record.x * LOGICAL_WIDTH,
      top: record.y * height,
      angle: record.rotation,
      scaleX: record.scaleX,
      scaleY: record.scaleY,
    });
    if (object.width && record.width) object.scaleX = (record.width * LOGICAL_WIDTH * record.scaleX) / object.width;
    if (object.height && record.height) object.scaleY = (record.height * height * record.scaleY) / object.height;
    objectStyle(object);
    canvas.add(object);
  }, []);

  const addSystemLogo = useCallback(async (canvas: Canvas, nextSide: CustomizationSide, height: number, isCurrent: () => boolean) => {
    if (nextSide !== defaultLogo.side) return;
    const image = await FabricImage.fromURL(logo.src);
    if (!isCurrent() || canvasRef.current !== canvas || disposedRef.current || canvas.destroyed) return;
    const object = image as EditorObject;
    const scale = (defaultLogo.width * LOGICAL_WIDTH) / (image.width || 1);
    object.morphoId = "morpho-system-logo";
    object.morphoType = "system-logo";
    object.morphoSourceUrl = logo.src;
    object.set({
      originX: "center",
      originY: "center",
      left: brandingPositionRef.current.normalizedX * LOGICAL_WIDTH,
      top: brandingPositionRef.current.normalizedY * height,
      angle: 0,
      scaleX: scale,
      scaleY: scale,
    });
    systemLogoStyle(object);
    clampSystemLogo(object, height);
    canvas.add(object);
  }, [defaultLogo.side, defaultLogo.width, logo.src]);

  const loadSide = useCallback(async (nextSide: CustomizationSide, records: DesignObject[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const token = ++loadTokenRef.current;
    loadingRef.current = true;
    canvas.discardActiveObject();
    canvas.clear();
    const nextArea = nextSide === "front" ? color.frontArea : color.backArea;
    const height = logicalHeight(nextArea);
    heightRef.current = height;
    canvas.setDimensions({ width: LOGICAL_WIDTH, height });
    fitCanvasDisplay(canvas);
    for (const record of [...records].sort((a, b) => a.zIndex - b.zIndex)) {
      await addRecord(canvas, record, height, () => token === loadTokenRef.current && sideRef.current === nextSide);
      if (token !== loadTokenRef.current) return;
    }
    if (!records.length && nextSide === defaultLogo.side) {
      await addSystemLogo(canvas, nextSide, height, () => token === loadTokenRef.current && sideRef.current === nextSide);
      if (token !== loadTokenRef.current) return;
    }
    canvas.requestRenderAll();
    loadingRef.current = false;
    updateSelection();
  }, [addRecord, addSystemLogo, color.backArea, color.frontArea, defaultLogo.side, updateSelection]);

  const moveHistory = useCallback((direction: -1 | 1) => {
    const currentSide = sideRef.current;
    const history = historiesRef.current[currentSide];
    const nextIndex = history.index + direction;
    if (nextIndex < 0 || nextIndex >= history.entries.length) return;
    history.index = nextIndex;
    const next = history.entries[nextIndex];
    brandingPositionRef.current = next.brandingPosition;
    brandingChangeRef.current(next.brandingPosition);
    notify(currentSide, next.objects);
    void loadSide(currentSide, next.objects);
    setHistoryControls({ canUndo: history.index > 0, canRedo: history.index < history.entries.length - 1 });
  }, [loadSide, notify]);

  useEffect(() => {
    if (!elementRef.current) return;
    const canvas = new Canvas(elementRef.current, {
      width: LOGICAL_WIDTH,
      height: heightRef.current,
      preserveObjectStacking: true,
      selection: true,
      uniformScaling: true,
      enableRetinaScaling: true,
    });
    disposedRef.current = false;
    canvasRef.current = canvas;
    canvas.upperCanvasEl.style.touchAction = "none";
    fitCanvasDisplay(canvas);

    const modified = () => commit();
    const moving = (event: { target?: FabricObject }) => {
      const target = event.target as EditorObject | undefined;
      if (target?.morphoType === "system-logo") clampSystemLogo(target, heightRef.current);
    };
    const selected = () => updateSelection();
    const textChanged = (event: { target: IText }) => {
      const text = event.target;
      onTextChange({
        text: text.text,
        font: text.fontFamily,
        fontSize: text.fontSize,
        color: typeof text.fill === "string" ? text.fill : "#111111",
        alignment: text.textAlign as CustomTextState["alignment"],
        placement: sideRef.current,
      });
      window.clearTimeout(textTimerRef.current);
      textTimerRef.current = window.setTimeout(commit, 300);
    };
    canvas.on("object:modified", modified);
    canvas.on("object:moving", moving);
    canvas.on("selection:created", selected);
    canvas.on("selection:updated", selected);
    canvas.on("selection:cleared", selected);
    canvas.on("text:changed", textChanged);

    const pointers = pointersRef.current;
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size !== 2) return;
      const target = canvas.getActiveObject() as EditorObject | undefined;
      if (!target || target.morphoType === "system-logo" || target instanceof IText && target.isEditing) return;
      const [first, second] = [...pointers.values()];
      gestureRef.current = {
        target,
        distance: Math.hypot(second.x - first.x, second.y - first.y),
        angle: Math.atan2(second.y - first.y, second.x - first.x),
        scaleX: target.scaleX ?? 1,
        scaleY: target.scaleY ?? 1,
        rotation: target.angle ?? 0,
      };
      event.preventDefault();
    };
    const pointerMove = (event: PointerEvent) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const gesture = gestureRef.current;
      if (!gesture || pointers.size < 2) return;
      const [first, second] = [...pointers.values()];
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const angle = Math.atan2(second.y - first.y, second.x - first.x);
      const ratio = Math.max(0.1, Math.min(8, distance / Math.max(1, gesture.distance)));
      gesture.target.set({
        scaleX: gesture.scaleX * ratio,
        scaleY: gesture.scaleY * ratio,
        angle: gesture.rotation + ((angle - gesture.angle) * 180) / Math.PI,
      });
      gesture.target.setCoords();
      canvas.requestRenderAll();
      updateSelection();
      event.preventDefault();
    };
    const pointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (gestureRef.current && pointers.size < 2) {
        gestureRef.current = null;
        commit();
      }
    };
    const upper = canvas.upperCanvasEl;
    upper.addEventListener("pointerdown", pointerDown, { passive: false });
    upper.addEventListener("pointermove", pointerMove, { passive: false });
    upper.addEventListener("pointerup", pointerUp);
    upper.addEventListener("pointercancel", pointerUp);

    const keyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const active = canvas.getActiveObject();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
        moveHistory(event.shiftKey ? 1 : -1);
        event.preventDefault();
      } else if ((event.key === "Delete" || event.key === "Backspace") && active && !(active instanceof IText && active.isEditing)) {
        const editorObject = active as EditorObject;
        if (editorObject.morphoType === "system-logo") {
          event.preventDefault();
          return;
        }
        if (editorObject.morphoType === "text") onTextChange({ ...customTextRef.current, text: "" });
        if (editorObject.morphoType === "artwork") removeArtworkRef.current(sideRef.current);
        canvas.remove(active);
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        commit();
        event.preventDefault();
      } else if (event.key === "Escape") {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      }
    };
    window.addEventListener("keydown", keyDown);

    return () => {
      disposedRef.current = true;
      invalidatePendingLoads();
      pointers.clear();
      gestureRef.current = null;
      window.clearTimeout(textTimerRef.current);
      window.removeEventListener("keydown", keyDown);
      upper.removeEventListener("pointerdown", pointerDown);
      upper.removeEventListener("pointermove", pointerMove);
      upper.removeEventListener("pointerup", pointerUp);
      upper.removeEventListener("pointercancel", pointerUp);
      canvasRef.current = null;
      void canvas.dispose();
    };
  }, [commit, invalidatePendingLoads, loadSide, moveHistory, onTextChange, updateSelection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (sideRef.current !== side) {
      if (!loadingRef.current) {
        const nextBrandingPosition = readBrandingPosition(canvas, heightRef.current, brandingPositionRef.current);
        brandingPositionRef.current = nextBrandingPosition;
        brandingChangeRef.current(nextBrandingPosition);
        notify(sideRef.current, snapshot(canvas, sideRef.current, heightRef.current));
      }
      sideRef.current = side;
    }
    const history = historiesRef.current[side];
    setHistoryControls({ canUndo: history.index > 0, canRedo: history.index < history.entries.length - 1 });
    void loadSide(side, recordsRef.current[side]);
  }, [loadSide, notify, side]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadingRef.current || sideRef.current !== side) return;
    const systemLogo = canvas.getObjects().find((object) => (object as EditorObject).morphoType === "system-logo");
    if (!showDefaultLogo && systemLogo) {
      canvas.remove(systemLogo);
      canvas.requestRenderAll();
    } else if (showDefaultLogo && !systemLogo) {
      const token = loadTokenRef.current;
      void addSystemLogo(canvas, side, heightRef.current, () => token === loadTokenRef.current && sideRef.current === side)
        .then(() => canvas.requestRenderAll());
    }
  }, [addSystemLogo, showDefaultLogo, side]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadingRef.current) return;
    let cancelled = false;
    const targetSide = side;
    const current = canvas.getObjects().find((object) => (object as EditorObject).morphoType === "artwork") as EditorObject | undefined;
    const url = artworkUrls[side];
    if (!url && current) {
      canvas.remove(current);
      commit();
      return;
    }
    if (!url || current?.morphoSourceUrl === url) return;
    if (current) canvas.remove(current);
    const systemLogo = canvas.getObjects().find((object) => (object as EditorObject).morphoType === "system-logo");
    if (systemLogo) canvas.remove(systemLogo);
    void FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((image) => {
      if (cancelled || disposedRef.current || canvasRef.current !== canvas || sideRef.current !== targetSide || canvas.destroyed) return;
      const object = image as EditorObject;
      const scale = Math.min((LOGICAL_WIDTH * 0.68) / (image.width || 1), (heightRef.current * 0.68) / (image.height || 1));
      object.set({ originX: "center", originY: "center", left: LOGICAL_WIDTH / 2, top: heightRef.current / 2, scaleX: scale, scaleY: scale });
      object.morphoId = crypto.randomUUID();
      object.morphoType = "artwork";
      object.morphoAssetKey = targetSide === "front" ? "frontArtwork" : "backArtwork";
      object.morphoSourceUrl = url;
      objectStyle(object);
      canvas.add(object);
      canvas.setActiveObject(object);
      canvas.requestRenderAll();
      commit();
    });
    return () => {
      cancelled = true;
    };
  }, [artworkUrls, commit, side]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadingRef.current) return;
    if (customText.placement === side && customText.text) {
      const otherSide = side === "front" ? "back" : "front";
      const withoutText = recordsRef.current[otherSide].filter((object) => object.type !== "text");
      if (withoutText.length !== recordsRef.current[otherSide].length) notify(otherSide, withoutText);
    }
    const textObject = canvas.getObjects().find((object) => (object as EditorObject).morphoType === "text") as IText | undefined;
    if (customText.placement !== side || !customText.text) {
      if (textObject) {
        canvas.remove(textObject);
        commit();
      }
      return;
    }
    if (textObject) {
      textObject.set({ text: customText.text, fontFamily: customText.font, fontSize: customText.fontSize, fill: customText.color, textAlign: customText.alignment });
      textObject.setCoords();
      canvas.requestRenderAll();
      commit();
      return;
    }
    const text = new IText(customText.text, {
      originX: "center",
      originY: "center",
      left: LOGICAL_WIDTH / 2,
      top: heightRef.current * 0.72,
      fontFamily: customText.font,
      fontSize: customText.fontSize,
      fill: customText.color,
      textAlign: customText.alignment,
    }) as EditorObject;
    text.morphoId = crypto.randomUUID();
    text.morphoType = "text";
    const systemLogo = canvas.getObjects().find((object) => (object as EditorObject).morphoType === "system-logo");
    if (systemLogo) canvas.remove(systemLogo);
    objectStyle(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
    commit();
  }, [commit, customText, notify, side]);

  function deleteSelected() {
    const canvas = canvasRef.current;
    const selected = canvas?.getActiveObject();
    if (!canvas || !selected) return;
    const editorObject = selected as EditorObject;
    if (editorObject.morphoType === "system-logo") return;
    if (editorObject.morphoType === "text") onTextChange({ ...customText, text: "" });
    if (editorObject.morphoType === "artwork") onRemoveArtwork(side);
    canvas.remove(selected);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    commit();
  }

  function resetSelected() {
    const canvas = canvasRef.current;
    const selected = canvas?.getActiveObject() as EditorObject | undefined;
    if (!canvas || !selected) return;
    if (selected.morphoType === "system-logo") {
      selected.set({ left: defaultLogo.x * LOGICAL_WIDTH, top: defaultLogo.y * heightRef.current, angle: 0 });
      clampSystemLogo(selected, heightRef.current);
      canvas.requestRenderAll();
      commit();
      return;
    }
    const maxWidth = LOGICAL_WIDTH * 0.68;
    const maxHeight = heightRef.current * 0.68;
    const scale = Math.min(maxWidth / (selected.width || 1), maxHeight / (selected.height || 1), 1);
    selected.set({ left: LOGICAL_WIDTH / 2, top: heightRef.current / 2, angle: 0, scaleX: scale, scaleY: scale });
    selected.setCoords();
    canvas.requestRenderAll();
    commit();
  }

  return (
    <div>
      <div className="relative aspect-4/5 w-full overflow-hidden bg-surface-muted" aria-label={`${side} interactive customization editor`}>
      {side === "front" ? 
      <Image src={color.frontMockup} alt={`${color.name} T-shirt mockup, ${side} print view`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" /> 
      :
      <Image src={color.backMockup} alt={`${color.name} T-shirt mockup, ${side} print view`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      }
        <div className="absolute overflow-hidden ring-1 ring-accent/45 ring-offset-1 ring-offset-transparent" style={{ left: `${area.x}%`, top: `${area.y}%`, width: `${area.width}%`, height: `${area.height}%` }}>
          <div className="absolute inset-0 z-2" data-fabric-host>
            <canvas ref={elementRef} />
          </div>
        </div>
        <span className="absolute top-4 left-4 bg-primary/85 px-3 py-1 text-[0.625rem] font-semibold tracking-[0.16em] text-surface uppercase">{side} editor</span>
      </div>
      <EditorToolbar selection={selection?.type ?? null} canUndo={historyControls.canUndo} canRedo={historyControls.canRedo} onUndo={() => moveHistory(-1)} onRedo={() => moveHistory(1)} onReset={resetSelected} onDelete={deleteSelected} />
    </div>
  );
}
