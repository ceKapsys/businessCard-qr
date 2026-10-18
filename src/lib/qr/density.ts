import qrcode from "qrcode-generator";

import type { ErrorCorrection } from "@/lib/design/types";

import { toUtf8BinaryString, utf8ByteLength } from "./utf8";

export type DensityLevel = "good" | "ok" | "risky" | "tooLong";

export type Density = {
  bytes: number;
  /** QR version 1–40 (null when the payload does not fit at all). */
  version: number | null;
  /** Modules per side, including no quiet zone. */
  modules: number | null;
  level: DensityLevel;
};

/** Versions up to here stay easy to scan from a printed business card. */
const GOOD_MAX_VERSION = 10;
const OK_MAX_VERSION = 15;

/**
 * Estimates how dense the QR will be for `payload` at `ecc`, using the same
 * encoder (qrcode-generator) that qr-code-styling uses under the hood.
 */
export function measureDensity(payload: string, ecc: ErrorCorrection): Density {
  const bytes = utf8ByteLength(payload);
  if (!payload) return { bytes: 0, version: null, modules: null, level: "good" };
  try {
    const qr = qrcode(0, ecc);
    qr.addData(toUtf8BinaryString(payload), "Byte");
    qr.make();
    const modules = qr.getModuleCount();
    const version = (modules - 17) / 4;
    const level: DensityLevel =
      version <= GOOD_MAX_VERSION ? "good" : version <= OK_MAX_VERSION ? "ok" : "risky";
    return { bytes, version, modules, level };
  } catch {
    return { bytes, version: null, modules: null, level: "tooLong" };
  }
}
