import { oneOf, optionalText, requiredText, toggle } from "@/lib/fields/schemas";
import type { FieldDef, FormValues } from "@/lib/fields/types";
import { buildDefaults, getBool, getString } from "@/lib/fields/values";

import type { QrEncoder } from "./types";

export const WIFI_SECURITY = ["WPA", "WEP", "nopass"] as const;

const fields: FieldDef[] = [
  {
    id: "ssid",
    labelKey: "fields.ssid.label",
    placeholderKey: "fields.ssid.placeholder",
    type: "text",
    group: "contact",
    required: true,
    zod: requiredText(32),
  },
  {
    id: "security",
    labelKey: "fields.security.label",
    type: "select",
    group: "contact",
    zod: oneOf(WIFI_SECURITY),
    options: WIFI_SECURITY.map((value) => ({
      value,
      labelKey: `fields.security.options.${value}`,
    })),
  },
  {
    id: "password",
    labelKey: "fields.password.label",
    type: "text",
    group: "contact",
    zod: optionalText(63),
    visibleWhen: (values) => values.security !== "nopass",
    autoComplete: "off",
  },
  {
    id: "hidden",
    labelKey: "fields.hidden.label",
    type: "toggle",
    group: "extra",
    zod: toggle(),
  },
];

/** Escapes `\ ; , : "` as required by the Wi-Fi QR format. */
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

/** `WIFI:T:<WPA|WEP|nopass>;S:<ssid>;P:<password>;H:<true|false>;;` */
export function encodeWifi(values: FormValues): string {
  const ssid = getString(values, "ssid");
  if (!ssid) return "";
  const raw = getString(values, "security");
  const security = (WIFI_SECURITY as readonly string[]).includes(raw) ? raw : "WPA";
  // Passwords are used verbatim (no trimming): spaces can be significant.
  const password = typeof values.password === "string" ? values.password : "";
  const parts = [`T:${security}`, `S:${escapeWifi(ssid)}`];
  if (security !== "nopass") parts.push(`P:${escapeWifi(password)}`);
  parts.push(`H:${getBool(values, "hidden") ? "true" : "false"}`);
  return `WIFI:${parts.join(";")};;`;
}

export const wifiEncoder: QrEncoder = {
  id: "wifi",
  labelKey: "encoders.wifi.label",
  descriptionKey: "encoders.wifi.description",
  fields,
  defaults: buildDefaults(fields),
  encode: encodeWifi,
  fileName: (values) => `wifi-${getString(values, "ssid")}`,
};
