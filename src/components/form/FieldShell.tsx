"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { Label } from "@/components/ui/label";

type Props = {
  inputId: string;
  label: string;
  required?: boolean;
  description?: string;
  /** i18n key of the validation error, if any. */
  errorKey?: string;
  children: (aria: {
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
    "aria-required": boolean | undefined;
  }) => ReactNode;
};

/** Label + control + help text + error, with the ARIA wiring between them. */
export function FieldShell({ inputId, label, required, description, errorKey, children }: Props) {
  const t = useTranslations();
  const descId = description ? `${inputId}-desc` : undefined;
  const errId = errorKey ? `${inputId}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={inputId}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only">({t("form.required")})</span>}
      </Label>
      {children({
        "aria-invalid": Boolean(errorKey),
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}
      {description && (
        <p id={descId} className="text-muted-foreground text-xs">
          {description}
        </p>
      )}
      {errorKey && (
        <p id={errId} className="text-destructive text-xs font-medium">
          {t(errorKey)}
        </p>
      )}
    </div>
  );
}
