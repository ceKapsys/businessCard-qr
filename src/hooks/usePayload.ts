"use client";

import { useMemo } from "react";

import { getEncoder } from "@/lib/encoders/registry";
import { selectCurrentValues, useFormStore } from "@/store/formStore";

import { useDebouncedValue } from "./useDebouncedValue";

export const PREVIEW_DEBOUNCE_MS = 150;

/** The current encoder and its (debounced) QR payload. */
export function usePayload() {
  const typeId = useFormStore((s) => s.typeId);
  const values = useFormStore(selectCurrentValues);
  const encoder = getEncoder(typeId);
  const debounced = useDebouncedValue(values, PREVIEW_DEBOUNCE_MS);
  const payload = useMemo(() => encoder.encode(debounced), [encoder, debounced]);
  const name = useMemo(() => encoder.fileName(debounced), [encoder, debounced]);
  return { encoder, payload, name };
}
