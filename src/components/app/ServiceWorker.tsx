"use client";

import { useEffect } from "react";

/** Registers the offline service worker generated at build time (production only). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is a progressive enhancement */
    });
  }, []);
  return null;
}
