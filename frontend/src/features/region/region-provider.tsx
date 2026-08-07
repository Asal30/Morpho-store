"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  REGION_COOKIE_NAME,
  regionConfig,
  type CurrencyCode,
  type StoreRegion,
} from "@/features/region/region-config";

interface RegionContextValue {
  region: StoreRegion;
  currency: CurrencyCode;
  setRegion: (region: StoreRegion) => void;
}

const RegionContext = createContext<RegionContextValue | null>(null);

export function RegionProvider({
  initialRegion,
  children,
}: Readonly<{ initialRegion: StoreRegion; children: React.ReactNode }>) {
  const [region, setRegionState] = useState<StoreRegion>(initialRegion);
  const router = useRouter();

  const setRegion = useCallback(
    (nextRegion: StoreRegion) => {
      setRegionState(nextRegion);
      document.cookie = `${REGION_COOKIE_NAME}=${nextRegion}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({ region, currency: regionConfig[region].currency, setRegion }),
    [region, setRegion],
  );

  return <RegionContext value={value}>{children}</RegionContext>;
}

export function useRegion(): RegionContextValue {
  const context = use(RegionContext);

  if (!context) {
    throw new Error("useRegion must be used within RegionProvider");
  }

  return context;
}
