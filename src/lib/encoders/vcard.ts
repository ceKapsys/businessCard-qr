import { vcardFields } from "@/lib/fields";
import type { FormValues } from "@/lib/fields/types";
import { buildDefaults, getAddress, getBool, getRows, getString } from "@/lib/fields/values";
import { normalizePhone, toWhatsAppDigits } from "@/lib/phone";
import { normalizeUrl } from "@/lib/url";
import { escapeVCardText, sanitizeVCardUri } from "@/lib/vcard/escape";

import type { QrEncoder } from "./types";

/**
 * How simple one-value fields map onto vCard properties. Name, phones,
 * emails, WhatsApp and address need custom logic and are handled below.
 *
 * - `text`: escaped text property, with CHARSET=UTF-8 when non-ASCII (e.g. ORG, NOTE)
 * - `uri`:  URL-valued property (e.g. URL)
 * - `item`: labelled link, emitted as `itemN.URL` + `itemN.X-ABLabel`
 */
export type VCardMapping =
  | { kind: "text"; property: string }
  | { kind: "uri"; property: string }
  | { kind: "item"; label: string };

export const VCARD_FIELD_MAP: Record<string, VCardMapping> = {
  org: { kind: "text", property: "ORG" },
  title: { kind: "text", property: "TITLE" },
  website: { kind: "uri", property: "URL" },
  note: { kind: "text", property: "NOTE" },
  linkedin: { kind: "item", label: "LinkedIn" },
  facebook: { kind: "item", label: "Facebook" },
  instagram: { kind: "item", label: "Instagram" },
  x: { kind: "item", label: "X" },
};

/** Output order of properties; anything unlisted goes before the items. */
const PROPERTY_ORDER = ["N", "FN", "ORG", "TITLE", "TEL", "EMAIL", "URL", "ADR", "NOTE"];

type Line = { property: string; text: string };

const CRLF = "\r\n";
const UTF8 = "CHARSET=UTF-8";

/**
 * CHARSET=UTF-8 only where a value actually contains non-ASCII text (e.g.
 * Bangla). vCard 3.0 readers default to UTF-8 anyway, and skipping the
 * parameter on plain-ASCII lines saves ~14 bytes each — real QR density at
 * business-card sizes.
 */
function charset(...values: string[]): string[] {
  const nonAscii = (v: string) => [...v].some((c) => c.charCodeAt(0) > 127);
  return values.some(nonAscii) ? [UTF8] : [];
}

export function displayName(values: FormValues): string {
  const name = [getString(values, "firstName"), getString(values, "lastName")]
    .filter(Boolean)
    .join(" ");
  return name || getString(values, "org");
}

/** The number to use for WhatsApp, as E.164, or null. */
export function whatsappNumber(values: FormValues): string | null {
  if (getBool(values, "whatsappSameAsMobile")) {
    const phones = getRows(values, "phones")
      .map((r) => ({ type: r.type, e164: normalizePhone(r.value) }))
      .filter((p) => p.e164 !== null);
    const mobile = phones.find((p) => p.type === "CELL") ?? phones[0];
    return mobile?.e164 ?? null;
  }
  return normalizePhone(getString(values, "whatsapp"));
}

export function encodeVCard(values: FormValues): string {
  const lines: Line[] = [];
  const items: string[][] = [];
  const add = (property: string, params: string[], value: string) => {
    const head = [property, ...params].join(";");
    lines.push({ property, text: `${head}:${value}` });
  };

  const first = getString(values, "firstName");
  const last = getString(values, "lastName");
  const fn = displayName(values);
  if (!fn) return "";

  add("N", charset(last, first), [last, first, "", "", ""].map(escapeVCardText).join(";"));
  add("FN", charset(fn), escapeVCardText(fn));

  // Phones: normalised to E.164; invalid numbers are dropped.
  const cellNumbers = new Set<string>();
  for (const row of getRows(values, "phones")) {
    const e164 = normalizePhone(row.value);
    if (!e164) continue;
    if (row.type === "CELL") cellNumbers.add(e164);
    add("TEL", [`TYPE=${row.type || "CELL"}`], e164);
  }

  for (const row of getRows(values, "emails")) {
    const email = row.value.trim();
    if (!email.includes("@")) continue;
    add("EMAIL", [`TYPE=${row.type || "WORK"}`], sanitizeVCardUri(email));
  }

  // WhatsApp finds people through the phonebook, so the number must also be a
  // mobile TEL. The optional wa.me item adds a tappable "WhatsApp" link (~70 bytes).
  const wa = whatsappNumber(values);
  if (wa) {
    if (!cellNumbers.has(wa)) add("TEL", ["TYPE=CELL"], wa);
    if (values.whatsappLink !== false) {
      items.push([`URL:https://wa.me/${toWhatsAppDigits(wa)}`, "X-ABLabel:WhatsApp"]);
    }
  }

  for (const [id, mapping] of Object.entries(VCARD_FIELD_MAP)) {
    const raw = getString(values, id);
    if (!raw) continue;
    if (mapping.kind === "text") {
      add(mapping.property, charset(raw), escapeVCardText(raw));
    } else {
      const href = normalizeUrl(raw);
      if (!href) continue;
      if (mapping.kind === "uri") add(mapping.property, [], sanitizeVCardUri(href));
      else items.push([`URL:${sanitizeVCardUri(href)}`, `X-ABLabel:${mapping.label}`]);
    }
  }

  const adr = getAddress(values, "address");
  if (adr) {
    const parts = [adr.street, adr.city, adr.region, adr.postcode, adr.country].map((p) =>
      p.trim(),
    );
    if (parts.some(Boolean)) {
      add(
        "ADR",
        [...charset(...parts), `TYPE=${adr.type || "WORK"}`],
        ["", "", ...parts].map(escapeVCardText).join(";"),
      );
    }
  }

  const rank = (p: string) => {
    const i = PROPERTY_ORDER.indexOf(p);
    return i === -1 ? PROPERTY_ORDER.length : i;
  };
  const body = [...lines].sort((a, b) => rank(a.property) - rank(b.property)).map((l) => l.text);
  const itemLines = items.flatMap((item, i) => item.map((part) => `item${i + 1}.${part}`));

  return ["BEGIN:VCARD", "VERSION:3.0", ...body, ...itemLines, "END:VCARD"].join(CRLF);
}

export const vcardEncoder: QrEncoder = {
  id: "vcard",
  labelKey: "encoders.vcard.label",
  descriptionKey: "encoders.vcard.description",
  fields: vcardFields,
  defaults: buildDefaults(vcardFields),
  encode: encodeVCard,
  fileName: displayName,
  vcf: true,
};
