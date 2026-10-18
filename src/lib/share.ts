import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

import { sanitizeStyle } from "@/lib/design/sanitize";
import type { DesignStyle } from "@/lib/design/types";
import { getEncoder, isEncoderId } from "@/lib/encoders/registry";
import type { FormValues } from "@/lib/fields/types";
import { sanitizeValues } from "@/lib/fields/values";

export type ShareState = { type: string; values: FormValues; style: DesignStyle };

const HASH_PREFIX = "#s=";
const VERSION = 1;

/**
 * Serialises state into a URL *hash* (`#s=…`). Hashes are never sent to the
 * server, so contact details stay out of hosting logs. Logos are not included.
 */
export function encodeShareHash(state: ShareState): string {
  const payload = JSON.stringify({ v: VERSION, t: state.type, d: state.values, g: state.style });
  return HASH_PREFIX + compressToEncodedURIComponent(payload);
}

export function decodeShareHash(hash: string): ShareState | null {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    const json = decompressFromEncodedURIComponent(hash.slice(HASH_PREFIX.length));
    if (!json) return null;
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { v, t, d, g } = parsed as Record<string, unknown>;
    if (v !== VERSION || !isEncoderId(t)) return null;
    return {
      type: t,
      values: sanitizeValues(getEncoder(t).fields, d),
      style: sanitizeStyle(g),
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(state: ShareState, location: Pick<Location, "origin" | "pathname">) {
  return `${location.origin}${location.pathname}${encodeShareHash(state)}`;
}
