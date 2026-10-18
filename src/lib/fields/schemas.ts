import { z } from "zod";

import { isValidPhone } from "@/lib/phone";
import { isValidUrl } from "@/lib/url";

/** Reusable Zod building blocks for field configs. Messages are i18n keys. */

const MAX_TEXT = 200;

export const requiredText = (max = MAX_TEXT) =>
  z.string().trim().min(1, { error: "errors.required" }).max(max, { error: "errors.tooLong" });

export const optionalText = (max = MAX_TEXT) => z.string().max(max, { error: "errors.tooLong" });

export const phone = () =>
  z.string().refine((v) => v.trim() === "" || isValidPhone(v), { error: "errors.invalidPhone" });

export const requiredPhone = () =>
  z
    .string()
    .trim()
    .min(1, { error: "errors.required" })
    .refine((v) => isValidPhone(v), { error: "errors.invalidPhone" });

export const email = () =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || z.email().safeParse(v).success, { error: "errors.invalidEmail" });

export const url = () =>
  z.string().refine((v) => v.trim() === "" || isValidUrl(v), { error: "errors.invalidUrl" });

export const requiredUrl = () =>
  z
    .string()
    .trim()
    .min(1, { error: "errors.required" })
    .refine((v) => isValidUrl(v), { error: "errors.invalidUrl" });

export const toggle = () => z.boolean();

export const address = () =>
  z.object({
    type: z.string(),
    street: optionalText(),
    city: optionalText(100),
    region: optionalText(100),
    postcode: optionalText(20),
    country: optionalText(100),
  });

export const oneOf = (values: readonly [string, ...string[]]) =>
  z.enum(values, { error: "errors.required" });
