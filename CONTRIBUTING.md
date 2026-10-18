# Contributing to CardQR

Thanks for helping! Bug reports, translations, new fields and new QR types are all welcome.

## Ground rules

- **Privacy first.** No backend, API routes, database, analytics or runtime network calls. Data
  must never leave the user’s device.
- **The site must stay static.** `next build` produces a static export (`output: "export"`).
- **Strict TypeScript.** No `any`. Keep components small and pure where you can.
- **Keep dependencies minimal.** Explain why in your PR if you add one.
- **Every user-facing string goes through i18n** (`src/i18n/en.json` and `bn.json`). A test checks
  that both files have the same keys. If you don’t speak Bangla, copy the English text into
  `bn.json` and mention it in the PR so a native speaker can translate it.

## Development

```bash
pnpm install
pnpm dev
```

Before opening a PR, run what CI runs:

```bash
pnpm lint && pnpm typecheck && pnpm format:check && pnpm test && pnpm build
```

## How the form works

Form fields are **data, not JSX**. Each field is a `FieldDef`
([`src/lib/fields/types.ts`](src/lib/fields/types.ts)):

```ts
type FieldDef = {
  id: string; // key in the form values
  labelKey: string; // i18n key
  type: "text" | "tel" | "email" | "url" | "textarea" | "select" | "address" | "toggle";
  group: "identity" | "contact" | "social" | "address" | "extra";
  repeatable?: boolean; // add/remove rows, value becomes { type, value }[]
  subTypes?: string[]; // e.g. ["CELL", "WORK", "HOME"]
  required?: boolean;
  zod: ZodType; // validates the value (each row's value if repeatable)
  placeholderKey?: string;
  descriptionKey?: string;
  options?: { value: string; labelKey: string }[]; // for "select"
  defaultValue?: FieldValue;
  visibleWhen?: (values) => boolean; // hidden fields are not validated
  autoComplete?: string;
};
```

`<DynamicForm>` renders any list of these, grouped by `group`. Reusable Zod building blocks
(`phone()`, `email()`, `url()`, `requiredText()`, …) live in
[`src/lib/fields/schemas.ts`](src/lib/fields/schemas.ts). Their error messages are i18n keys.

## Adding a field (example: Telegram)

Two steps: add a config entry, then map it in the encoder.

**1. Add the field config** in [`src/lib/fields/social.ts`](src/lib/fields/social.ts):

```ts
export const socialFields: FieldDef[] = [
  social("linkedin"),
  social("facebook"),
  social("instagram"),
  social("x"),
  social("telegram"), // ← new
];
```

`social(id)` is a small helper that creates a `type: "url"` field in the `social` group, using the
`fields.<id>.label` and `fields.<id>.placeholder` i18n keys. Any other field is just an object
literal; see `identity.ts` or `contact.ts`.

**2. Map it to vCard** in [`src/lib/encoders/vcard.ts`](src/lib/encoders/vcard.ts):

```ts
export const VCARD_FIELD_MAP: Record<string, VCardMapping> = {
  // …
  telegram: { kind: "item", label: "Telegram" }, // → itemN.URL + itemN.X-ABLabel:Telegram
};
```

The mapping kinds are:

| kind   | output                                                       | use for                    |
| ------ | ------------------------------------------------------------ | -------------------------- |
| `text` | `PROPERTY:<escaped value>` (+ `;CHARSET=UTF-8` if non-ASCII) | ORG, TITLE, NOTE, NICKNAME |
| `uri`  | `PROPERTY:<normalised URL>`                                  | URL                        |
| `item` | `itemN.URL:<url>` + `itemN.X-ABLabel:<label>`                | social profiles, links     |

**3. Add the strings** to `src/i18n/en.json` and `bn.json`:

```json
"telegram": { "label": "Telegram", "placeholder": "t.me/yourname" }
```

**4. Add a test** in `tests/vcard.test.ts`. That’s it: the form, validation, share links and
drafts all pick the new field up automatically.

Fields that need custom logic (the name, phones, emails, WhatsApp, address) are handled explicitly
in `encodeVCard`.

## Adding a QR type (example: SMS)

A QR type is an object that implements `QrEncoder`
([`src/lib/encoders/types.ts`](src/lib/encoders/types.ts)):

```ts
interface QrEncoder {
  id: string;
  labelKey: string;
  descriptionKey: string;
  fields: FieldDef[];
  defaults: FormValues;
  encode(values: FormValues): string; // "" when there is nothing valid to encode
  fileName(values: FormValues): string; // base for download file names
  vcf?: boolean; // offer a .vcf download
}
```

**1. Create `src/lib/encoders/sms.ts`:**

```ts
import { optionalText, requiredPhone } from "@/lib/fields/schemas";
import type { FieldDef, FormValues } from "@/lib/fields/types";
import { buildDefaults, getString } from "@/lib/fields/values";
import { normalizePhone } from "@/lib/phone";

import type { QrEncoder } from "./types";

const fields: FieldDef[] = [
  {
    id: "phone",
    labelKey: "fields.smsPhone.label",
    type: "tel",
    group: "contact",
    required: true,
    zod: requiredPhone(),
  },
  {
    id: "body",
    labelKey: "fields.smsBody.label",
    type: "textarea",
    group: "extra",
    zod: optionalText(300),
  },
];

export function encodeSms(values: FormValues): string {
  const phone = normalizePhone(getString(values, "phone"));
  if (!phone) return "";
  return `SMSTO:${phone}:${getString(values, "body")}`;
}

export const smsEncoder: QrEncoder = {
  id: "sms",
  labelKey: "encoders.sms.label",
  descriptionKey: "encoders.sms.description",
  fields,
  defaults: buildDefaults(fields),
  encode: encodeSms,
  fileName: (values) => `sms-${getString(values, "phone")}`,
};
```

**2. Register it** in [`src/lib/encoders/registry.ts`](src/lib/encoders/registry.ts):

```ts
export const encoders: QrEncoder[] = [
  vcardEncoder,
  whatsappEncoder,
  urlEncoder,
  wifiEncoder,
  smsEncoder,
];
```

**3. Add the strings** (`encoders.sms.*`, `fields.smsPhone.label`, `fields.smsBody.label`) to both
message files, and **4. add tests** for `encodeSms`.

The type switcher, form, preview, export, density meter, drafts and share links work without any
other changes.

## Adding a design preset

Add an entry to `BUILT_IN_PRESETS` in [`src/lib/design/presets.ts`](src/lib/design/presets.ts) and
a `design.presets.<id>` string to both message files.

## Translations

UI strings live in `src/i18n/<locale>.json`. To add a language, add the JSON file, then add it to
`LOCALES`, `LOCALE_NAMES` and `MESSAGES` in [`src/i18n/config.ts`](src/i18n/config.ts).

## Commits and PRs

- Keep PRs focused, and include tests for behaviour changes.
- For changes to what goes into the QR code, scan the result with at least one real phone and say
  which one in the PR.
