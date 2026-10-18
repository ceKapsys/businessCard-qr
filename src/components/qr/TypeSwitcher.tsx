"use client";

import { useTranslations } from "next-intl";

import { encoders } from "@/lib/encoders/registry";
import { cn } from "@/lib/utils";
import { useFormStore } from "@/store/formStore";

/** Built from the encoder registry: a new QR type shows up here automatically. */
export function TypeSwitcher() {
  const t = useTranslations();
  const typeId = useFormStore((s) => s.typeId);
  const setType = useFormStore((s) => s.setType);

  return (
    <fieldset>
      <legend className="sr-only">{t("encoders.legend")}</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {encoders.map((encoder) => {
          const checked = encoder.id === typeId;
          return (
            <label
              key={encoder.id}
              className={cn(
                "bg-card has-[:focus-visible]:ring-ring/50 flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-sm shadow-xs transition-colors has-[:focus-visible]:ring-[3px]",
                checked ? "border-primary bg-primary/5" : "hover:bg-accent",
              )}
            >
              <input
                type="radio"
                name="qr-type"
                value={encoder.id}
                checked={checked}
                onChange={() => setType(encoder.id)}
                aria-labelledby={`type-${encoder.id}-label`}
                aria-describedby={`type-${encoder.id}-desc`}
                className="sr-only"
              />
              <span id={`type-${encoder.id}-label`} className="font-medium">
                {t(encoder.labelKey)}
              </span>
              <span id={`type-${encoder.id}-desc`} className="text-muted-foreground text-xs">
                {t(encoder.descriptionKey)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
