"use client";

import { useTranslations } from "next-intl";

/** Shows the exact text inside the QR — handy for debugging scans. */
export function PayloadView({ payload }: { payload: string }) {
  const t = useTranslations();
  return (
    <details className="group text-sm">
      <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 cursor-pointer rounded-sm focus-visible:ring-[3px] focus-visible:outline-none">
        {t("payload.show")}
      </summary>
      <pre
        data-testid="payload"
        className="bg-muted mt-2 max-h-60 overflow-auto rounded-md p-3 text-xs break-all whitespace-pre-wrap"
      >
        {payload || t("payload.empty")}
      </pre>
    </details>
  );
}
