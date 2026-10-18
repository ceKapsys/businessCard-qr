"use client";

import { useCallback, useState } from "react";

import type { QrEncoder } from "@/lib/encoders/registry";
import type { FormValues } from "@/lib/fields/types";
import { selectCurrentValues, useFormStore } from "@/store/formStore";

import { DynamicForm } from "./DynamicForm";

/** Connects a `DynamicForm` for `encoder` to the form store. */
export function FormPanel({ encoder }: { encoder: QrEncoder }) {
  // Read once on mount; the parent remounts us (via `key`) when values are
  // replaced from outside, e.g. reset or a share link.
  const [initial] = useState(() => selectCurrentValues(useFormStore.getState()));
  const setValues = useFormStore((s) => s.setValues);
  const onValuesChange = useCallback(
    (values: FormValues) => setValues(encoder.id, values),
    [setValues, encoder.id],
  );

  return (
    <DynamicForm
      fields={encoder.fields}
      defaultValues={initial}
      onValuesChange={onValuesChange}
      idPrefix={encoder.id}
    />
  );
}
