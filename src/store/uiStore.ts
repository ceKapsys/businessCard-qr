import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  EXPORT_FORMATS,
  EXPORT_SIZES,
  type ExportFormat,
  type ExportSize,
} from "@/lib/design/types";
import { DEFAULT_PRINT_MM, MAX_PRINT_MM, MIN_PRINT_MM } from "@/lib/qr/density";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

export type Theme = "system" | "light" | "dark";
const THEMES: Theme[] = ["system", "light", "dark"];

export type UiState = {
  locale: Locale;
  theme: Theme;
  exportFormat: ExportFormat;
  exportSize: ExportSize;
  /** Intended printed width of the QR in mm; drives the scan-density rating. */
  printSizeMm: number;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setExportFormat: (format: ExportFormat) => void;
  setExportSize: (size: ExportSize) => void;
  setPrintSizeMm: (mm: number) => void;
};

export const clampPrintSize = (mm: number) =>
  Number.isFinite(mm) ? Math.min(MAX_PRINT_MM, Math.max(MIN_PRINT_MM, mm)) : DEFAULT_PRINT_MM;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      theme: "system",
      exportFormat: "png",
      exportSize: 1024,
      printSizeMm: DEFAULT_PRINT_MM,
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      setExportFormat: (exportFormat) => set({ exportFormat }),
      setExportSize: (exportSize) => set({ exportSize }),
      setPrintSizeMm: (mm) => set({ printSizeMm: clampPrintSize(mm) }),
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
        printSizeMm: s.printSizeMm,
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
          printSizeMm:
            typeof p.printSizeMm === "number" ? clampPrintSize(p.printSizeMm) : current.printSizeMm,
        };
      },
    },
  ),
);
