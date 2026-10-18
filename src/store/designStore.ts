import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_DESIGN, SMALL_PRINT_STYLE } from "@/lib/design/presets";
import { sanitizeStyle, toStyle } from "@/lib/design/sanitize";
import type { DesignOptions, DesignPreset, DesignStyle } from "@/lib/design/types";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";

export type DesignState = {
  design: DesignOptions;
  userPresets: DesignPreset[];
  update: (patch: Partial<DesignOptions>) => void;
  applyStyle: (style: DesignStyle) => void;
  setLogo: (logo: string | null) => void;
  savePreset: (name: string) => void;
  deletePreset: (id: string) => void;
  /** Settings that make the smallest, most robust code for tiny prints. */
  optimiseForSmallPrint: () => void;
  reset: () => void;
};

const MAX_USER_PRESETS = 20;

const isDataImage = (v: unknown): v is string =>
  typeof v === "string" && v.startsWith("data:image/");

export const useDesignStore = create<DesignState>()(
  persist(
    (set) => ({
      design: DEFAULT_DESIGN,
      userPresets: [],
      update: (patch) => set((s) => ({ design: { ...s.design, ...patch } })),
      applyStyle: (style) => set((s) => ({ design: { ...style, logo: s.design.logo } })),
      setLogo: (logo) => set((s) => ({ design: { ...s.design, logo } })),
      savePreset: (name) =>
        set((s) => {
          const preset: DesignPreset = {
            id: `user-${Date.now().toString(36)}`,
            name: name.trim().slice(0, 40) || "Preset",
            style: toStyle(s.design),
          };
          return { userPresets: [...s.userPresets, preset].slice(-MAX_USER_PRESETS) };
        }),
      deletePreset: (id) => set((s) => ({ userPresets: s.userPresets.filter((p) => p.id !== id) })),
      optimiseForSmallPrint: () =>
        set((s) => ({
          design: {
            ...s.design,
            ...SMALL_PRINT_STYLE,
            gradient: { ...s.design.gradient, enabled: false },
          },
        })),
      reset: () => set({ design: DEFAULT_DESIGN }),
    }),
    {
      name: STORAGE_KEYS.design,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (s) => ({ design: s.design, userPresets: s.userPresets }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as { design?: Partial<DesignOptions>; userPresets?: unknown };
        const presets = Array.isArray(p.userPresets) ? (p.userPresets as DesignPreset[]) : [];
        return {
          ...current,
          design: {
            ...sanitizeStyle(p.design),
            logo: isDataImage(p.design?.logo) ? p.design.logo : null,
          },
          userPresets: presets
            .filter((x) => typeof x?.id === "string" && typeof x?.name === "string")
            .map((x) => ({ id: x.id, name: x.name, style: sanitizeStyle(x.style) })),
        };
      },
    },
  ),
);
