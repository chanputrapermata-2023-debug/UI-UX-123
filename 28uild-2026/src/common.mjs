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
  ['Fraunces', 700, 'normal', 'Fraunces-700.ttf'],
  ['Fraunces', 900, 'normal', 'Fraunces-900.ttf'],
  ['Fraunces', 900, 'italic', 'Fraunces-900i.ttf'],
  ['Big Shoulders Display', 700, 'normal', 'BigShouldersDisplay-700.ttf'],
  ['Big Shoulders Display', 800, 'normal', 'BigShouldersDisplay-800.ttf'],
  ['Big Shoulders Display', 900, 'normal', 'BigShouldersDisplay-900.ttf'],
];

export const fontCSS = FONTS.map(
  ([fam, wt, st, file]) =>
    `@font-face{font-family:'${fam}';font-weight:${wt};font-style:${st};` +
    `src:url(data:font/ttf;base64,${b64('fonts/' + file)}) format('truetype');}`,
).join('\n');

export const f = (n) => +n.toFixed(2);

// ---------------------------------------------------------------- kanvas punggung (dipakai semua karya)
// Area cetak maksimum 30 x 40 cm; koordinat dalam milimeter.
export const W = 300;
export const H = 400;
export const CX = W / 2;

// Logo Let's Open The Door tepat di bawah kerah belakang.
export function lotd() {
  const w = 66;
  return logo(LOGO.lotd, CX - w / 2, 6, w);
}

// Kotak panduan area logo sponsor (tidak ikut di file cetak).
export function sponsorSpace() {
  return `<g>
    <rect x="22" y="40" width="256" height="52" rx="3" fill="none" stroke="${C.white}" stroke-width="1" stroke-dasharray="3 2.4"/>
    <text x="${CX}" y="68.8" text-anchor="middle" font-family="Barlow" font-weight="700" font-size="8" fill="${C.white}" opacity="0.9">SPACE LOGO SPONSOR</text>
  </g>`;
}

/**
 * Bungkus isi artwork punggung menjadi elemen <svg> 300 x 400.
 * @param {object} o
 * @param {boolean} [o.shirt] isi latar dengan warna kaos (pratinjau); false = latar transparan (file cetak)
 * @param {boolean} [o.guides] tampilkan kotak panduan area sponsor
 * @param {boolean} [o.mm] ukuran fisik dalam mm pada elemen <svg>
 * @param {number} [o.x] [o.y] [o.width] tempelkan di dalam SVG lain (mockup / halaman konsep)
 */
export function backFrame({ shirt = false, guides = true, mm = true, x, y, width } = {}, defs, body) {
  const size = width
    ? `x="${x}" y="${y}" width="${width}" height="${(width * H) / W}"`
    : mm
      ? `width="${W}mm" height="${H}mm"`
      : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" ${size}>
  <defs>${defs}</defs>
  ${shirt ? `<rect width="${W}" height="${H}" fill="${C.blue}"/>` : ''}
  ${lotd()}
  ${guides ? sponsorSpace() : ''}
  ${body}
</svg>`;
}
