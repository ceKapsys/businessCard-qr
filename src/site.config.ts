import type { CountryCode } from "libphonenumber-js";

/**
 * White-label configuration. Forks can rebrand the whole app by editing
 * only this file.
 */
export const siteConfig = {
  name: "CardQR",
  tagline: "Turn your contact details into a QR code people can scan into their phone.",
  description:
    "Free, open-source vCard QR code generator. Runs entirely in your browser — your data never leaves your device.",
  /** Any CSS colour. Used for buttons, focus rings and highlights. */
  accentColor: "#0f766e",
  /** Path under /public. */
  logo: "/icons/icon.svg",
  githubUrl: "https://github.com/ceKapsys/businessCard-qr",
  /** Absolute production URL, used for SEO/OG tags. */
  siteUrl: "https://businesscard-qr.vercel.app",
  /** ISO 3166-1 alpha-2 country used to parse local phone numbers. */
  defaultCountry: "BD" satisfies CountryCode as CountryCode,
} as const;

export type SiteConfig = typeof siteConfig;
