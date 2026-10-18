"use client";

import { LinkIcon, RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toStyle } from "@/lib/design/sanitize";
import { buildShareUrl } from "@/lib/share";
import { useDesignStore } from "@/store/designStore";
import { selectCurrentValues, useFormStore } from "@/store/formStore";

export function ShareActions() {
  const t = useTranslations();
  const [status, setStatus] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState<string | null>(null);

  async function copyLink() {
    const form = useFormStore.getState();
    const url = buildShareUrl(
      {
        type: form.typeId,
        values: selectCurrentValues(form),
        style: toStyle(useDesignStore.getState().design),
      },
      window.location,
    );
    try {
      await navigator.clipboard.writeText(url);
      setManualLink(null);
      setStatus(t("share.linkCopied"));
    } catch {
      setManualLink(url);
      setStatus(null);
    }
  }

  function reset() {
    useFormStore.getState().reset();
    useDesignStore.getState().reset();
    setStatus(null);
    setManualLink(null);
  }

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={copyLink}>
          <LinkIcon aria-hidden="true" />
          {t("share.copyLink")}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost">
              <RotateCcwIcon aria-hidden="true" />
              {t("share.reset")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("share.resetTitle")}</AlertDialogTitle>
              <AlertDialogDescription>{t("share.resetDescription")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("share.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={reset}>{t("share.resetConfirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {manualLink && (
        <div className="grid gap-1.5">
          <label htmlFor="share-link" className="text-xs">
            {t("share.manualCopy")}
          </label>
          <Input id="share-link" readOnly value={manualLink} onFocus={(e) => e.target.select()} />
        </div>
      )}
      <p role="status" className="text-success text-xs">
        {status}
      </p>
      <p className="text-muted-foreground text-xs">{t("share.linkNote")}</p>
    </div>
  );
}
