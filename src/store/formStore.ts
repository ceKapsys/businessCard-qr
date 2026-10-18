import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_ENCODER_ID, encoders, getEncoder, isEncoderId } from "@/lib/encoders/registry";
import type { FormValues } from "@/lib/fields/types";
import { sanitizeValues } from "@/lib/fields/values";
import { safeStorage, STORAGE_KEYS } from "@/lib/storage";

type ValuesByType = Record<string, FormValues>;

export type FormState = {
  typeId: string;
  valuesByType: ValuesByType;
  /** Bumped when values are replaced from outside the form (reset, share link). */
  revision: number;
  setType: (typeId: string) => void;
  setValues: (typeId: string, values: FormValues) => void;
  load: (typeId: string, values: FormValues) => void;
  reset: () => void;
};

const initialValues = (): ValuesByType =>
  Object.fromEntries(encoders.map((e) => [e.id, structuredClone(e.defaults)]));

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      typeId: DEFAULT_ENCODER_ID,
      valuesByType: initialValues(),
      revision: 0,
      setType: (typeId) => set({ typeId: getEncoder(typeId).id }),
      setValues: (typeId, values) =>
        set((s) => ({ valuesByType: { ...s.valuesByType, [typeId]: values } })),
      load: (typeId, values) =>
        set((s) => ({
          typeId,
          valuesByType: { ...s.valuesByType, [typeId]: values },
          revision: s.revision + 1,
        })),
      reset: () => set((s) => ({ valuesByType: initialValues(), revision: s.revision + 1 })),
    }),
    {
      name: STORAGE_KEYS.form,
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (s) => ({ typeId: s.typeId, valuesByType: s.valuesByType }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Pick<FormState, "typeId" | "valuesByType">>;
        const stored = p.valuesByType ?? {};
        return {
          ...current,
          typeId: isEncoderId(p.typeId) ? p.typeId : current.typeId,
          valuesByType: Object.fromEntries(
            encoders.map((e) => [e.id, sanitizeValues(e.fields, stored[e.id] ?? e.defaults)]),
          ),
          revision: current.revision + 1,
        };
      },
    },
  ),
);

export const selectCurrentValues = (s: FormState): FormValues =>
  s.valuesByType[s.typeId] ?? getEncoder(s.typeId).defaults;
