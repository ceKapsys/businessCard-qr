export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MAX_LOGO_PX = 512;

export type LogoError = "invalid" | "tooLarge";

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Reads a logo file entirely on-device and returns a data URL. Raster images
 * are downscaled to at most 512px so drafts fit comfortably in localStorage.
 */
export async function readLogo(file: File): Promise<string | LogoError> {
  if (!file.type.startsWith("image/")) return "invalid";
  if (file.size > MAX_LOGO_BYTES) return "tooLarge";
  const dataUrl = await readAsDataUrl(file);
  if (file.type === "image/svg+xml") return dataUrl;
  try {
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, MAX_LOGO_PX / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size < 200_000) return dataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return "invalid";
  }
}
