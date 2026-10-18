import type { HTMLInputTypeAttribute, HTMLAttributes } from "react";

import type { FieldDef } from "@/lib/fields/types";

type InputHints = {
  type: HTMLInputTypeAttribute;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

/** Mobile-friendly keyboard and autofill hints per field type. */
export function inputPropsFor(field: FieldDef): InputHints {
  const autoComplete = field.autoComplete;
  switch (field.type) {
    case "tel":
      return { type: "tel", inputMode: "tel", autoComplete };
    case "email":
      return { type: "email", inputMode: "email", autoComplete };
    case "url":
      // type="text" so "example.com" (no scheme) is accepted; we normalise it.
      return { type: "text", inputMode: "url", autoComplete };
    default:
      return { type: "text", autoComplete };
  }
}
