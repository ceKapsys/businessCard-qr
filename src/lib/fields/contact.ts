import type { FieldDef } from "./types";
import { email, phone, toggle, url } from "./schemas";

export const PHONE_TYPES = ["CELL", "WORK", "HOME"];
export const EMAIL_TYPES = ["WORK", "HOME"];

export const contactFields: FieldDef[] = [
  {
    id: "phones",
    labelKey: "fields.phones.label",
    placeholderKey: "fields.phones.placeholder",
    type: "tel",
    group: "contact",
    repeatable: true,
    subTypes: PHONE_TYPES,
    zod: phone(),
    autoComplete: "tel",
  },
  {
    id: "emails",
    labelKey: "fields.emails.label",
    placeholderKey: "fields.emails.placeholder",
    type: "email",
    group: "contact",
    repeatable: true,
    subTypes: EMAIL_TYPES,
    zod: email(),
    autoComplete: "email",
  },
  {
    id: "website",
    labelKey: "fields.website.label",
    placeholderKey: "fields.website.placeholder",
    type: "url",
    group: "contact",
    zod: url(),
    autoComplete: "url",
  },
  {
    id: "whatsappSameAsMobile",
    labelKey: "fields.whatsappSameAsMobile.label",
    descriptionKey: "fields.whatsappSameAsMobile.description",
    type: "toggle",
    group: "contact",
    zod: toggle(),
    defaultValue: true,
  },
  {
    id: "whatsapp",
    labelKey: "fields.whatsapp.label",
    placeholderKey: "fields.whatsapp.placeholder",
    descriptionKey: "fields.whatsapp.description",
    type: "tel",
    group: "contact",
    zod: phone(),
    visibleWhen: (values) => values.whatsappSameAsMobile === false,
    autoComplete: "tel",
  },
  {
    id: "whatsappLink",
    labelKey: "fields.whatsappLink.label",
    descriptionKey: "fields.whatsappLink.description",
    type: "toggle",
    group: "contact",
    zod: toggle(),
    defaultValue: true,
    addsContent: true,
  },
];
