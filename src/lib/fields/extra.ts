import type { FieldDef } from "./types";
import { optionalText } from "./schemas";

export const extraFields: FieldDef[] = [
  {
    id: "note",
    labelKey: "fields.note.label",
    placeholderKey: "fields.note.placeholder",
    descriptionKey: "fields.note.description",
    type: "textarea",
    group: "extra",
    zod: optionalText(500),
  },
];
