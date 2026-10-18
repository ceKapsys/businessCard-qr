"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { GROUP_ORDER } from "@/lib/fields";
import type { FieldDef, FieldValue, FormValues } from "@/lib/fields/types";
import { createResolver } from "@/lib/fields/validation";
import { isVisible } from "@/lib/fields/values";

import { FieldRenderer } from "./FieldRenderer";

function hasContent(value: FieldValue | undefined): boolean {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.some((row) => row.value.trim() !== "");
  return false;
}

type Props = {
  fields: FieldDef[];
  defaultValues: FormValues;
  onValuesChange: (values: FormValues) => void;
  /** Prefix for element ids, so several forms can coexist. */
  idPrefix: string;
};

/** Renders any list of `FieldDef`s, grouped by `field.group`. */
export function DynamicForm({ fields, defaultValues, onValuesChange, idPrefix }: Props) {
  const t = useTranslations();
  const resolver = useMemo(() => createResolver(fields), [fields]);
  const form = useForm<FormValues>({
    defaultValues,
    resolver,
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  const values = useWatch({ control: form.control }) as FormValues;

  // Restored drafts and share links may hold invalid data: show those errors
  // straight away, without flagging untouched empty required fields.
  useEffect(() => {
    const filled = fields.filter((f) => hasContent(defaultValues[f.id])).map((f) => f.id);
    if (filled.length > 0) void form.trigger(filled);
  }, [fields, defaultValues, form]);

  useEffect(() => {
    onValuesChange(structuredClone(values));
  }, [values, onValuesChange]);

  const groups = GROUP_ORDER.map((group) => ({
    group,
    fields: fields.filter((f) => f.group === group && isVisible(f, values)),
  })).filter((g) => g.fields.length > 0);
  const showLegends = groups.length > 1;

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={(e) => e.preventDefault()} className="grid gap-6">
        {groups.map(({ group, fields: groupFields }) => (
          <fieldset key={group} className="grid gap-4">
            <legend
              className={
                showLegends
                  ? "text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase"
                  : "sr-only"
              }
            >
              {t(`groups.${group}`)}
            </legend>
            {groupFields.map((field) => (
              <FieldRenderer key={field.id} field={field} idPrefix={idPrefix} />
            ))}
          </fieldset>
        ))}
      </form>
    </FormProvider>
  );
}
