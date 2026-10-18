import { ImageResponse } from "next/og";

import { siteConfig } from "@/site.config";

export const dynamic = "force-static";
export const alt = `${siteConfig.name} — vCard QR Code Generator`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** A decorative, deterministic QR-like pattern (not a real code). */
function Pattern() {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      if (!finder && (x * 7 + y * 13 + x * y) % 3 === 0) cells.push({ x, y });
    }
  }
  const finder = (left: number, top: number) => (
    <div
      style={{
        position: "absolute",
        left: left * 16,
        top: top * 16,
        width: 112,
        height: 112,
        border: "16px solid #111",
        borderRadius: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ width: 48, height: 48, background: "#111", borderRadius: 8 }} />
    </div>
  );
  return (
    <div style={{ position: "relative", width: 336, height: 336, display: "flex" }}>
      {cells.map(({ x, y }) => (
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x * 16 + 2,
            top: y * 16 + 2,
            width: 12,
            height: 12,
            borderRadius: 6,
            background: "#111",
          }}
        />
      ))}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </div>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "72px 96px",
        background: `linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)`,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: siteConfig.accentColor }}>
          {siteConfig.name}
        </div>
        <div
          style={{ fontSize: 64, fontWeight: 800, color: "#111", lineHeight: 1.1, marginTop: 16 }}
        >
          Your contact card as a QR code
        </div>
        <div style={{ fontSize: 28, color: "#444", marginTop: 24, lineHeight: 1.4 }}>
          Scan → “Add to Contacts”. WhatsApp ready. Free, open source, and private — nothing leaves
          your device.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          padding: 32,
          background: "#fff",
          borderRadius: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}
      >
        <Pattern />
      </div>
    </div>,
    size,
  );
}
