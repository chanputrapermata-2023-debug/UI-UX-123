// Karya 1 – "Rumah Persatuan".
// Semua koordinat dalam milimeter pada kanvas 300 x 400 mm (ukuran cetak maksimum).
import { C, f, W, H, CX, backFrame } from './common.mjs';
const GAP = 1.6; // celah antar blok warna (memberi kesan stensil & aman untuk sablon)

// ---------------------------------------------------------------- atap merah putih
const PEAK = 112; // puncak tepi luar atap
const SLOPE = 0.62; // kemiringan atap
const EAVE = 128; // setengah bentang atap
const BAND = 12.5; // tebal vertikal tiap pita (merah / putih)
const roofY = (dx, off) => PEAK + off + SLOPE * Math.abs(dx);
const ROOF_IN = BAND * 2 + GAP; // tebal total atap
const innerY = (x) => roofY(x - CX, ROOF_IN);

function roofBand(top, bottom, fill) {
  const l = CX - EAVE;
  const r = CX + EAVE;
  const pts = [
    [l, roofY(-EAVE, top)],
    [CX, roofY(0, top)],
    [r, roofY(EAVE, top)],
    [r, roofY(EAVE, bottom)],
    [CX, roofY(0, bottom)],
    [l, roofY(-EAVE, bottom)],
  ];
  return `<polygon fill="${fill}" points="${pts.map((p) => p.map(f).join(',')).join(' ')}"/>`;
}

// ---------------------------------------------------------------- ruang rumah (biru tua)
const WALL = 100; // setengah lebar dinding
const FLOOR = 246; // garis atas fondasi
const room = () => {
  const l = CX - WALL;
  const r = CX + WALL;
  const pts = [
    [l, innerY(l) + GAP],
    [CX, innerY(CX) + GAP],
    [r, innerY(r) + GAP],
    [r, FLOOR - GAP],
    [l, FLOOR - GAP],
  ];
  return pts.map((p) => p.map(f).join(',')).join(' ');
};

// Sinar semangat: garis tipis yang dibolongkan dari ruang rumah (warna kaos terlihat).
function rays() {
  const ox = CX;
  const oy = FLOOR + 30;
  const out = [];
  for (let a = -168; a <= -12; a += 8) {
    const t = (a * Math.PI) / 180;
    const w = 0.9 * (Math.PI / 180);
    const R = 260;
    const p1 = [ox + R * Math.cos(t - w), oy + R * Math.sin(t - w)];
    const p2 = [ox + R * Math.cos(t + w), oy + R * Math.sin(t + w)];
    out.push(`<polygon points="${ox},${oy} ${p1.map(f).join(',')} ${p2.map(f).join(',')}"/>`);
  }
  return out.join('');
}

// ---------------------------------------------------------------- tangan berikrar
// Tangan kanan terbuka (telapak menghadap depan), pergelangan di (0,0), jari ke atas.
const FINGERS = [
  // [pusat x, ujung atas, rotasi] : kelingking, manis, tengah, telunjuk
  [-10.35, -39.5, -4],
  [-3.45, -46.8, -1.5],
  [3.45, -49.5, 0.5],
  [10.35, -46, 2],
];
const HAND = [
  // telapak + ibu jari dalam satu siluet
  'M-9.6,1 C-10.8,-4 -13.5,-9 -13.5,-16 L-13.5,-24 L13.5,-24 L13.5,-18.5 C15.4,-19.8 17.2,-23.4 18.5,-26.4 A3.9,3.9 0 0 1 25.6,-23.2 C23.9,-17.6 21.2,-10.6 17.2,-5.6 C14.4,-1.8 12,1 9.6,1Z',
  ...FINGERS.map(
    ([x, top, r]) =>
      `<path transform="rotate(${r} ${x} -22)" d="M${x - 2.9},-18 L${x - 2.9},${top + 2.9} A2.9,2.9 0 0 1 ${x + 2.9},${top + 2.9} L${x + 2.9},-18Z"/>`,
  ),
  // lengan bawah
  'M-9.6,0 L9.6,0 L11.2,90 L-11.2,90Z',
];
const TIP = 49.5; // panjang pergelangan -> ujung jari tengah

function handShapes() {
  return HAND.map((d) => (d.startsWith('<') ? d : `<path d="${d}"/>`)).join('');
}

// Letakkan tangan sehingga ujung jari tengah menyentuh atap di titik tipX.
function hand({ tipX, rot = 0, s = 1, mirror = false }) {
  const t = (rot * Math.PI) / 180;
  const tipY = innerY(tipX) + GAP + 1.2;
  // vektor pergelangan -> ujung jari setelah rotasi: (sin t, -cos t) * TIP * s
  const wx = tipX - Math.sin(t) * TIP * s;
  const wy = tipY + Math.cos(t) * TIP * s;
  const shapes = handShapes();
  return `<g transform="translate(${f(wx)},${f(wy)}) rotate(${rot}) scale(${mirror ? -s : s},${s})">
    <g fill="${C.navy}" stroke="${C.navy}" stroke-width="3.4" stroke-linejoin="round">${shapes}</g>
    <g fill="${C.white}">${shapes}</g>
    <path d="M-10.9,6 L10.9,6 L11,9 L-11,9Z" fill="${C.red}"/>
    <path d="M-11,9 L11,9 L11.1,12 L-11.1,12Z" fill="${C.white}" stroke="${C.navy}" stroke-width="0.7"/>
  </g>`;
}

// ---------------------------------------------------------------- fondasi: tiga ikrar
const ROW_H = 13.4;
const FOUND_L = CX - 114;
const FOUND_R = CX + 114;
const ROWS = [
  { text: 'SATU TANAH AIR', span: 158, lead: C.white },
  { text: 'SATU BANGSA', span: 132, lead: C.red },
  { text: 'SATU BAHASA', span: 180, lead: C.white },
];

function foundation(maskId) {
  const out = [];
  const knock = [];
  ROWS.forEach((row, i) => {
    const y = FLOOR + i * (ROW_H + GAP);
    const a = CX - row.span / 2;
    const b = CX + row.span / 2;
    const side = row.lead === C.white ? C.red : C.white;
    // batu bata samping
    const bricks = [
      [FOUND_L, a - GAP],
      [b + GAP, FOUND_R],
    ];
    // baris tengah dipecah jadi dua bata per sisi agar sambungan berselang-seling
    if (i === 1) {
      const m1 = (FOUND_L + a - GAP) / 2;
      const m2 = (b + GAP + FOUND_R) / 2;
      bricks.splice(0, 2, [FOUND_L, m1 - GAP / 2], [m1 + GAP / 2, a - GAP], [b + GAP, m2 - GAP / 2], [m2 + GAP / 2, FOUND_R]);
    }
    for (const [x0, x1] of bricks) {
      out.push(`<rect x="${f(x0)}" y="${f(y)}" width="${f(x1 - x0)}" height="${ROW_H}" fill="${side}"/>`);
    }
    out.push(`<rect x="${f(a)}" y="${f(y)}" width="${f(row.span)}" height="${ROW_H}" fill="${row.lead}"/>`);
    const txt = `<text x="${CX}" y="${f(y + ROW_H / 2 + 3.55)}" text-anchor="middle" font-family="Barlow Condensed" font-weight="800" font-size="10.2" letter-spacing="2.2">${row.text}</text>`;
    if (row.lead === C.white) knock.push(txt);
    else out.push(txt.replace('<text ', `<text fill="${C.white}" `));
  });
  return {
    svg: out.join(''),
    mask: `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/><g fill="#000">${knock.join('')}</g></mask>`,
  };
}
const FOUND_BOTTOM = FLOOR + 3 * ROW_H + 2 * GAP;

// ---------------------------------------------------------------- tahun 1928 / 2026
function yearTag(x, year, caption, anchor) {
  return `<g text-anchor="${anchor}">
    <text x="${x}" y="131" font-family="Barlow Condensed" font-style="italic" font-weight="900" font-size="28" fill="${C.white}">${year}</text>
    <text x="${x}" y="140" font-family="Barlow Condensed" font-weight="700" font-size="6.8" letter-spacing="1.2" fill="${C.white}">${caption}</text>
  </g>`;
}

// ---------------------------------------------------------------- susunan tipografi
function lockup() {
  const y0 = FOUND_BOTTOM + 14.6;
  return `
  <g font-family="Barlow Condensed" text-anchor="middle">
    <g stroke="${C.white}" stroke-width="0.9">
      <line x1="${CX - 128}" y1="${y0 - 2.7}" x2="${CX - 69}" y2="${y0 - 2.7}"/>
      <line x1="${CX + 69}" y1="${y0 - 2.7}" x2="${CX + 128}" y2="${y0 - 2.7}"/>
    </g>
    <text x="${CX + 1.2}" y="${y0}" font-weight="700" font-size="7.6" letter-spacing="2.4" fill="${C.white}">SEMANGAT SUMPAH PEMUDA</text>

    <text x="${CX}" y="${y0 + 27}" font-style="italic" font-weight="900" font-size="31" letter-spacing="0.4" fill="${C.white}">TOGETHER WE BUILD</text>

    <g font-style="italic" font-weight="900" font-size="58" letter-spacing="0.6">
      <text x="${CX + 2.4}" y="${y0 + 76.9}" fill="${C.red}">INDONESIA</text>
      <text x="${CX}" y="${y0 + 74.5}" fill="${C.white}">INDONESIA</text>
    </g>
  </g>`;
}

function footer() {
  return `<text x="${CX}" y="${H - 8}" text-anchor="middle" font-family="Special Elite" font-size="6.6" letter-spacing="0.3" fill="${C.white}">Lahir dari sebuah rumah · Kramat Raya 106 · 28.10.1928</text>`;
}

export function backSVG({ id = 'bk', ...frame } = {}) {
  const fnd = foundation(`${id}-found`);
  const defs = `
    ${fnd.mask}
    <clipPath id="${id}-room"><polygon points="${room()}"/></clipPath>
    <mask id="${id}-rays" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/><g fill="#000">${rays()}</g>
    </mask>`;
  return backFrame(
    frame,
    defs,
    `
  ${yearTag(CX - 118, '1928', 'PEMUDA BERIKRAR', 'start')}
  ${yearTag(CX + 118, '2026', 'PEMUDA MEMBANGUN', 'end')}

  <polygon points="${room()}" fill="${C.navy}" mask="url(#${id}-rays)"/>
  <g clip-path="url(#${id}-room)">
    ${hand({ tipX: CX - 50, rot: -21, s: 0.9 })}
    ${hand({ tipX: CX + 50, rot: 21, s: 0.9, mirror: true })}
    ${hand({ tipX: CX + 1.5, rot: 0, s: 1.04 })}
  </g>

  ${roofBand(0, BAND, C.red)}
  ${roofBand(BAND + GAP, ROOF_IN, C.white)}

  <g mask="url(#${id}-found)">${fnd.svg}</g>
  ${lockup()}
  ${footer()}`,
  );
}

export const karya1 = {
  slug: 'karya-1-rumah-persatuan',
  title: 'Rumah Persatuan',
  display: { family: 'Barlow Condensed', style: 'italic', weight: 900 },
  sleeve: { family: 'Barlow Condensed', weight: 800 },
  lead: 'Pada 28 Oktober 1928, pemuda dari berbagai daerah berikrar menjadi satu di sebuah rumah di Kramat Raya 106. Hampir seabad kemudian, semangat yang sama hidup di 28UILD: pemuda bergotong royong membangun rumah layak untuk Indonesia.',
  points: [
    ['Rumah', 'Sumpah Pemuda lahir di sebuah rumah: Jl. Kramat Raya 106, Jakarta. Kini pemuda melanjutkannya dengan membangun rumah layak bagi sesama.'],
    ['Atap Merah Putih', 'Indonesia sebagai atap yang menaungi semua orang, dari mana pun asalnya.'],
    ['Tiga Tangan Berikrar', 'Tiga butir Sumpah Pemuda, sekaligus gotong royong mengangkat atap bersama. Setiap tangan memakai gelang merah putih: berbeda-beda, tetap satu.'],
    ['Fondasi Tiga Ikrar', 'Satu Tanah Air, Satu Bangsa, Satu Bahasa menjadi batu bata paling dasar. Persatuan adalah fondasi setiap rumah yang kita bangun.'],
    ['Sinar Semangat', 'Cahaya yang memancar dari dalam rumah melambangkan energi dan optimisme pemuda.'],
    ['1928 → 2026', 'Pemuda berikrar, pemuda membangun. Sejarah disambung dengan aksi nyata hari ini, ditutup tagline Together We Build Indonesia.'],
  ],
  backSVG,
};
