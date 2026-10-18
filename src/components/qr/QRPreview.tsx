"use client";

import { QrCodeIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type QRCodeStyling from "qr-code-styling";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { PREVIEW_DEBOUNCE_MS } from "@/hooks/usePayload";
import { buildQrOptions } from "@/lib/design/qrOptions";
import type { DesignOptions } from "@/lib/design/types";
import { loadQrCodeStyling } from "@/lib/qr/render";
import { cn } from "@/lib/utils";

const PREVIEW_SIZE = 320;

type Props = { payload: string; design: DesignOptions; label: string };

export function QRPreview({ payload, design, label }: Props) {
  const t = useTranslations();
  const container = useRef<HTMLDivElement>(null);
  const qr = useRef<QRCodeStyling | null>(null);
  const [failed, setFailed] = useState(false);
  const debouncedDesign = useDebouncedValue(design, PREVIEW_DEBOUNCE_MS);

  useEffect(() => {
    if (!payload) return;
    let cancelled = false;
    const options = buildQrOptions({
      payload,
      design: debouncedDesign,
      size: PREVIEW_SIZE,
      format: "svg",
    });
    loadQrCodeStyling()
      .then((QR) => {
        if (cancelled || !container.current) return;
        if (!qr.current) {
          qr.current = new QR(options);
          container.current.replaceChildren();
          qr.current.append(container.current);
        } else {
          qr.current.update(options);
        }
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [payload, debouncedDesign]);

  const empty = !payload;
  const checker =
    design.transparentBg &&
    "bg-[conic-gradient(#e5e5e5_25%,#fff_0_50%,#e5e5e5_0_75%,#fff_0)] bg-[length:16px_16px]";

  return (
    <div className="relative mx-auto aspect-square w-full max-w-80">
      <div
        ref={container}
        role="img"
        aria-label={label}
        className={cn(
          "size-full overflow-hidden rounded-lg [&>svg]:size-full",
          checker,
          empty && "hidden",
        )}
      />
      {(empty || failed) && (
        <div className="bg-card text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center text-sm">
          <QrCodeIcon aria-hidden="true" className="size-12 opacity-40" />
          <p>{failed ? t("preview.error") : t("preview.empty")}</p>
        </div>
      )}
    </div>
  );
}
