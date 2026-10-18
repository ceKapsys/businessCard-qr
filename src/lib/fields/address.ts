import type { FieldDef } from "./types";
import { address } from "./schemas";

export const ADDRESS_TYPES = ["WORK", "HOME"];

export const addressFields: FieldDef[] = [
  {
    id: "address",
    labelKey: "fields.address.label",
    type: "address",
    group: "address",
    subTypes: ADDRESS_TYPES,
    zod: address(),
  },
];
