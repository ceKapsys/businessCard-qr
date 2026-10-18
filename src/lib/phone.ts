import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

import { siteConfig } from "@/site.config";

/**
 * Normalises a phone number to E.164 (`+8801712345678`). Returns `null` for
 * anything that is not a valid number, so invalid input is never encoded.
 *
 * Accepts national (`01712345678`), international (`+8801712345678`, `00880…`)
 * and international-without-plus (`8801712345678`) forms.
 */
export function normalizePhone(
  input: string,
  country: CountryCode = siteConfig.defaultCountry,
): string | null {
  const raw = input.trim();
  if (!raw) return null;

  const direct = parsePhoneNumberFromString(raw, country);
  if (direct?.isValid()) return direct.number;

  // "8801712345678": international digits typed without the leading "+".
  const digits = raw.replace(/[\s().-]/g, "");
  if (/^\d{8,15}$/.test(digits)) {
    const withPlus = parsePhoneNumberFromString(`+${digits}`);
    if (withPlus?.isValid()) return withPlus.number;
  }
  return null;
}

export function isValidPhone(input: string, country?: CountryCode): boolean {
  return normalizePhone(input, country) !== null;
}

/** E.164 without the "+", as used by wa.me links. */
export function toWhatsAppDigits(e164: string): string {
  return e164.replace(/\D/g, "");
}
