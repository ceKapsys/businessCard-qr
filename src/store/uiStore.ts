import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  EXPORT_FORMATS,
  EXPORT_SIZES,
  type ExportFormat,
  type ExportSize,
} from "@/lib/design/types";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

export type Theme = "system" | "light" | "dark";
const THEMES: Theme[] = ["system", "light", "dark"];

export type UiState = {
  locale: Locale;
  theme: Theme;
  exportFormat: ExportFormat;
  exportSize: ExportSize;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportSize: (size: ExportSize) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      theme: "system",
      exportFormat: "png",
      exportSize: 1024,
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setExportFormat: (exportFormat) => set({ exportFormat }),
      setExportSize: (exportSize) => set({ exportSize }),
    }),
    {
      name: STORAGE_KEYS.ui,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (s) => ({
        locale: s.locale,
        theme: s.theme,
        exportFormat: s.exportFormat,
        exportSize: s.exportSize,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<UiState>;
        return {
          ...current,
          locale: isLocale(p.locale) ? p.locale : current.locale,
          theme: THEMES.includes(p.theme as Theme) ? (p.theme as Theme) : current.theme,
          exportFormat: EXPORT_FORMATS.includes(p.exportFormat as ExportFormat)
            ? (p.exportFormat as ExportFormat)
            : current.exportFormat,
          exportSize: EXPORT_SIZES.includes(p.exportSize as ExportSize)
            ? (p.exportSize as ExportSize)
            : current.exportSize,
        };
      },
    },
  ),
);
