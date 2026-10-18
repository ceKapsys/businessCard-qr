/**
 * qr-code-styling (via qrcode-generator) turns strings into bytes with
 * `charCodeAt(i) & 0xff`, which corrupts any non-Latin-1 text (e.g. Bangla).
 * We hand it a "binary string" instead: one char per UTF-8 byte, so the QR
 * contains correct UTF-8 that phones decode properly.
 */
export function toUtf8BinaryString(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let out = "";
  for (const byte of bytes) out += String.fromCharCode(byte);
  return out;
}

export function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}
