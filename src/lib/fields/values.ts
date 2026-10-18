import type { AddressValue, FieldDef, FieldValue, FormValues, RepeatableItem } from "./types";

export const emptyAddress = (type = "WORK"): AddressValue => ({
  type,
  street: "",
  city: "",
  region: "",
  postcode: "",
  country: "",
});

export function defaultValueFor(field: FieldDef): FieldValue {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.repeatable) return [{ type: field.subTypes?.[0] ?? "", value: "" }];
  switch (field.type) {
    case "toggle":
      return false;
    case "address":
      return emptyAddress(field.subTypes?.[0]);
    case "select":
      return field.options?.[0]?.value ?? "";
    default:
      return "";
  }
}

export function buildDefaults(fields: FieldDef[]): FormValues {
  return Object.fromEntries(fields.map((f) => [f.id, defaultValueFor(f)]));
}

export function isVisible(field: FieldDef, values: FormValues): boolean {
  return field.visibleWhen ? field.visibleWhen(values) : true;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown, fallback = ""): string => (typeof v === "string" ? v : fallback);

/**
 * Coerces untrusted data (localStorage, a share link) into well-formed values
 * for `fields`. Unknown keys are dropped; wrong shapes fall back to defaults.
 */
export function sanitizeValues(fields: FieldDef[], raw: unknown): FormValues {
  const input = isRecord(raw) ? raw : {};
  const out: FormValues = {};
  for (const field of fields) {
    const value = input[field.id];
    const fallback = defaultValueFor(field);
    if (field.repeatable) {
      const subTypes = field.subTypes ?? [];
      const rows = Array.isArray(value)
        ? value.filter(isRecord).map((row): RepeatableItem => ({
            type: subTypes.includes(str(row.type)) ? str(row.type) : (subTypes[0] ?? ""),
            value: str(row.value),
          }))
        : [];
      out[field.id] = rows.length > 0 ? rows.slice(0, 10) : fallback;
    } else if (field.type === "toggle") {
      out[field.id] = typeof value === "boolean" ? value : fallback;
    } else if (field.type === "address") {
      const base = fallback as AddressValue;
      const v = isRecord(value) ? value : {};
      out[field.id] = {
        type: field.subTypes?.includes(str(v.type)) ? str(v.type) : base.type,
        street: str(v.street),
        city: str(v.city),
        region: str(v.region),
        postcode: str(v.postcode),
        country: str(v.country),
      };
    } else if (field.type === "select") {
      const allowed = field.options?.map((o) => o.value) ?? [];
      out[field.id] = allowed.includes(str(value)) ? str(value) : fallback;
    } else {
      out[field.id] = str(value, typeof fallback === "string" ? fallback : "");
    }
  }
  return out;
}

/* Typed accessors used by encoders. */

export function getString(values: FormValues, id: string): string {
  const v = values[id];
  return typeof v === "string" ? v.trim() : "";
}

export function getBool(values: FormValues, id: string): boolean {
  return values[id] === true;
}

export function getRows(values: FormValues, id: string): RepeatableItem[] {
  const v = values[id];
  return Array.isArray(v) ? v.filter((r) => r.value.trim() !== "") : [];
}

export function getAddress(values: FormValues, id: string): AddressValue | null {
  const v = values[id];
  return isRecord(v) && !Array.isArray(v) ? (v as AddressValue) : null;
}
