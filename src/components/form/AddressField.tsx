"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { FieldDef, FormValues } from "@/lib/fields/types";
import { cn } from "@/lib/utils";

const PARTS = [
  { key: "street", autoComplete: "street-address", wide: true },
  { key: "city", autoComplete: "address-level2", wide: false },
  { key: "region", autoComplete: "address-level1", wide: false },
  { key: "postcode", autoComplete: "postal-code", wide: false },
  { key: "country", autoComplete: "country-name", wide: false },
] as const;

export function AddressField({ field, idPrefix }: { field: FieldDef; idPrefix: string }) {
  const t = useTranslations();
  const { register } = useFormContext<FormValues>();
  const base = `${idPrefix}-${field.id}`;

  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">{t(field.labelKey)}</legend>
      {field.subTypes && field.subTypes.length > 0 && (
        <div className="grid gap-1.5 sm:col-span-2 sm:max-w-40">
          <Label htmlFor={`${base}-type`}>{t("form.type")}</Label>
          <NativeSelect id={`${base}-type`} {...register(`${field.id}.type`)}>
            {field.subTypes.map((st) => (
              <option key={st} value={st}>
                {t(`subTypes.${st}`)}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
      {PARTS.map((part) => (
        <div key={part.key} className={cn("grid gap-1.5", part.wide && "sm:col-span-2")}>
          <Label htmlFor={`${base}-${part.key}`}>{t(`fields.${field.id}.${part.key}`)}</Label>
          <Input
            id={`${base}-${part.key}`}
            autoComplete={part.autoComplete}
            {...register(`${field.id}.${part.key}`)}
          />
        </div>
      ))}
    </fieldset>
  );
}
