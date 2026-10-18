import type { FieldDef } from "./types";
import { url } from "./schemas";

const social = (id: string): FieldDef => ({
  id,
  labelKey: `fields.${id}.label`,
  placeholderKey: `fields.${id}.placeholder`,
  type: "url",
  group: "social",
  zod: url(),
});

/** Each entry needs a matching label in `VCARD_FIELD_MAP` (lib/encoders/vcard.ts). */
export const socialFields: FieldDef[] = [
  social("linkedin"),
  social("facebook"),
  social("instagram"),
  social("x"),
];
