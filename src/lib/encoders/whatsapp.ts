import { optionalText, requiredPhone } from "@/lib/fields/schemas";
import type { FieldDef, FormValues } from "@/lib/fields/types";
import { buildDefaults, getString } from "@/lib/fields/values";
import { normalizePhone, toWhatsAppDigits } from "@/lib/phone";

import type { QrEncoder } from "./types";

const fields: FieldDef[] = [
  {
    id: "phone",
    labelKey: "fields.whatsapp.label",
    placeholderKey: "fields.whatsapp.placeholder",
    type: "tel",
    group: "contact",
    required: true,
    zod: requiredPhone(),
    autoComplete: "tel",
  },
  {
    id: "message",
    labelKey: "fields.message.label",
    placeholderKey: "fields.message.placeholder",
    type: "textarea",
    group: "extra",
    zod: optionalText(500),
  },
];

/** `https://wa.me/<E.164 digits>?text=<urlencoded message>` */
export function encodeWhatsApp(values: FormValues): string {
  const e164 = normalizePhone(getString(values, "phone"));
  if (!e164) return "";
  const message = getString(values, "message");
  const base = `https://wa.me/${toWhatsAppDigits(e164)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const whatsappEncoder: QrEncoder = {
  id: "whatsapp",
  labelKey: "encoders.whatsapp.label",
  descriptionKey: "encoders.whatsapp.description",
  fields,
  defaults: buildDefaults(fields),
  encode: encodeWhatsApp,
  fileName: (values) => `whatsapp-${getString(values, "phone").replace(/\D/g, "")}`,
};
