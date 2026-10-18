import qrcode from "qrcode-generator";

import type { ErrorCorrection } from "@/lib/design/types";

import { toUtf8BinaryString, utf8ByteLength } from "./utf8";

export type DensityLevel = "good" | "ok" | "risky" | "tooLong";

export type Density = {
  bytes: number;
  /** QR version 1–40 (null when the payload does not fit at all). */
  version: number | null;
  /** Modules per side, excluding the quiet zone. */
  modules: number | null;
  /** Printed width of one module in mm at `printMm`. */
  moduleMm: number | null;
  /** Smallest printed size (mm) at which modules reach `GOOD_MODULE_MM`. */
  minPrintMm: number | null;
  level: DensityLevel;
};

/** Typical business-card QR: 25 × 25 mm. */
export const DEFAULT_PRINT_MM = 25;
export const MIN_PRINT_MM = 10;
export const MAX_PRINT_MM = 100;

/**
 * Phone cameras need each module (one QR "pixel") to be big enough to resolve
 * at normal scanning distance. ~0.45 mm scans instantly on most phones; below
 * ~0.38 mm budget Androids and printed cards start to struggle.
 */
export const GOOD_MODULE_MM = 0.45;
export const OK_MODULE_MM = 0.38;

type PrintArgs = { printMm: number; marginPct: number };

/** QR version (1–40) and module count for `payload`, or null if it can't fit. */
export function qrSize(payload: string, ecc: ErrorCorrection) {
  try {
    const qr = qrcode(0, ecc);
    qr.addData(toUtf8BinaryString(payload), "Byte");
    qr.make();
    const modules = qr.getModuleCount();
    return { modules, version: (modules - 17) / 4 };
  } catch {
    return null;
  }
}

/**
 * Rates how easy the QR will be to scan when printed at `printMm`, using the
 * same encoder (qrcode-generator) that qr-code-styling uses under the hood.
 */
export function measureDensity(
  payload: string,
  ecc: ErrorCorrection,
  { printMm, marginPct }: PrintArgs = { printMm: DEFAULT_PRINT_MM, marginPct: 4 },
): Density {
  const bytes = utf8ByteLength(payload);
  const empty = { bytes, version: null, modules: null, moduleMm: null, minPrintMm: null };
  if (!payload) return { ...empty, level: "good" };
  const size = qrSize(payload, ecc);
  if (!size) return { ...empty, level: "tooLong" };

  // The quiet zone (margin) is part of the printed square.
  const codeShare = 1 - (2 * marginPct) / 100;
  const moduleMm = (printMm * codeShare) / size.modules;
  const minPrintMm = Math.ceil((size.modules * GOOD_MODULE_MM) / codeShare);
  const level: DensityLevel =
    moduleMm >= GOOD_MODULE_MM ? "good" : moduleMm >= OK_MODULE_MM ? "ok" : "risky";
  return { bytes, ...size, moduleMm, minPrintMm, level };
}
