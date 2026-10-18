"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { get, useFieldArray, useFormContext, type Control } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { FieldDef, FormValues, RepeatableItem } from "@/lib/fields/types";

import { inputPropsFor } from "./inputProps";

const MAX_ROWS = 5;

type RowsForm = Record<string, RepeatableItem[]>;

export function RepeatableField({ field, idPrefix }: { field: FieldDef; idPrefix: string }) {
  const t = useTranslations();
  const { control, register, formState } = useFormContext<FormValues>();
  const {
    fields: rows,
    append,
    remove,
  } = useFieldArray({
    control: control as unknown as Control<RowsForm>,
    name: field.id,
  });
  const label = t(field.labelKey);
  const subTypes = field.subTypes ?? [];

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      {rows.map((row, index) => {
        const inputId = `${idPrefix}-${field.id}-${index}`;
        const errorKey: string | undefined = get(
          formState.errors,
          `${field.id}.${index}.value`,
        )?.message;
        const errId = `${inputId}-err`;
        return (
          <div key={row.id} className="grid gap-1">
            <div className="flex gap-2">
              {subTypes.length > 0 && (
                <div className="w-28 shrink-0">
                  <NativeSelect
                    aria-label={`${label} ${index + 1}: ${t("form.type")}`}
                    {...register(`${field.id}.${index}.type`)}
                  >
                    {subTypes.map((st) => (
                      <option key={st} value={st}>
                        {t(`subTypes.${st}`)}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              )}
              <Input
                id={inputId}
                aria-label={`${label} ${index + 1}`}
                aria-invalid={Boolean(errorKey)}
                aria-describedby={errorKey ? errId : undefined}
                placeholder={field.placeholderKey ? t(field.placeholderKey) : undefined}
                {...inputPropsFor(field)}
                {...register(`${field.id}.${index}.value`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={t("form.removeRow", { label, index: index + 1 })}
                disabled={rows.length === 1}
                onClick={() => remove(index)}
              >
                <Trash2Icon aria-hidden="true" />
              </Button>
            </div>
            {errorKey && (
              <p id={errId} className="text-destructive text-xs font-medium">
                {t(errorKey)}
              </p>
            )}
          </div>
        );
      })}
      {rows.length < MAX_ROWS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => append({ type: subTypes[0] ?? "", value: "" })}
        >
          <PlusIcon aria-hidden="true" />
          {t(`fields.${field.id}.add`)}
        </Button>
      )}
    </fieldset>
  );
}
