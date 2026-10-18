"use client";

import { EyeIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { FormPanel } from "@/components/form/FormPanel";
import { DensityMeter } from "@/components/qr/DensityMeter";
import { DesignPanel } from "@/components/qr/DesignPanel";
import { ExportMenu } from "@/components/qr/ExportMenu";
import { PayloadView } from "@/components/qr/PayloadView";
import { QRPreview } from "@/components/qr/QRPreview";
import { TypeSwitcher } from "@/components/qr/TypeSwitcher";
import { Card, CardTitle } from "@/components/ui/card";
import { usePayload } from "@/hooks/usePayload";
import { useDesignStore } from "@/store/designStore";
import { useFormStore } from "@/store/formStore";

import { useAppStatus } from "./Providers";
import { ShareActions } from "./ShareActions";

function FormSkeleton() {
  const t = useTranslations();
  return (
    <div className="grid gap-4" aria-busy="true">
      <span className="sr-only">{t("app.loading")}</span>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="grid gap-2">
          <div className="bg-muted h-3.5 w-24 animate-pulse rounded" />
          <div className="bg-muted h-9 animate-pulse rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** True while `ref` is on screen (used to hide the mobile "jump to preview" button). */
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, inView] as const;
}

export function Generator() {
  const t = useTranslations();
  const { ready, loadedFromLink } = useAppStatus();
  const typeId = useFormStore((s) => s.typeId);
  const revision = useFormStore((s) => s.revision);
  const design = useDesignStore((s) => s.design);
  const { encoder, values, payload, name } = usePayload();
  const [previewRef, previewInView] = useInView<HTMLElement>();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] md:items-start">
      <div className="grid min-w-0 gap-6">
        <p className="text-muted-foreground text-sm">{t("app.howItWorks")}</p>
        <TypeSwitcher />
        {loadedFromLink && (
          <p role="status" className="bg-primary/10 rounded-md px-3 py-2 text-sm">
            {t("share.loadedFromLink")}
          </p>
        )}
        <Card aria-labelledby="form-heading">
          <CardTitle id="form-heading" className="mb-4">
            {t("app.formHeading")}
          </CardTitle>
          {ready ? <FormPanel key={`${typeId}-${revision}`} encoder={encoder} /> : <FormSkeleton />}
        </Card>
        <Card aria-labelledby="design-heading">
          <CardTitle id="design-heading" className="mb-4">
            {t("app.designHeading")}
          </CardTitle>
          <DesignPanel />
        </Card>
      </div>

      <aside
        id="preview"
        ref={previewRef}
        tabIndex={-1}
        aria-labelledby="preview-heading"
        className="grid scroll-mt-4 gap-4 focus:outline-none md:sticky md:top-4"
      >
        <Card className="grid gap-4">
          <CardTitle id="preview-heading">{t("app.previewHeading")}</CardTitle>
          <QRPreview payload={payload} design={design} label={`${t("preview.alt")}: ${name}`} />
          <DensityMeter encoder={encoder} values={values} payload={payload} design={design} />
          <ExportMenu encoder={encoder} payload={payload} design={design} name={name} />
          <ShareActions />
          <PayloadView payload={payload} />
        </Card>
        <p className="bg-card flex gap-2 rounded-lg border p-3 text-sm">
          <ShieldCheckIcon aria-hidden="true" className="text-success mt-0.5 size-4 shrink-0" />
          <span>
            <strong className="font-semibold">{t("app.privacy")}</strong>{" "}
            <span className="text-muted-foreground">{t("app.privacyDetail")}</span>
          </span>
        </p>
      </aside>

      {!previewInView && (
        <a
          href="#preview"
          className="bg-primary text-primary-foreground focus-visible:ring-ring/50 fixed right-4 bottom-4 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg focus-visible:ring-[3px] focus-visible:outline-none md:hidden"
        >
          <EyeIcon aria-hidden="true" className="size-4" />
          {t("app.jumpToPreview")}
        </a>
      )}
    </div>
  );
}
