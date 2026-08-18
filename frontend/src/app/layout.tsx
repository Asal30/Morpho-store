import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { cookies } from "next/headers";

import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  DEFAULT_REGION,
  isStoreRegion,
  REGION_COOKIE_NAME,
} from "@/features/region/region-config";
import { RegionProvider } from "@/features/region/region-provider";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "MORPHO", template: "%s — MORPHO" },
  description: "Wear Your Memories. Premium T-shirts from Sri Lanka.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const savedRegion = cookieStore.get(REGION_COOKIE_NAME)?.value;
  const initialRegion = isStoreRegion(savedRegion) ? savedRegion : DEFAULT_REGION;

  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable}`}>
        <RegionProvider initialRegion={initialRegion}>
          {/* <AnnouncementBar /> */}
          <SiteHeader />
          {children}
          <SiteFooter />
        </RegionProvider>
      </body>
    </html>
  );
}
