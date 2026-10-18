import type { StateStorage } from "zustand/middleware";

/**
 * localStorage that never throws (private mode, disabled storage, quota).
 * The app keeps working in memory when storage is unavailable.
 */
export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* storage unavailable or full — ignore */
    }
  },
  removeItem(name) {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export const STORAGE_KEYS = {
  form: "cardqr:form",
  design: "cardqr:design",
  ui: "cardqr:ui",
} as const;
