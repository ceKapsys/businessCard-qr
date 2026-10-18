import type { FieldDef } from "./types";
import { optionalText, requiredText } from "./schemas";

export const identityFields: FieldDef[] = [
  {
    id: "firstName",
    labelKey: "fields.firstName.label",
    placeholderKey: "fields.firstName.placeholder",
    type: "text",
    group: "identity",
    required: true,
    zod: requiredText(100),
    autoComplete: "given-name",
  },
  {
    id: "lastName",
    labelKey: "fields.lastName.label",
    placeholderKey: "fields.lastName.placeholder",
    type: "text",
    group: "identity",
    zod: optionalText(100),
    autoComplete: "family-name",
  },
  {
    id: "org",
    labelKey: "fields.org.label",
    placeholderKey: "fields.org.placeholder",
    type: "text",
    group: "identity",
    zod: optionalText(),
    autoComplete: "organization",
  },
  {
    id: "title",
    labelKey: "fields.title.label",
    placeholderKey: "fields.title.placeholder",
    type: "text",
    group: "identity",
    zod: optionalText(),
    autoComplete: "organization-title",
  },
];
