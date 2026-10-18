type Rgb = [number, number, number];

export function parseHexColor(input: string): Rgb | null {
  const hex = input.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[\da-f]{6}$/i.test(full)) return null;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** WCAG 2.x relative luminance. */
export function luminance([r, g, b]: Rgb): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio (1–21), or null if a colour can't be parsed. */
export function contrastRatio(a: string, b: string): number | null {
  const ca = parseHexColor(a);
  const cb = parseHexColor(b);
  if (!ca || !cb) return null;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Scanners want dark modules on a light background with strong contrast. */
export const MIN_QR_CONTRAST = 4;

export type ContrastCheck = { ratio: number | null; low: boolean; inverted: boolean };

export function checkQrContrast(foregrounds: string[], background: string): ContrastCheck {
  const bg = parseHexColor(background);
  let worst: number | null = null;
  let inverted = false;
  for (const fg of foregrounds) {
    const ratio = contrastRatio(fg, background);
    const rgb = parseHexColor(fg);
    if (ratio !== null) worst = worst === null ? ratio : Math.min(worst, ratio);
    if (rgb && bg && luminance(rgb) > luminance(bg)) inverted = true;
  }
  return { ratio: worst, low: worst !== null && worst < MIN_QR_CONTRAST, inverted };
}
