// Generates the PWA PNG icons from a tiny vector description, with no
// dependencies (pure Node + zlib). Run: `node scripts/generate-icons.mjs`
// Re-run after changing the colours below to rebrand the icons.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";

const BRAND = [0x0f, 0x76, 0x6e];
const WHITE = [255, 255, 255];

// Shapes in a 64×64 design grid (mirrors public/icons/icon.svg).
const glyph = [
  { x: 12, y: 12, w: 16, h: 16, r: 3, c: WHITE },
  { x: 36, y: 12, w: 16, h: 16, r: 3, c: WHITE },
  { x: 12, y: 36, w: 16, h: 16, r: 3, c: WHITE },
  { x: 17, y: 17, w: 6, h: 6, r: 0, c: BRAND },
  { x: 41, y: 17, w: 6, h: 6, r: 0, c: BRAND },
  { x: 17, y: 41, w: 6, h: 6, r: 0, c: BRAND },
  { x: 36, y: 36, w: 6, h: 6, r: 0, c: WHITE },
  { x: 46, y: 36, w: 6, h: 6, r: 0, c: WHITE },
  { x: 36, y: 46, w: 6, h: 6, r: 0, c: WHITE },
  { x: 46, y: 46, w: 6, h: 6, r: 0, c: WHITE },
];

function inRoundRect(px, py, { x, y, w, h, r }) {
  if (px < x || py < y || px > x + w || py > y + h) return false;
  const cx = Math.min(Math.max(px, x + r), x + w - r);
  const cy = Math.min(Math.max(py, y + r), y + h - r);
  return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
}

/** @param {{ size: number, rounded: boolean, scale: number }} opts */
function render({ size, rounded, scale }) {
  const SS = 4; // supersampling per axis
  const px = new Uint8Array(size * size * 4);
  const bg = { x: 0, y: 0, w: 64, h: 64, r: rounded ? 14 : 0, c: BRAND };
  const offset = (64 - 64 * scale) / 2;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let sj = 0; sj < SS; sj++) {
        for (let si = 0; si < SS; si++) {
          const u = ((i + (si + 0.5) / SS) / size) * 64;
          const v = ((j + (sj + 0.5) / SS) / size) * 64;
          if (!inRoundRect(u, v, bg)) continue;
          let c = BRAND;
          const gu = (u - offset) / scale;
          const gv = (v - offset) / scale;
          for (const s of glyph) if (inRoundRect(gu, gv, s)) c = s.c;
          r += c[0];
          g += c[1];
          b += c[2];
          a += 255;
        }
      }
      const n = SS * SS;
      const k = (j * size + i) * 4;
      const cov = a / 255;
      px[k] = cov ? r / cov : 0;
      px[k + 1] = cov ? g / cov : 0;
      px[k + 2] = cov ? b / cov : 0;
      px[k + 3] = a / n;
    }
  }
  return px;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = new URL("../public/icons/", import.meta.url);
mkdirSync(outDir, { recursive: true });
const targets = [
  { file: "icon-192.png", size: 192, rounded: true, scale: 1 },
  { file: "icon-512.png", size: 512, rounded: true, scale: 1 },
  // Maskable icons are cropped by the OS: full-bleed background, glyph in the safe zone.
  { file: "icon-maskable-512.png", size: 512, rounded: false, scale: 0.72 },
  { file: "apple-touch-icon.png", size: 180, rounded: false, scale: 0.85 },
];
for (const t of targets) {
  writeFileSync(new URL(t.file, outDir), encodePng(t.size, render(t)));
  console.log(`wrote public/icons/${t.file}`);
}
