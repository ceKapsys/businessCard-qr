import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";

import { siteConfig } from "@/site.config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${siteConfig.name} — vCard QR Code Generator`,
  description: siteConfig.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={{ "--brand": siteConfig.accentColor } as CSSProperties}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
