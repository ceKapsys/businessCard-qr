import type QRCodeStyling from "qr-code-styling";

import { buildQrOptions } from "@/lib/design/qrOptions";
import type { DesignOptions, ExportFormat } from "@/lib/design/types";

type QRCodeStylingCtor = typeof QRCodeStyling;

let ctor: Promise<QRCodeStylingCtor> | null = null;

/** qr-code-styling touches `window` on import, so load it lazily in the browser. */
export function loadQrCodeStyling(): Promise<QRCodeStylingCtor> {
  ctor ??= import("qr-code-styling").then((m) => m.default);
  return ctor;
}

type RenderArgs = { payload: string; design: DesignOptions; size: number; format: ExportFormat };

export async function renderQrBlob(args: RenderArgs): Promise<Blob> {
  const QR = await loadQrCodeStyling();
  const qr = new QR(buildQrOptions(args));
  const data = await qr.getRawData(args.format);
  if (!(data instanceof Blob)) throw new Error("QR rendering failed");
  return data;
}
