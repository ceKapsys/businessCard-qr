"use client";

import { ImageUpIcon, Trash2Icon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { BUILT_IN_PRESETS } from "@/lib/design/presets";
import {
  CORNER_DOT_STYLES,
  CORNER_SQUARE_STYLES,
  DOT_STYLES,
  ERROR_CORRECTION,
  MAX_LOGO_SIZE,
  MAX_MARGIN_PCT,
  MIN_LOGO_SIZE,
  type DesignOptions,
  type DesignPreset,
} from "@/lib/design/types";
import { readLogo } from "@/lib/logo";
import { useDesignStore } from "@/store/designStore";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-input focus-visible:ring-ring/50 h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1 focus-visible:ring-[3px] focus-visible:outline-none"
        />
        <code className="text-muted-foreground text-xs">{value}</code>
      </div>
    </div>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  optionLabel,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly T[];
  optionLabel: (v: T) => string;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {optionLabel(o)}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

function PresetButton({ preset, onApply }: { preset: DesignPreset; onApply: () => void }) {
  const t = useTranslations();
  const { fgColor, bgColor, gradient } = preset.style;
  return (
    <Button type="button" variant="outline" size="sm" onClick={onApply}>
      <span
        aria-hidden="true"
        className="size-4 rounded-sm border"
        style={{
          background: gradient.enabled
            ? `linear-gradient(135deg, ${fgColor}, ${gradient.color2})`
            : fgColor,
          outline: `3px solid ${bgColor}`,
          outlineOffset: "-3px",
        }}
      />
      {preset.nameKey ? t(preset.nameKey) : preset.name}
    </Button>
  );
}

function Presets() {
  const t = useTranslations();
  const { userPresets, applyStyle, savePreset, deletePreset } = useDesignStore();
  const [name, setName] = useState("");

  return (
    <Section title={t("design.presets.heading")}>
      <div className="flex flex-wrap gap-2">
        {BUILT_IN_PRESETS.map((p) => (
          <PresetButton key={p.id} preset={p} onApply={() => applyStyle(p.style)} />
        ))}
      </div>
      {userPresets.length > 0 && (
        <div className="grid gap-2">
          <p className="text-muted-foreground text-xs">{t("design.presets.yours")}</p>
          <ul className="flex flex-wrap gap-2">
            {userPresets.map((p) => (
              <li key={p.id} className="flex items-center">
                <PresetButton preset={p} onApply={() => applyStyle(p.style)} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t("design.presets.delete", { name: p.name ?? "" })}
                  onClick={() => deletePreset(p.id)}
                >
                  <XIcon aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          savePreset(name);
          setName("");
        }}
      >
        <Input
          aria-label={t("design.presets.saveLabel")}
          placeholder={t("design.presets.namePlaceholder")}
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit" variant="secondary" disabled={!name.trim()}>
          {t("design.presets.save")}
        </Button>
      </form>
    </Section>
  );
}

function LogoPicker({ design }: { design: DesignOptions }) {
  const t = useTranslations();
  const { setLogo, update } = useDesignStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  return (
    <Section title={t("design.logo.label")}>
      <div className="flex flex-wrap items-center gap-3">
        {design.logo && (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL
          <img src={design.logo} alt="" className="size-12 rounded-md border object-contain p-1" />
        )}
        <input
          ref={fileInput}
          id={inputId}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            const result = await readLogo(file);
            if (result === "invalid" || result === "tooLarge") {
              setError(t(`design.logo.${result}`));
            } else {
              setError(null);
              setLogo(result);
            }
          }}
        />
        <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
          <ImageUpIcon aria-hidden="true" />
          {t("design.logo.upload")}
        </Button>
        {design.logo && (
          <Button type="button" variant="ghost" onClick={() => setLogo(null)}>
            <Trash2Icon aria-hidden="true" />
            {t("design.logo.remove")}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-destructive text-xs font-medium">
          {error}
        </p>
      )}
      <p className="text-muted-foreground text-xs">{t("design.logo.hint")}</p>
      {design.logo && (
        <div className="grid gap-2">
          <Label>
            {t("design.logo.size")}: {Math.round(design.logoSize * 100)}%
          </Label>
          <Slider
            thumbLabel={t("design.logo.size")}
            min={MIN_LOGO_SIZE * 100}
            max={MAX_LOGO_SIZE * 100}
            step={1}
            value={[Math.round(design.logoSize * 100)]}
            onValueChange={([v]) => update({ logoSize: v / 100 })}
          />
        </div>
      )}
    </Section>
  );
}

export function DesignPanel() {
  const t = useTranslations();
  const design = useDesignStore((s) => s.design);
  const update = useDesignStore((s) => s.update);
  const styleLabel = (v: string) => t(`design.styles.${v}`);

  return (
    <div className="grid gap-6">
      <Presets />

      <Section title={t("design.colors.heading")}>
        <div className="grid grid-cols-2 gap-3">
          <ColorField
            id="design-fg"
            label={t("design.colors.fg")}
            value={design.fgColor}
            onChange={(fgColor) => update({ fgColor })}
          />
          <ColorField
            id="design-bg"
            label={t("design.colors.bg")}
            value={design.bgColor}
            onChange={(bgColor) => update({ bgColor })}
          />
        </div>
        <div className="flex items-start gap-3">
          <Switch
            id="design-transparent"
            checked={design.transparentBg}
            onCheckedChange={(transparentBg) => update({ transparentBg })}
            aria-describedby="design-transparent-hint"
            className="mt-0.5"
          />
          <div className="grid gap-1">
            <Label htmlFor="design-transparent">{t("design.colors.transparent")}</Label>
            <p id="design-transparent-hint" className="text-muted-foreground text-xs">
              {t("design.colors.transparentHint")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="design-gradient"
            checked={design.gradient.enabled}
            onCheckedChange={(enabled) => update({ gradient: { ...design.gradient, enabled } })}
          />
          <Label htmlFor="design-gradient">{t("design.colors.gradient")}</Label>
        </div>
        {design.gradient.enabled && (
          <div className="grid grid-cols-2 items-end gap-3">
            <ColorField
              id="design-gradient-color"
              label={t("design.colors.gradientColor")}
              value={design.gradient.color2}
              onChange={(color2) => update({ gradient: { ...design.gradient, color2 } })}
            />
            <div className="grid gap-3 pb-3">
              <Label>
                {t("design.colors.rotation")}: {design.gradient.rotation}°
              </Label>
              <Slider
                thumbLabel={t("design.colors.rotation")}
                min={0}
                max={360}
                step={15}
                value={[design.gradient.rotation]}
                onValueChange={([rotation]) =>
                  update({ gradient: { ...design.gradient, rotation } })
                }
              />
            </div>
          </div>
        )}
      </Section>

      <Section title={t("design.shape")}>
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectField
            id="design-dots"
            label={t("design.dotStyle")}
            value={design.dotStyle}
            options={DOT_STYLES}
            optionLabel={styleLabel}
            onChange={(dotStyle) => update({ dotStyle })}
          />
          <SelectField
            id="design-corner-square"
            label={t("design.cornerSquareStyle")}
            value={design.cornerSquareStyle}
            options={CORNER_SQUARE_STYLES}
            optionLabel={styleLabel}
            onChange={(cornerSquareStyle) => update({ cornerSquareStyle })}
          />
          <SelectField
            id="design-corner-dot"
            label={t("design.cornerDotStyle")}
            value={design.cornerDotStyle}
            options={CORNER_DOT_STYLES}
            optionLabel={styleLabel}
            onChange={(cornerDotStyle) => update({ cornerDotStyle })}
          />
        </div>
        <div className="grid gap-3">
          <Label>
            {t("design.margin")}: {design.marginPct}%
          </Label>
          <Slider
            thumbLabel={t("design.margin")}
            min={0}
            max={MAX_MARGIN_PCT}
            step={1}
            value={[design.marginPct]}
            onValueChange={([marginPct]) => update({ marginPct })}
          />
        </div>
        <div className="grid gap-1.5">
          <SelectField
            id="design-ecc"
            label={t("design.ecc.label")}
            value={design.logo ? "H" : design.ecc}
            options={ERROR_CORRECTION}
            optionLabel={(v) => t(`design.ecc.${v}`)}
            onChange={(ecc) => update({ ecc })}
            disabled={Boolean(design.logo)}
          />
          {design.logo && <p className="text-muted-foreground text-xs">{t("design.ecc.forced")}</p>}
        </div>
      </Section>

      <LogoPicker design={design} />
    </div>
  );
}
