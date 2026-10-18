import { DEFAULT_STYLE } from "./presets";
import {
  CORNER_DOT_STYLES,
  CORNER_SQUARE_STYLES,
  DOT_STYLES,
  ERROR_CORRECTION,
  MAX_LOGO_SIZE,
  MAX_MARGIN_PCT,
  MIN_LOGO_SIZE,
  type DesignOptions,
  type DesignStyle,
} from "./types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const HEX = /^#[\da-f]{6}$/i;
const color = (v: unknown, fallback: string) =>
  typeof v === "string" && HEX.test(v) ? v.toLowerCase() : fallback;
const oneOf = <T extends string>(list: readonly T[], v: unknown, fallback: T): T =>
  list.includes(v as T) ? (v as T) : fallback;
const num = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;

/** Coerces untrusted input (storage, share links) into a valid style. */
export function sanitizeStyle(raw: unknown): DesignStyle {
  const d = DEFAULT_STYLE;
  const v = isRecord(raw) ? raw : {};
  const g = isRecord(v.gradient) ? v.gradient : {};
  return {
    fgColor: color(v.fgColor, d.fgColor),
    bgColor: color(v.bgColor, d.bgColor),
    transparentBg: typeof v.transparentBg === "boolean" ? v.transparentBg : d.transparentBg,
    gradient: {
      enabled: typeof g.enabled === "boolean" ? g.enabled : d.gradient.enabled,
      color2: color(g.color2, d.gradient.color2),
      rotation: num(g.rotation, 0, 360, d.gradient.rotation),
    },
    dotStyle: oneOf(DOT_STYLES, v.dotStyle, d.dotStyle),
    cornerSquareStyle: oneOf(CORNER_SQUARE_STYLES, v.cornerSquareStyle, d.cornerSquareStyle),
    cornerDotStyle: oneOf(CORNER_DOT_STYLES, v.cornerDotStyle, d.cornerDotStyle),
    marginPct: num(v.marginPct, 0, MAX_MARGIN_PCT, d.marginPct),
    ecc: oneOf(ERROR_CORRECTION, v.ecc, d.ecc),
    logoSize: num(v.logoSize, MIN_LOGO_SIZE, MAX_LOGO_SIZE, d.logoSize),
  };
}

export function toStyle({ logo: _logo, ...style }: DesignOptions): DesignStyle {
  return style;
}
