// Halaman konsep / filosofi desain (1920 x 1080) untuk presentasi ke juri.
import { C, INKS, DEFAULT_INKS } from './common.mjs';

export const PW = 1920;
export const PH = 1080;

const CHECKS = [
  'Tema Semangat Sumpah Pemuda',
  'Tagline “Together We Build Indonesia”',
  'Tulisan VOLUNTEER di lengan kiri',
  'Logo 28UILD 2026 di dada kanan',
  'Logo Habitat for Humanity Indonesia di dada kiri',
  'Logo Let’s Open The Door di bawah kerah belakang',
  'Area khusus logo sponsor',
  'Kaos Biru Habitat #0099CC',
  'Bebas SARA & ujaran kebencian',
];

const inkChip = (k) => {
  const { name, color } = INKS[k];
  const style = k === 'white' ? 'background:#fff;box-shadow:inset 0 0 0 1.5px #B8C4CE' : `background:${color}`;
  return `<span><i style="${style}"></i>${name}${k === 'white' ? '' : ` ${color}`}</span>`;
};

/** @param {object} d desain (lihat `karya1` di src/karya1.mjs) */
export function conceptSVG(d) {
  const artW = 690;
  const artH = (artW * 400) / 300;
  const list = d.points.map(
    ([t, d], i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><div><b>${t}</b><p>${d}</p></div></li>`,
  ).join('');
  const checks = CHECKS.map((c) => `<li>${c}</li>`).join('');
  const inks = d.inks ?? DEFAULT_INKS;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}">
  <rect width="${PW}" height="${PH}" fill="#FFFFFF"/>
  <rect width="820" height="${PH}" fill="${C.blue}"/>
  ${d.backSVG({ id: 'cp', guides: true, x: (820 - artW) / 2, y: (PH - artH) / 2, width: artW })}

  <foreignObject x="900" y="56" width="940" height="990">
    <div xmlns="http://www.w3.org/1999/xhtml" class="cp">
      <style>
        .cp{font-family:'Barlow',sans-serif;color:#23384D;}
        .cp .k{font-family:'Barlow Condensed';font-weight:700;font-size:22px;letter-spacing:5px;color:${C.blue};margin:0;}
        .cp h1{font-family:'${d.display.family}';font-style:${d.display.style};font-weight:${d.display.weight};font-size:${d.display.conceptSize ?? 84}px;line-height:1;margin:6px 0 18px;color:${C.navy};${d.display.upper ? 'text-transform:uppercase;' : ''}}
        .cp .lead{font-size:22px;line-height:1.45;font-weight:500;margin:0 0 26px;max-width:880px;}
        .cp ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:22px 34px;}
        .cp li{display:flex;gap:14px;align-items:flex-start;}
        .cp .n{font-family:'Barlow Condensed';font-weight:900;font-style:italic;font-size:30px;line-height:1;color:${C.red};min-width:38px;}
        .cp b{font-family:'Barlow Condensed';font-weight:800;font-size:25px;color:${C.navy};display:block;margin-bottom:3px;}
        .cp li p{margin:0;font-size:17px;line-height:1.42;font-weight:500;}
        .cp .spec{margin-top:30px;padding-top:20px;border-top:2px solid #E1E8EE;display:flex;gap:26px;flex-wrap:wrap;font-size:16px;font-weight:600;color:#5B6B7A;}
        .cp .chk{margin-top:26px;background:#F2F7FA;border-radius:14px;padding:20px 24px;}
        .cp .chk h2{font-family:'Barlow Condensed';font-weight:800;font-size:22px;letter-spacing:2px;color:${C.navy};margin:0 0 12px;}
        .cp .chk ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:9px 18px;}
        .cp .chk li{font-size:15px;font-weight:600;line-height:1.3;padding-left:26px;position:relative;}
        .cp .chk li::before{content:'✓';position:absolute;left:0;top:-1px;width:18px;height:18px;border-radius:50%;background:${C.blue};color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .cp .spec i{display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:-1px;margin-right:6px;font-style:normal;}
      </style>
      <p class="k">KONSEP DESAIN · 28UILD 2026</p>
      <h1>${d.title}</h1>
      <p class="lead">${d.lead}</p>
      <ol>${list}</ol>
      <div class="spec">
        <span><i style="background:${C.blue}"></i>Kaos Biru Habitat #0099CC</span>
        ${inks.map(inkChip).join('')}
        <span>Sablon ${inks.length} warna · Area cetak 30 × 40 cm</span>
      </div>
      <div class="chk"><h2>KETENTUAN KARYA</h2><ul>${checks}</ul></div>
    </div>
  </foreignObject>
</svg>`;
}
