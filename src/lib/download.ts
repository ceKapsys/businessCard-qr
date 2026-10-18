/** Unicode-aware slug: keeps letters/marks/digits from any script (e.g. Bangla). */
export function slugify(input: string): string {
  return input
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** `<slugified-name>-qr.<ext>` */
export function qrFileName(name: string, ext: string): string {
  return `${slugify(name) || "qr-code"}-qr.${ext}`;
}

export function vcfFileName(name: string): string {
  return `${slugify(name) || "contact"}.vcf`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give Safari time to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

export function downloadVcf(vcard: string, name: string): void {
  downloadBlob(new Blob([vcard], { type: "text/vcard;charset=utf-8" }), vcfFileName(name));
}

export function canCopyImage(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function"
  );
}

/**
 * Copies a PNG to the clipboard. Takes a promise so Safari keeps the user
 * gesture while the image is generated.
 */
export async function copyImageToClipboard(png: Promise<Blob>): Promise<void> {
  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}
