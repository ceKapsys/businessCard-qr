/**
 * Turns user input like `example.com` or `https://example.com` into an
 * absolute http(s) URL. Returns `null` when the input is not a usable URL.
 */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw || /\s/.test(raw)) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    const href = url.toString();
    // Drop the bare trailing slash URL() adds to "https://host" — saves QR bytes.
    return url.pathname === "/" && !url.search && !url.hash ? href.slice(0, -1) : href;
  } catch {
    return null;
  }
}

export function isValidUrl(input: string): boolean {
  return normalizeUrl(input) !== null;
}
