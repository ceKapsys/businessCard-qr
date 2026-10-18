"use client";

import { useTranslations } from "next-intl";
import { Controller, get, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { FieldDef, FormValues } from "@/lib/fields/types";

import { AddressField } from "./AddressField";
import { FieldShell } from "./FieldShell";
import { inputPropsFor } from "./inputProps";
import { RepeatableField } from "./RepeatableField";

type Props = { field: FieldDef; idPrefix: string };

/** Renders one `FieldDef` with the right control for its `type`. */
export function FieldRenderer({ field, idPrefix }: Props) {
  const t = useTranslations();
  const { register, control, formState } = useFormContext<FormValues>();

  if (field.repeatable) return <RepeatableField field={field} idPrefix={idPrefix} />;
  if (field.type === "address") return <AddressField field={field} idPrefix={idPrefix} />;

  const inputId = `${idPrefix}-${field.id}`;
  const label = t(field.labelKey);
  const placeholder = field.placeholderKey ? t(field.placeholderKey) : undefined;
  const description = field.descriptionKey ? t(field.descriptionKey) : undefined;
  const errorKey: string | undefined = get(formState.errors, field.id)?.message;

  if (field.type === "toggle") {
    const descId = description ? `${inputId}-desc` : undefined;
    return (
      <div className="flex items-start gap-3">
        <Controller
          control={control}
          name={field.id}
          render={({ field: f }) => (
            <Switch
              id={inputId}
              className="mt-0.5"
              checked={f.value === true}
              onCheckedChange={(checked) => f.onChange(checked)}
              onBlur={f.onBlur}
              ref={f.ref}
              aria-describedby={descId}
            />
          )}
        />
        <div className="grid gap-1">
          <Label htmlFor={inputId}>{label}</Label>
          {description && (
            <p id={descId} className="text-muted-foreground text-xs">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <FieldShell
      inputId={inputId}
      label={label}
      required={field.required}
      description={description}
      errorKey={errorKey}
    >
      {(aria) => {
        if (field.type === "textarea") {
          return (
            <Textarea
              id={inputId}
              placeholder={placeholder}
              rows={3}
              {...aria}
              {...register(field.id)}
            />
          );
        }
        if (field.type === "select") {
          return (
            <NativeSelect id={inputId} {...aria} {...register(field.id)}>
              {field.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {t(o.labelKey)}
                </option>
              ))}
            </NativeSelect>
          );
        }
        return (
          <Input
            id={inputId}
            placeholder={placeholder}
            {...inputPropsFor(field)}
            {...aria}
            {...register(field.id)}
          />
        );
      }}
    </FieldShell>
  );
}
