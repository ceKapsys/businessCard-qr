import type { QrEncoder } from "./types";
import { urlEncoder } from "./url";
import { vcardEncoder } from "./vcard";
import { whatsappEncoder } from "./whatsapp";
import { wifiEncoder } from "./wifi";

export type { QrEncoder } from "./types";

/** Order here is the order of the type switcher. The first entry is the default. */
export const encoders: QrEncoder[] = [vcardEncoder, whatsappEncoder, urlEncoder, wifiEncoder];

export const DEFAULT_ENCODER_ID = encoders[0].id;

export function getEncoder(id: string): QrEncoder {
  return encoders.find((e) => e.id === id) ?? encoders[0];
}

export function isEncoderId(id: unknown): id is string {
  return typeof id === "string" && encoders.some((e) => e.id === id);
}
