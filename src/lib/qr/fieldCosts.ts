import type { QrEncoder } from "@/lib/encoders/types";
import type { FieldDef, FieldValue, FormValues } from "@/lib/fields/types";
import { emptyAddress } from "@/lib/fields/values";

import { utf8ByteLength } from "./utf8";

export type FieldCost = { fieldId: string; labelKey: string; bytes: number };

function cleared(field: FieldDef): FieldValue | null {
  if (field.repeatable) return [];
  switch (field.type) {
    case "toggle":
      return field.addsContent ? false : null;
    case "address":
      return emptyAddress(field.subTypes?.[0]);
    case "select":
      return null;
    default:
      return "";
  }
}

/**
 * How many bytes each filled-in field adds to the QR payload, largest first.
 * Lets people see exactly what to drop to make a small printed code scannable.
 */
export function measureFieldCosts(encoder: QrEncoder, values: FormValues): FieldCost[] {
  const full = encoder.encode(values);
  if (!full) return [];
  const fullBytes = utf8ByteLength(full);
  const costs: FieldCost[] = [];
  for (const field of encoder.fields) {
    const empty = cleared(field);
    if (empty === null) continue;
    const without = encoder.encode({ ...values, [field.id]: empty });
    // Required fields: removing them leaves nothing to encode, so they're not optional.
    if (!without) continue;
    const bytes = fullBytes - utf8ByteLength(without);
    if (bytes > 0) costs.push({ fieldId: field.id, labelKey: field.labelKey, bytes });
  }
  return costs.sort((a, b) => b.bytes - a.bytes);
}
