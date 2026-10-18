import type { FieldDef, FormValues } from "@/lib/fields/types";

/** A pluggable QR type. Register new ones in `registry.ts`. */
export interface QrEncoder {
  id: string;
  /** i18n key for the type switcher label. */
  labelKey: string;
  descriptionKey: string;
  fields: FieldDef[];
  defaults: FormValues;
  /** Builds the QR payload. Returns "" when there is nothing valid to encode. */
  encode(values: FormValues): string;
  /** Human-friendly base for download filenames (slugified by the caller). */
  fileName(values: FormValues): string;
  /** Offer the payload as a downloadable `.vcf` contact file. */
  vcf?: boolean;
}
