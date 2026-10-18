import type { Options } from "qr-code-styling";

import { toUtf8BinaryString } from "@/lib/qr/utf8";

import {
  MAX_LOGO_SIZE,
  type DesignOptions,
  type ErrorCorrection,
  type ExportFormat,
} from "./types";

/** qrcode-generator's error-correction capacity per level. */
const ECC_RECOVERY: Record<ErrorCorrection, number> = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 };

/** A logo needs maximum redundancy to stay scannable. */
export function effectiveEcc(design: DesignOptions): ErrorCorrection {
  return design.logo ? "H" : design.ecc;
}

/**
 * qr-code-styling's `imageSize` is a share of the error-correction budget, not a
 * width. For a square logo the hidden area is about `imageSize * recovery` of
 * the code, so width ≈ sqrt(imageSize * recovery). Invert that to get a logo of
 * `widthFraction` of the QR width.
 */
export function logoImageSize(widthFraction: number, ecc: ErrorCorrection): number {
  const w = Math.min(widthFraction, MAX_LOGO_SIZE);
  return (w * w) / ECC_RECOVERY[ecc];
}

type BuildArgs = {
  payload: string;
  design: DesignOptions;
  size: number;
  format?: ExportFormat;
};

export function buildQrOptions({ payload, design, size, format = "png" }: BuildArgs): Options {
  const ecc = effectiveEcc(design);
  // JPEG has no alpha channel: transparent pixels would turn black.
  const transparent = design.transparentBg && format !== "jpeg";
  const gradient = design.gradient.enabled
    ? {
        type: "linear" as const,
        rotation: (design.gradient.rotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: design.fgColor },
          { offset: 1, color: design.gradient.color2 },
        ],
      }
    : undefined;

  return {
    width: size,
    height: size,
    type: format === "svg" ? "svg" : "canvas",
    data: toUtf8BinaryString(payload),
    margin: Math.round((size * design.marginPct) / 100),
    qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: ecc },
    image: design.logo ?? undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: logoImageSize(design.logoSize, ecc),
      margin: Math.max(2, Math.round(size / 200)),
      saveAsBlob: true,
    },
    dotsOptions: { type: design.dotStyle, color: design.fgColor, gradient },
    cornersSquareOptions: { type: design.cornerSquareStyle, color: design.fgColor, gradient },
    cornersDotOptions: { type: design.cornerDotStyle, color: design.fgColor, gradient },
    backgroundOptions: { color: transparent ? "transparent" : design.bgColor },
  };
}
