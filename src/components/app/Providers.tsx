"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { MESSAGES } from "@/i18n/config";
import { decodeShareHash } from "@/lib/share";
import { useDesignStore } from "@/store/designStore";
import { useFormStore } from "@/store/formStore";
import { useUiStore } from "@/store/uiStore";

type AppStatus = { ready: boolean; loadedFromLink: boolean };
const AppStatusContext = createContext<AppStatus>({ ready: false, loadedFromLink: false });

export const useAppStatus = () => useContext(AppStatusContext);

/** Restores drafts from localStorage, then applies a `#s=` share link if present. */
async function hydrate(): Promise<boolean> {
  await Promise.all([
    useUiStore.persist.rehydrate(),
    useFormStore.persist.rehydrate(),
    useDesignStore.persist.rehydrate(),
  ]);
  const shared = decodeShareHash(window.location.hash);
  if (!shared) return false;
  useFormStore.getState().load(shared.type, shared.values);
  useDesignStore.getState().applyStyle(shared.style);
  // Drop the hash so later edits don't fight with a stale link.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  return true;
}

function useThemeClass() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
}

export function Providers({ children }: { children: ReactNode }) {
  const locale = useUiStore((s) => s.locale);
  const [status, setStatus] = useState<AppStatus>({ ready: false, loadedFromLink: false });

  useEffect(() => {
    let active = true;
    hydrate()
      .catch(() => false)
      .then((loadedFromLink) => {
        if (active) setStatus({ ready: true, loadedFromLink });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useThemeClass();

  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="UTC">
      <AppStatusContext.Provider value={status}>{children}</AppStatusContext.Provider>
    </NextIntlClientProvider>
  );
}
