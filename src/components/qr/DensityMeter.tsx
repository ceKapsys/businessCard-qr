"use client";

import { AlertTriangleIcon, WandSparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { effectiveEcc } from "@/lib/design/qrOptions";
import { SMALL_PRINT_STYLE } from "@/lib/design/presets";
import type { DesignOptions } from "@/lib/design/types";
import type { QrEncoder } from "@/lib/encoders/types";
import type { FormValues } from "@/lib/fields/types";
import { checkQrContrast } from "@/lib/qr/contrast";
import { MAX_PRINT_MM, MIN_PRINT_MM, measureDensity, type DensityLevel } from "@/lib/qr/density";
import { measureFieldCosts } from "@/lib/qr/fieldCosts";
import { cn } from "@/lib/utils";
import { useDesignStore } from "@/store/designStore";
import { useUiStore } from "@/store/uiStore";

const SEGMENTS: Record<DensityLevel, number> = { good: 1, ok: 2, risky: 3, tooLong: 3 };
const TONE: Record<DensityLevel, string> = {
  good: "bg-success",
  ok: "bg-warning",
  risky: "bg-destructive",
  tooLong: "bg-destructive",
};

type Props = { encoder: QrEncoder; values: FormValues; payload: string; design: DesignOptions };

function isSmallPrintStyle(design: DesignOptions): boolean {
  return (
    !design.gradient.enabled &&
    (Object.keys(SMALL_PRINT_STYLE) as (keyof typeof SMALL_PRINT_STYLE)[]).every(
      (key) => design[key] === SMALL_PRINT_STYLE[key],
    )
  );
}

export function DensityMeter({ encoder, values, payload, design }: Props) {
  const t = useTranslations();
  const printSizeMm = useUiStore((s) => s.printSizeMm);
  const setPrintSizeMm = useUiStore((s) => s.setPrintSizeMm);
  const optimise = useDesignStore((s) => s.optimiseForSmallPrint);

  const density = useMemo(
    () =>
      measureDensity(payload, effectiveEcc(design), {
        printMm: printSizeMm,
        marginPct: design.marginPct,
      }),
    [payload, design, printSizeMm],
  );
  const costs = useMemo(
    () => (density.level === "good" ? [] : measureFieldCosts(encoder, values).slice(0, 3)),
    [density.level, encoder, values],
  );
  const contrast = useMemo(() => {
    const fgs = design.gradient.enabled
      ? [design.fgColor, design.gradient.color2]
      : [design.fgColor];
    // A transparent QR usually ends up on white paper or a light page.
    return checkQrContrast(fgs, design.transparentBg ? "#ffffff" : design.bgColor);
  }, [design]);

  const struggling = density.level !== "good";
  const warnings: string[] = [];
  if (density.level === "tooLong") warnings.push(t("density.hintTooLong"));
  if (struggling && density.minPrintMm !== null) {
    warnings.push(t("density.hintMinSize", { mm: density.minPrintMm }));
  }
  if (struggling && design.logo) warnings.push(t("density.hintLogo"));
  if (contrast.low) warnings.push(t("density.lowContrast"));
  else if (contrast.inverted) warnings.push(t("density.inverted"));

  if (!payload && warnings.length === 0) return null;

  return (
    <div className="grid gap-2">
      <div className="flex items-end gap-3">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="print-size">{t("density.printSize")}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="print-size"
              type="number"
              inputMode="numeric"
              min={MIN_PRINT_MM}
              max={MAX_PRINT_MM}
              step={1}
              value={printSizeMm}
              onChange={(e) => setPrintSizeMm(e.target.valueAsNumber)}
              aria-describedby="print-size-hint"
              className="w-20"
            />
            <span id="print-size-hint" className="text-muted-foreground text-xs">
              {t("density.printSizeHint")}
            </span>
          </div>
        </div>
      </div>

      {payload && (
        <div className="grid gap-2" aria-live="polite">
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
          {density.version !== null && density.moduleMm !== null && (
            <p className="text-muted-foreground text-xs">
              {t("density.details", {
                bytes: density.bytes,
                modules: density.modules ?? 0,
                moduleMm: density.moduleMm.toFixed(2),
                printMm: printSizeMm,
              })}
            </p>
          )}
        </div>
      )}

      {warnings.map((w) => (
        <p key={w} className="text-foreground flex gap-2 text-xs">
          <AlertTriangleIcon aria-hidden="true" className="text-warning mt-px size-3.5 shrink-0" />
          {w}
        </p>
      ))}

      {costs.length > 0 && (
        <div className="grid gap-1 text-xs">
          <p className="font-medium">{t("density.biggest")}</p>
          <ul className="text-muted-foreground grid gap-0.5">
            {costs.map((c) => (
              <li key={c.fieldId} className="flex justify-between gap-2">
                <span>{t(c.labelKey)}</span>
                <span className="tabular-nums">{t("density.bytes", { bytes: c.bytes })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {struggling && !isSmallPrintStyle(design) && (
        <Button type="button" variant="outline" size="sm" onClick={optimise}>
          <WandSparklesIcon aria-hidden="true" />
          {t("density.optimise")}
        </Button>
      )}
    </div>
  );
}
