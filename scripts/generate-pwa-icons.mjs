/**
 * Generates public/icon-192x192.png and public/icon-512x512.png from SVG.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16a34a"/>
      <stop offset="100%" style="stop-color:#15803d"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#g)"/>
  <text x="256" y="330" text-anchor="middle" font-family="system-ui,sans-serif" font-weight="800" font-size="200" fill="#ffffff">IS</text>
</svg>`;

const buf = Buffer.from(svg);

for (const size of [192, 512]) {
  const out = join(publicDir, `icon-${size}x${size}.png`);
  await sharp(buf).resize(size, size).png().toFile(out);
  console.log("Wrote", out);
}

mkdirSync(join(publicDir, "icons"), { recursive: true });
writeFileSync(join(publicDir, "icons", "maskable-icon.svg"), svg);
console.log("Done.");
