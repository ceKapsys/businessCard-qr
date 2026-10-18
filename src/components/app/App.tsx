"use client";

import { useTranslations } from "next-intl";

import { siteConfig } from "@/site.config";

import { Generator } from "./Generator";
import { Header } from "./Header";
import { Providers } from "./Providers";
import { ServiceWorker } from "./ServiceWorker";

function Shell() {
  const t = useTranslations();
  return (
    <>
      <a
        href="#main"
        className="focus:bg-background focus:ring-ring/50 sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:ring-[3px]"
      >
        {t("app.skipToContent")}
      </a>
      <Header />
      <main id="main" className="flex-1">
        <h1 className="sr-only">{siteConfig.name}</h1>
        <Generator />
      </main>
      <footer className="text-muted-foreground border-t py-6 text-center text-xs">
        {t("app.footer")}{" "}
        <a href={siteConfig.githubUrl} className="underline underline-offset-2" rel="noreferrer">
          GitHub
        </a>
      </footer>
      <ServiceWorker />
    </>
  );
}

export function App() {
  return (
    <Providers>
      <Shell />
    </Providers>
  );
}
