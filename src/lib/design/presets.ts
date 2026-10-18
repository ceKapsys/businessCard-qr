import { siteConfig } from "@/site.config";

import type { DesignOptions, DesignPreset, DesignStyle } from "./types";

export const DEFAULT_STYLE: DesignStyle = {
  fgColor: "#111111",
  bgColor: "#ffffff",
  transparentBg: false,
  gradient: { enabled: false, color2: "#0f766e", rotation: 45 },
  dotStyle: "square",
  cornerSquareStyle: "square",
  cornerDotStyle: "square",
  marginPct: 4,
  ecc: "M",
  logoSize: 0.18,
};

export const DEFAULT_DESIGN: DesignOptions = { ...DEFAULT_STYLE, logo: null };

/** Built-in presets. Add more here; `nameKey` is an i18n key. */
export const BUILT_IN_PRESETS: DesignPreset[] = [
  { id: "minimal", nameKey: "design.presets.minimal", style: DEFAULT_STYLE },
  {
    id: "rounded",
    nameKey: "design.presets.rounded",
    style: {
      ...DEFAULT_STYLE,
      fgColor: "#1e293b",
      dotStyle: "rounded",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "dot",
    },
  },
  {
    id: "dark",
    nameKey: "design.presets.dark",
    style: {
      ...DEFAULT_STYLE,
      fgColor: "#0b1220",
      bgColor: "#e2e8f0",
      dotStyle: "classy-rounded",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "square",
    },
  },
  {
    id: "brand",
    nameKey: "design.presets.brand",
    style: {
      ...DEFAULT_STYLE,
      fgColor: "#111111",
      gradient: { enabled: true, color2: siteConfig.accentColor, rotation: 45 },
      dotStyle: "dots",
      cornerSquareStyle: "extra-rounded",
      cornerDotStyle: "dot",
      ecc: "Q",
    },
  },
];
