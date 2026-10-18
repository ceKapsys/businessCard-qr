import { addressFields } from "./address";
import { contactFields } from "./contact";
import { extraFields } from "./extra";
import { identityFields } from "./identity";
import { socialFields } from "./social";
import type { FieldDef, FieldGroup } from "./types";

export * from "./types";

/** All vCard fields, in display order. */
export const vcardFields: FieldDef[] = [
  ...identityFields,
  ...contactFields,
  ...socialFields,
  ...addressFields,
  ...extraFields,
];

export const GROUP_ORDER: FieldGroup[] = ["identity", "contact", "social", "address", "extra"];
