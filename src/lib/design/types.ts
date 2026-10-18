export const DOT_STYLES = [
  "square",
  "dots",
  "rounded",
  "classy",
  "classy-rounded",
  "extra-rounded",
] as const;
export const CORNER_SQUARE_STYLES = ["square", "dot", "extra-rounded"] as const;
export const CORNER_DOT_STYLES = ["square", "dot"] as const;
export const ERROR_CORRECTION = ["L", "M", "Q", "H"] as const;
export const EXPORT_FORMATS = ["png", "jpeg", "svg", "webp"] as const;
export const EXPORT_SIZES = [512, 1024, 2048] as const;

export type DotStyle = (typeof DOT_STYLES)[number];
export type CornerSquareStyle = (typeof CORNER_SQUARE_STYLES)[number];
export type CornerDotStyle = (typeof CORNER_DOT_STYLES)[number];
export type ErrorCorrection = (typeof ERROR_CORRECTION)[number];
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type ExportSize = (typeof EXPORT_SIZES)[number];

export type DesignOptions = {
  fgColor: string;
  bgColor: string;
  /** PNG/SVG/WebP only — JPEG always gets the solid `bgColor`. */
  transparentBg: boolean;
  gradient: { enabled: boolean; color2: string; rotation: number };
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  /** Quiet zone as a percentage of the image size. */
  marginPct: number;
  ecc: ErrorCorrection;
  /** Data URL of a locally-read image; never uploaded. */
  logo: string | null;
  /** Logo width as a fraction of the QR width (capped at 0.2). */
  logoSize: number;
};

/** The part of a design that presets and share links carry (no logo). */
export type DesignStyle = Omit<DesignOptions, "logo">;

export type DesignPreset = { id: string; nameKey?: string; name?: string; style: DesignStyle };

export const MAX_LOGO_SIZE = 0.2;
export const MIN_LOGO_SIZE = 0.1;
export const MAX_MARGIN_PCT = 10;
