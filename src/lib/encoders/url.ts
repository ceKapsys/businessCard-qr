import { requiredUrl } from "@/lib/fields/schemas";
import type { FieldDef, FormValues } from "@/lib/fields/types";
import { buildDefaults, getString } from "@/lib/fields/values";
import { normalizeUrl } from "@/lib/url";

import type { QrEncoder } from "./types";

const fields: FieldDef[] = [
  {
    id: "url",
    labelKey: "fields.url.label",
    placeholderKey: "fields.url.placeholder",
    type: "url",
    group: "contact",
    required: true,
    zod: requiredUrl(),
    autoComplete: "url",
  },
];

export function encodeUrl(values: FormValues): string {
  return normalizeUrl(getString(values, "url")) ?? "";
}

export const urlEncoder: QrEncoder = {
  id: "url",
  labelKey: "encoders.url.label",
  descriptionKey: "encoders.url.description",
  fields,
  defaults: buildDefaults(fields),
  encode: encodeUrl,
  fileName: (values) => {
    const href = normalizeUrl(getString(values, "url"));
    return href ? new URL(href).hostname : "link";
  },
};
