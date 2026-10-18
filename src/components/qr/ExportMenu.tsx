"use client";

import { ContactIcon, CopyIcon, DownloadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  EXPORT_FORMATS,
  EXPORT_SIZES,
  type DesignOptions,
  type ExportFormat,
  type ExportSize,
} from "@/lib/design/types";
import {
  canCopyImage,
  copyImageToClipboard,
  downloadBlob,
  downloadVcf,
  qrFileName,
} from "@/lib/download";
import type { QrEncoder } from "@/lib/encoders/registry";
import { renderQrBlob } from "@/lib/qr/render";
import { useUiStore } from "@/store/uiStore";

const FORMAT_LABEL: Record<ExportFormat, string> = {
  png: "PNG",
  jpeg: "JPEG",
  svg: "SVG",
  webp: "WebP",
};

const subscribeNever = () => () => {};

type Props = { encoder: QrEncoder; payload: string; design: DesignOptions; name: string };

export function ExportMenu({ encoder, payload, design, name }: Props) {
  const t = useTranslations();
  const { exportFormat, exportSize, setExportFormat, setExportSize } = useUiStore();
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  // Feature-detect on the client only: the static HTML is rendered without `window`.
  const clipboard = useSyncExternalStore(subscribeNever, canCopyImage, () => false);

  const disabled = !payload || busy;

  async function download() {
    setBusy(true);
    setStatus(null);
    try {
      const blob = await renderQrBlob({ payload, design, size: exportSize, format: exportFormat });
      downloadBlob(blob, qrFileName(name, exportFormat === "jpeg" ? "jpg" : exportFormat));
    } catch {
      setStatus({ tone: "error", text: t("export.failed") });
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    setStatus(null);
    try {
      await copyImageToClipboard(
        renderQrBlob({ payload, design, size: exportSize, format: "png" }),
      );
      setStatus({ tone: "ok", text: t("export.copied") });
    } catch {
      setStatus({ tone: "error", text: t("export.copyFailed") });
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="export-format">{t("export.format")}</Label>
          <NativeSelect
            id="export-format"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
          >
            {EXPORT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMAT_LABEL[f]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="export-size">{t("export.size")}</Label>
          <NativeSelect
            id="export-size"
            value={exportSize}
            onChange={(e) => setExportSize(Number(e.target.value) as ExportSize)}
          >
            {EXPORT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} px
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>
      <Button onClick={download} disabled={disabled} size="lg">
        <DownloadIcon aria-hidden="true" />
        {t("export.download", { format: FORMAT_LABEL[exportFormat] })}
      </Button>
      <div className="flex flex-wrap gap-2 [&>*]:flex-auto">
        {clipboard && (
          <Button variant="outline" onClick={copy} disabled={disabled}>
            <CopyIcon aria-hidden="true" />
            {t("export.copy")}
          </Button>
        )}
        {encoder.vcf && (
          <Button variant="outline" onClick={() => downloadVcf(payload, name)} disabled={disabled}>
            <ContactIcon aria-hidden="true" />
            {t("export.vcf")}
          </Button>
        )}
      </div>
      <p
        role="status"
        className={status?.tone === "error" ? "text-destructive text-xs" : "text-success text-xs"}
      >
        {status?.text}
      </p>
    </div>
  );
}
