import bn from "./bn.json";
import en from "./en.json";

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_NAMES: Record<Locale, string> = { en: "English", bn: "বাংলা" };

export type Messages = typeof en;

/** Both locales are bundled: the app is static and works offline. */
export const MESSAGES: Record<Locale, Messages> = { en, bn };

export function isLocale(v: unknown): v is Locale {
  return LOCALES.includes(v as Locale);
}
