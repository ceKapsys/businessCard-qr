/**
 * Escapes a vCard 3.0 text value (RFC 2426 §4): backslash, comma, semicolon
 * and newlines. Backslash must be escaped first.
 */
export function escapeVCardText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** URIs are not text-escaped, but must stay on a single line. */
export function sanitizeVCardUri(value: string): string {
  return value.replace(/[\r\n]+/g, "");
}
