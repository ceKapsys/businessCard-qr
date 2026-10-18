import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";

import { STORAGE_KEYS } from "@/lib/storage";
import { siteConfig } from "@/site.config";
import "./globals.css";

const title = `${siteConfig.name} — Free vCard QR Code Generator`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "vCard QR code",
    "business card QR",
    "contact QR code",
    "WhatsApp QR",
    "Wi-Fi QR",
    "QR code generator",
    "Bangla",
  ],
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
    locale: "en_US",
    alternateLocale: ["bn_BD"],
  },
  twitter: { card: "summary_large_image", title, description: siteConfig.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
  ],
};

// Applies the saved theme before first paint to avoid a light/dark flash.
const themeScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  STORAGE_KEYS.ui,
)})||"{}").state||{};var t=s.theme||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";if(s.locale)e.lang=s.locale}catch(_){}})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ "--brand": siteConfig.accentColor } as CSSProperties}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
