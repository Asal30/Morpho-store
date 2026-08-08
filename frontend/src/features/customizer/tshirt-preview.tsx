import Image from "next/image";

import type { CustomizationColor, CustomizationSide } from "./customization-config";
import type { CustomTextState } from "./customizer.types";

export function TshirtPreview({
  color,
  side,
  artworkUrl,
  customText,
}: Readonly<{
  color: CustomizationColor;
  side: CustomizationSide;
  artworkUrl?: string;
  customText: CustomTextState;
}>) {
  const area = side === "front" ? color.frontArea : color.backArea;
  const layerStyle = {
    left: `${area.x}%`,
    top: `${area.y}%`,
    width: `${area.width}%`,
    height: `${area.height}%`,
  };

  return (
    <div className="relative aspect-4/5 w-full overflow-hidden bg-surface-muted" aria-label={`${side} customization preview`}>
      <Image
        src={color.mockup}
        alt={`${color.name} T-shirt mockup, ${side} print view`}
        fill
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute overflow-hidden" style={layerStyle}>
        {artworkUrl ? (
          <Image src={artworkUrl} alt="Your uploaded artwork preview" fill unoptimized className="object-contain" />
        ) : null}
        {customText.text && customText.placement === side ? (
          <div
            className="absolute inset-x-1 bottom-[8%] overflow-hidden leading-tight wrap-break-word"
            style={{
              color: customText.color,
              fontFamily: customText.font,
              fontSize: `${Math.max(10, customText.fontSize * 0.32)}px`,
              textAlign: customText.alignment,
            }}
          >
            {customText.text}
          </div>
        ) : null}
      </div>
      <span className="absolute top-4 left-4 bg-primary/85 px-3 py-1 text-[0.625rem] font-semibold tracking-[0.16em] text-surface uppercase">
        {side} view
      </span>
    </div>
  );
}
