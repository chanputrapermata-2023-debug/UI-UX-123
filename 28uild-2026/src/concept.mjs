// Halaman konsep / filosofi desain (1920 x 1080) untuk presentasi ke juri.
import { C } from './common.mjs';
import { backSVG } from './back.mjs';

export const PW = 1920;
export const PH = 1080;

const POINTS = [
  ['Rumah', 'Sumpah Pemuda lahir di sebuah rumah: Jl. Kramat Raya 106, Jakarta. Kini pemuda melanjutkannya dengan membangun rumah layak bagi sesama.'],
  ['Atap Merah Putih', 'Indonesia sebagai atap yang menaungi semua orang, dari mana pun asalnya.'],
  ['Tiga Tangan Berikrar', 'Tiga butir Sumpah Pemuda, sekaligus gotong royong mengangkat atap bersama. Setiap tangan memakai gelang merah putih: berbeda-beda, tetap satu.'],
  ['Fondasi Tiga Ikrar', 'Satu Tanah Air, Satu Bangsa, Satu Bahasa menjadi batu bata paling dasar. Persatuan adalah fondasi setiap rumah yang kita bangun.'],
  ['Sinar Semangat', 'Cahaya yang memancar dari dalam rumah melambangkan energi dan optimisme pemuda.'],
  ['1928 → 2026', 'Pemuda berikrar, pemuda membangun. Sejarah disambung dengan aksi nyata hari ini, ditutup tagline Together We Build Indonesia.'],
];

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

export function conceptSVG() {
  const artW = 690;
  const artH = (artW * 400) / 300;
  const list = POINTS.map(
    ([t, d], i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><div><b>${t}</b><p>${d}</p></div></li>`,
  ).join('');
  const checks = CHECKS.map((c) => `<li>${c}</li>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PW} ${PH}">
  <rect width="${PW}" height="${PH}" fill="#FFFFFF"/>
  <rect width="820" height="${PH}" fill="${C.blue}"/>
  ${backSVG({ id: 'cp', guides: true, x: (820 - artW) / 2, y: (PH - artH) / 2, width: artW })}

  <foreignObject x="900" y="56" width="940" height="990">
    <div xmlns="http://www.w3.org/1999/xhtml" class="cp">
      <style>
        .cp{font-family:'Barlow',sans-serif;color:#23384D;}
        .cp .k{font-family:'Barlow Condensed';font-weight:700;font-size:22px;letter-spacing:5px;color:${C.blue};margin:0;}
        .cp h1{font-family:'Barlow Condensed';font-style:italic;font-weight:900;font-size:84px;line-height:1;margin:6px 0 18px;color:${C.navy};}
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
      <h1>Rumah Persatuan</h1>
      <p class="lead">Pada 28 Oktober 1928, pemuda dari berbagai daerah berikrar menjadi satu di sebuah rumah di Kramat Raya 106. Hampir seabad kemudian, semangat yang sama hidup di 28UILD: pemuda bergotong royong membangun rumah layak untuk Indonesia.</p>
      <ol>${list}</ol>
      <div class="spec">
        <span><i style="background:${C.blue}"></i>Kaos Biru Habitat #0099CC</span>
        <span><i style="background:#fff;box-shadow:inset 0 0 0 1.5px #B8C4CE"></i>Putih</span>
        <span><i style="background:${C.red}"></i>Merah #DA291C</span>
        <span><i style="background:${C.navy}"></i>Biru Tua #0C2D5B</span>
        <span>Sablon 3 warna · Area cetak 30 × 40 cm</span>
      </div>
      <div class="chk"><h2>KETENTUAN KARYA</h2><ul>${checks}</ul></div>
    </div>
  </foreignObject>
</svg>`;
}
