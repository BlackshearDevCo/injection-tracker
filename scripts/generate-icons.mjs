import sharp from "sharp";
import { mkdirSync } from "fs";

// Simple syringe icon on a dark rounded-rect background
function createIconSvg(size) {
  const pad = size * 0.15;
  const cx = size / 2;
  const cy = size / 2;

  // Syringe dimensions relative to icon size
  const bodyW = size * 0.12;
  const bodyH = size * 0.38;
  const bodyX = cx - bodyW / 2;
  const bodyY = cy - bodyH / 2 - size * 0.02;

  const needleW = size * 0.03;
  const needleH = size * 0.14;
  const needleX = cx - needleW / 2;
  const needleY = bodyY + bodyH;

  const plungerW = bodyW * 0.5;
  const plungerH = size * 0.1;
  const plungerX = cx - plungerW / 2;
  const plungerY = bodyY - plungerH + 1;

  const handleW = bodyW * 0.9;
  const handleH = size * 0.025;
  const handleX = cx - handleW / 2;
  const handleY = plungerY - handleH;

  // Liquid fill (bottom portion of body)
  const liquidH = bodyH * 0.4;
  const liquidY = bodyY + bodyH - liquidH;

  const r = size * 0.22; // corner radius

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" rx="${r}" fill="#0f172a"/>

    <!-- Subtle gradient background -->
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e293b" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#0f172a" stop-opacity="1"/>
      </linearGradient>
      <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#818cf8"/>
        <stop offset="100%" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <rect x="${pad * 0.5}" y="${pad * 0.5}" width="${size - pad}" height="${size - pad}" rx="${r * 0.85}" fill="url(#bg)"/>

    <!-- Syringe body -->
    <rect x="${bodyX}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${bodyW * 0.15}" fill="none" stroke="#94a3b8" stroke-width="${size * 0.02}"/>

    <!-- Liquid fill -->
    <rect x="${bodyX + size * 0.015}" y="${liquidY}" width="${bodyW - size * 0.03}" height="${liquidH - size * 0.01}" rx="${bodyW * 0.1}" fill="url(#liquid)" opacity="0.85"/>

    <!-- Tick marks on body -->
    ${[0.25, 0.5, 0.75].map(t => {
      const y = bodyY + bodyH * t;
      return `<line x1="${bodyX}" y1="${y}" x2="${bodyX + bodyW * 0.25}" y2="${y}" stroke="#64748b" stroke-width="${size * 0.01}"/>`;
    }).join("\n    ")}

    <!-- Needle -->
    <rect x="${needleX}" y="${needleY - 1}" width="${needleW}" height="${needleH}" rx="${needleW * 0.3}" fill="#94a3b8"/>
    <line x1="${cx}" y1="${needleY + needleH - 1}" x2="${cx}" y2="${needleY + needleH + size * 0.03}" stroke="#94a3b8" stroke-width="${size * 0.012}" stroke-linecap="round"/>

    <!-- Plunger -->
    <rect x="${plungerX}" y="${plungerY}" width="${plungerW}" height="${plungerH}" rx="${plungerW * 0.2}" fill="#94a3b8"/>

    <!-- Handle -->
    <rect x="${handleX}" y="${handleY}" width="${handleW}" height="${handleH}" rx="${handleH * 0.3}" fill="#94a3b8"/>
  </svg>`;
}

mkdirSync("public", { recursive: true });

const sizes = [192, 512];
for (const size of sizes) {
  const svg = createIconSvg(size);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/pwa-${size}x${size}.png`);
  console.log(`Generated pwa-${size}x${size}.png`);
}

// Apple touch icon (180x180)
const appleSvg = createIconSvg(180);
await sharp(Buffer.from(appleSvg))
  .png()
  .toFile("public/apple-touch-icon.png");
console.log("Generated apple-touch-icon.png");

console.log("Done!");
