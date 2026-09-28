// Shared palette, fonts and logo assets for every 28UILD 2026 artwork.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Screen-print palette: the shirt itself is Biru Habitat, the print uses 3 inks.
export const C = {
  blue: '#0099CC', // Biru Habitat (C86 M0 Y9 K0) – warna kaos, bukan tinta
  white: '#FFFFFF', // tinta 1
  red: '#DA291C', // tinta 2 – Merah (Pantone 485 C)
  navy: '#0C2D5B', // tinta 3 – Biru tua (≈ Pantone 2757 C)
  trim: '#007CAB', // rib kerah / manset di mockup
};

const b64 = (f) => fs.readFileSync(path.join(ROOT, f)).toString('base64');

const img = (file, w, h) => ({ href: `data:image/png;base64,${b64(file)}`, w, h });
export const LOGO = {
  build: img('assets/logo-28uild-white.png', 2000, 893),
  habitat: img('assets/logo-habitat-indonesia-white.png', 2000, 808),
  lotd: img('assets/logo-lets-open-the-door-white.png', 2000, 757),
};

// Place a logo by its top-left corner and width; height keeps the aspect ratio.
export const logo = (L, x, y, w) =>
  `<image href="${L.href}" x="${x}" y="${y}" width="${w}" height="${(w * L.h) / L.w}" preserveAspectRatio="xMidYMid meet"/>`;

const FONTS = [
  ['Barlow', 500, 'normal', 'Barlow-500.ttf'],
  ['Barlow', 600, 'normal', 'Barlow-600.ttf'],
  ['Barlow', 700, 'normal', 'Barlow-700.ttf'],
  ['Barlow Condensed', 500, 'normal', 'BarlowCondensed-500.ttf'],
  ['Barlow Condensed', 600, 'normal', 'BarlowCondensed-600.ttf'],
  ['Barlow Condensed', 700, 'normal', 'BarlowCondensed-700.ttf'],
  ['Barlow Condensed', 800, 'normal', 'BarlowCondensed-800.ttf'],
  ['Barlow Condensed', 900, 'normal', 'BarlowCondensed-900.ttf'],
  ['Barlow Condensed', 700, 'italic', 'BarlowCondensed-700i.ttf'],
  ['Barlow Condensed', 800, 'italic', 'BarlowCondensed-800i.ttf'],
  ['Barlow Condensed', 900, 'italic', 'BarlowCondensed-900i.ttf'],
  ['Special Elite', 400, 'normal', 'SpecialElite-400.ttf'],
];

export const fontCSS = FONTS.map(
  ([fam, wt, st, file]) =>
    `@font-face{font-family:'${fam}';font-weight:${wt};font-style:${st};` +
    `src:url(data:font/ttf;base64,${b64('fonts/' + file)}) format('truetype');}`,
).join('\n');

export const f = (n) => +n.toFixed(2);
