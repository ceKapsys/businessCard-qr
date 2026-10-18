"use client";

import { useTranslations } from "next-intl";

import { NativeSelect } from "@/components/ui/native-select";
import { LOCALE_NAMES, LOCALES, type Locale } from "@/i18n/config";
import { siteConfig } from "@/site.config";
import { useUiStore, type Theme } from "@/store/uiStore";

const THEMES: Theme[] = ["system", "light", "dark"];

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function Header() {
  const t = useTranslations();
  const { locale, theme, setLocale, setTheme } = useUiStore();

  return (
    <header className="bg-card/60 border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG from /public */}
          <img src={siteConfig.logo} alt="" width={36} height={36} className="size-9" />
          <div>
            <p className="text-lg leading-tight font-semibold">{siteConfig.name}</p>
            <p className="text-muted-foreground hidden text-xs sm:block">{siteConfig.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28">
            <NativeSelect
              aria-label={t("language.label")}
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
            >
              {LOCALES.map((l) => (
                <option key={l} value={l} lang={l}>
                  {LOCALE_NAMES[l]}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="w-28">
            <NativeSelect
              aria-label={t("theme.label")}
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              {THEMES.map((th) => (
                <option key={th} value={th}>
                  {t(`theme.${th}`)}
                </option>
              ))}
            </NativeSelect>
          </div>
          <a
            href={siteConfig.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={t("app.github")}
            className="hover:bg-accent focus-visible:ring-ring/50 inline-flex size-9 items-center justify-center rounded-md focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <GitHubIcon />
          </a>
        </div>
      </div>
    </header>
  );
}
