"use client";

import { AlertTriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { effectiveEcc } from "@/lib/design/qrOptions";
import type { DesignOptions } from "@/lib/design/types";
import { checkQrContrast } from "@/lib/qr/contrast";
import { measureDensity, type DensityLevel } from "@/lib/qr/density";
import { cn } from "@/lib/utils";

const SEGMENTS: Record<DensityLevel, number> = { good: 1, ok: 2, risky: 3, tooLong: 3 };
const TONE: Record<DensityLevel, string> = {
  good: "bg-success",
  ok: "bg-warning",
  risky: "bg-destructive",
  tooLong: "bg-destructive",
};

type Props = { payload: string; design: DesignOptions };

export function DensityMeter({ payload, design }: Props) {
  const t = useTranslations();
  const density = useMemo(() => measureDensity(payload, effectiveEcc(design)), [payload, design]);
  const contrast = useMemo(() => {
    const fgs = design.gradient.enabled
      ? [design.fgColor, design.gradient.color2]
      : [design.fgColor];
    // A transparent QR usually ends up on white paper or a light page.
    return checkQrContrast(fgs, design.transparentBg ? "#ffffff" : design.bgColor);
  }, [design]);

  const warnings: string[] = [];
  if (density.level === "risky") warnings.push(t("density.hintRisky"));
  if (density.level === "tooLong") warnings.push(t("density.hintTooLong"));
  if (contrast.low) warnings.push(t("density.lowContrast"));
  else if (contrast.inverted) warnings.push(t("density.inverted"));

  if (!payload && warnings.length === 0) return null;

  return (
    <div className="grid gap-2" aria-live="polite">
      {payload && (
        <>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium">{t("density.label")}</span>
            <span>{t(`density.${density.level}`)}</span>
          </div>
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i <= SEGMENTS[density.level] ? TONE[density.level] : "bg-muted",
                )}
              />
            ))}
          </div>
          {density.version !== null && (
            <p className="text-muted-foreground text-xs">
              {t("density.details", {
                bytes: density.bytes,
                version: density.version,
                modules: density.modules ?? 0,
              })}
            </p>
          )}
        </>
      )}
      {warnings.map((w) => (
        <p key={w} className="text-foreground flex gap-2 text-xs">
          <AlertTriangleIcon aria-hidden="true" className="text-warning mt-px size-3.5 shrink-0" />
          {w}
        </p>
      ))}
    </div>
  );
}
