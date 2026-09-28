// Mockup depan & belakang di atas siluet kaos hasil trace template panitia (1920 x 1080).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, C, LOGO, logo } from './common.mjs';
import { backSVG } from './back.mjs';

const SHIRT = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/shirt-paths.json'), 'utf8'));

export const MW = 1920;
export const MH = 1080;

const shirt = (s) => `<path d="${s.body}" fill="${C.blue}"/><path d="${s.trim}" fill="${C.trim}" fill-rule="evenodd"/>`;

// Bendera merah putih kecil di lengan kanan (seperti pada template panitia).
const flag = (x, y, rot) => `<g transform="translate(${x},${y}) rotate(${rot})">
  <rect x="-17" y="-11" width="34" height="11" fill="${C.red}"/><rect x="-17" y="0" width="34" height="11" fill="${C.white}"/></g>`;

const sleeveText = (x, y, rot, text, anchor) =>
  `<text transform="translate(${x},${y}) rotate(${rot})" text-anchor="${anchor}" font-family="Barlow Condensed" font-weight="800" font-size="27" letter-spacing="1.5" fill="${C.white}">${text}</text>`;

function swatch(x, y, fill, name, spec, ring = false) {
  return `<g>
    <circle cx="${x}" cy="${y}" r="17" fill="${fill}" ${ring ? `stroke="#B8C4CE" stroke-width="1.5"` : ''}/>
    <text x="${x + 28}" y="${y - 2}" font-family="Barlow" font-weight="700" font-size="19" fill="${C.navy}">${name}</text>
    <text x="${x + 28}" y="${y + 18}" font-family="Barlow" font-weight="500" font-size="14" fill="#5B6B7A">${spec}</text>
  </g>`;
}

export function mockupSVG() {
  const F = SHIRT.front;
  const B = SHIRT.back;
  const artW = 236;
  const artX = 1311 - artW / 2;
  const artY = 262;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}">
  <rect width="${MW}" height="${MH}" fill="#FFFFFF"/>

  <g text-anchor="middle" font-family="Barlow Condensed">
    <text x="${MW / 2}" y="62" font-weight="700" font-size="22" letter-spacing="5" fill="${C.blue}">DESAIN T-SHIRT 28UILD 2026 · SEMANGAT SUMPAH PEMUDA</text>
    <text x="${MW / 2}" y="112" font-style="italic" font-weight="900" font-size="54" fill="${C.navy}">RUMAH PERSATUAN</text>
    <text x="614" y="168" font-family="Barlow" font-weight="700" font-size="34" fill="${C.blue}">Depan</text>
    <text x="1312" y="168" font-family="Barlow" font-weight="700" font-size="34" fill="${C.blue}">Belakang</text>
  </g>

  <defs>
    <clipPath id="clip-front"><path d="${F.body}"/></clipPath>
    <clipPath id="clip-back"><path d="${B.body}"/></clipPath>
  </defs>

  <!-- DEPAN -->
  ${shirt(F)}
  ${logo(LOGO.build, 490, 352, 64)}
  ${logo(LOGO.habitat, 664, 352, 76)}
  <g clip-path="url(#clip-front)">
    ${flag(366, 416, 20)}
    ${sleeveText(838, 458, -21, 'VOLUN', 'middle')}
  </g>

  <!-- BELAKANG -->
  ${shirt(B)}
  <g clip-path="url(#clip-back)">
    ${flag(1555, 418, -20)}
    ${sleeveText(1074, 440, 21, 'TEER', 'middle')}
  </g>
  ${backSVG({ id: 'mk', guides: true, x: artX, y: artY, width: artW })}

  <!-- warna -->
  <g>
    ${swatch(394, 960, C.blue, 'Kaos: Biru Habitat', 'C86 M0 Y9 K0 · R0 G153 B204 · #0099CC')}
    ${swatch(794, 960, C.white, 'Tinta Putih', '#FFFFFF', true)}
    ${swatch(1034, 960, C.red, 'Tinta Merah', 'Pantone 485 C · #DA291C')}
    ${swatch(1324, 960, C.navy, 'Tinta Biru Tua', 'Pantone 2757 C · #0C2D5B')}
  </g>
  <text x="${MW / 2}" y="1040" text-anchor="middle" font-family="Barlow" font-weight="600" font-size="16" fill="#5B6B7A">Sablon 3 warna di atas kaos Biru Habitat · Area cetak belakang 30 × 40 cm · Tulisan VOLUNTEER melingkar di lengan kiri</text>
</svg>`;
}
