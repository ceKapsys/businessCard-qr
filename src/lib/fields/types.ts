import type { ZodType } from "zod";

export type FieldType =
  "text" | "tel" | "email" | "url" | "textarea" | "select" | "address" | "toggle";

export type FieldGroup = "identity" | "contact" | "social" | "address" | "extra";

/** One row of a repeatable field, e.g. a phone number and its type. */
export type RepeatableItem = { type: string; value: string };

export type AddressValue = {
  type: string;
  street: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
};

export type FieldValue = string | boolean | RepeatableItem[] | AddressValue;

/** Form data for one QR type, keyed by `FieldDef.id`. */
export type FormValues = Record<string, FieldValue>;

export type SelectOption = { value: string; labelKey: string };

/**
 * Declarative description of a form field. `<DynamicForm>` renders any list of
 * these; nothing about individual fields is hand-coded in JSX.
 */
export type FieldDef = {
  id: string;
  /** i18n key for the visible label. */
  labelKey: string;
  type: FieldType;
  group: FieldGroup;
  /** Renders add/remove rows; the value becomes `RepeatableItem[]`. */
  repeatable?: boolean;
  /** Sub-type choices for repeatable rows and addresses, e.g. `["CELL", "WORK"]`. */
  subTypes?: string[];
  required?: boolean;
  /**
   * Validates the field's scalar value. For repeatable fields it validates
   * each row's `value`; for addresses the whole `AddressValue`.
   * Error messages are i18n keys (e.g. `"errors.invalidPhone"`).
   */
  zod: ZodType;
  placeholderKey?: string;
  /** Optional helper text under the input. */
  descriptionKey?: string;
  /** Choices for `type: "select"`. */
  options?: SelectOption[];
  /** Initial value; otherwise derived from `type`. */
  defaultValue?: FieldValue;
  /** Hide (and skip validating) the field unless this returns true. */
  visibleWhen?: (values: FormValues) => boolean;
  autoComplete?: string;
};
