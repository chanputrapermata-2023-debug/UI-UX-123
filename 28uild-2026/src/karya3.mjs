// Karya 3 – "Cetak Biru Indonesia".
// Sumpah Pemuda 1928 sebagai cetak biru bangsa: sebuah gambar kerja rumah (isometri)
// di atas kaos Biru Habitat yang berperan sebagai kertas cetak biru.
// Semua koordinat dalam milimeter pada kanvas 300 x 400 mm (ukuran cetak maksimum).
import { C, f, W, H, CX, backFrame } from './common.mjs';

const STENCIL = 'Saira Stencil One';
const MONO = 'Space Mono';

// ---------------------------------------------------------------- proyeksi isometri
const K = 1.42; // mm per satuan dunia
const C30 = Math.cos(Math.PI / 6);
const ORIGIN = [139, 209];
const iso = ([x, y, z]) => [ORIGIN[0] + K * (x - y) * C30, ORIGIN[1] + K * ((x + y) / 2 - z)];
const pt = (p) => iso(p).map(f).join(',');
const poly = (list) => `M${list.map(pt).join(' L')}Z`;
const seg = (a, b) => `M${pt(a)} L${pt(b)}`;

// ---------------------------------------------------------------- rumah
const L = 64; // panjang (sumbu x)
const D = 44; // lebar (sumbu y)
const WH = 34; // tinggi dinding
const PITCH = 1.05; // kemiringan atap > 45°, jadi sisi belakang atap tidak terlihat
const RIDGE = WH + (D / 2) * PITCH;
const OV = 3; // teritisan
const EAVE = RIDGE - (D / 2 + OV) * PITCH;
const T = 2.2; // tebal lisplang
const roofZ = (y) => RIDGE - Math.abs(y - D / 2) * PITCH;

// Jendela dengan kusen dan palang, pada bidang dinding tertentu.
function windowOn(plane, a0, a1, z0, z1) {
  const p = (a, z) => (plane === 'y' ? [a, D, z] : [L, a, z]);
  const am = (a0 + a1) / 2;
  const zm = (z0 + z1) / 2;
  return `<path d="${poly([p(a0, z0), p(a1, z0), p(a1, z1), p(a0, z1)])} ${seg(p(am, z0), p(am, z1))} ${seg(p(a0, zm), p(a1, zm))}" stroke-width="0.55"/>
    <path d="${seg(p(a0 - 1, z0 - 0.8), p(a1 + 1, z0 - 0.8))}" stroke-width="0.8"/>`;
}

// Lapisan bata: garis datar tiap `h` dan sambungan tegak berselang-seling.
function bricks(plane, a0, a1, zTop, skip = []) {
  const p = (a, z) => (plane === 'y' ? [a, D, z] : [L, a, z]);
  const h = 3;
  const out = [];
  const inSkip = (a) => skip.some(([s0, s1]) => a > s0 && a < s1);
  for (let z = h, row = 0; z <= zTop + 0.01; z += h, row++) {
    // garis datar, terputus di bukaan pintu
    const cuts = [a0, ...skip.flat(), a1];
    for (let i = 0; i < cuts.length; i += 2) out.push(seg(p(cuts[i], z), p(cuts[i + 1], z)));
    for (let a = a0 + (row % 2 ? 3 : 6); a < a1; a += 6) {
      if (!inSkip(a)) out.push(seg(p(a, z - h), p(a, z)));
    }
  }
  return `<path d="${out.join(' ')}" stroke-width="0.4"/>`;
}

// Bidang-bidang rumah, dari belakang ke depan. Setiap bidang menutupi garis bidang sebelumnya.
function faces() {
  const door = [26, 38, 24]; // x0, x1, tinggi
  const leafA = (62 * Math.PI) / 180;
  const leaf = [door[0] + 12 * Math.cos(leafA), D + 12 * Math.sin(leafA)];
  const tiles = [];
  for (let y = D / 2 + 3.2; y < D + OV - 0.5; y += 3.2) tiles.push(seg([-OV, y, roofZ(y)], [L + OV, y, roofZ(y)]));
  const vent = [];
  for (let i = 0; i <= 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    vent.push([L, D / 2 + 3.4 * Math.cos(t), WH + 8 + 3.4 * Math.sin(t)]);
  }
  return [
    { poly: [[-2, -2, 0], [L + 2, -2, 0], [L + 2, D + 2, 0], [-2, D + 2, 0]] },
    { poly: [[L + 2, -2, 0], [L + 2, D + 2, 0], [L + 2, D + 2, -4], [L + 2, -2, -4]] },
    { poly: [[L + 2, D + 2, 0], [-2, D + 2, 0], [-2, D + 2, -4], [L + 2, D + 2, -4]] },
    {
      poly: [[L, 0, 0], [L, D, 0], [L, D, WH], [L, D / 2, RIDGE], [L, 0, WH]],
      detail: `${windowOn('x', 16, 28, 13, 25)}<path d="${poly(vent)}" stroke-width="0.55"/>${bricks('x', 0, D, 9)}`,
    },
    {
      poly: [[0, D, 0], [L, D, 0], [L, D, WH], [0, D, WH]],
      detail: `${windowOn('y', 46, 58, 12, 24)}
        <path d="${poly([[door[0], D, 0], [door[1], D, 0], [door[1], D, door[2]], [door[0], D, door[2]]])}" fill="${C.white}" stroke="none"/>
        ${bricks('y', 0, L, 9, [[door[0], door[1]]])}`,
    },
    {
      poly: [[door[0], D, 0], [door[0], D, door[2]], [leaf[0], leaf[1], door[2]], [leaf[0], leaf[1], 0]],
      detail: `<path d="${seg([leaf[0] - 0.9, leaf[1] - 1.7, 11], [leaf[0] - 0.9, leaf[1] - 1.7, 13.5])}" stroke-width="0.9"/>`,
    },
    {
      poly: [[-OV, D / 2, RIDGE], [L + OV, D / 2, RIDGE], [L + OV, D + OV, EAVE], [-OV, D + OV, EAVE]],
      detail: `<path d="${tiles.join(' ')}" stroke-width="0.45"/>`,
    },
    { poly: [[-OV, D + OV, EAVE], [L + OV, D + OV, EAVE], [L + OV, D + OV, EAVE - T], [-OV, D + OV, EAVE - T]] },
    {
      poly: [
        [L + OV, -OV, EAVE],
        [L + OV, D / 2, RIDGE],
        [L + OV, D + OV, EAVE],
        [L + OV, D + OV, EAVE - T],
        [L + OV, D / 2, RIDGE - T],
        [L + OV, -OV, EAVE - T],
      ],
    },
  ];
}

// Gambar semua bidang: garis tiap bidang dimask oleh bidang-bidang di depannya.
function house(id) {
  const fs = faces();
  const masks = [];
  const layers = fs.map((face, i) => {
    const front = fs.slice(i + 1).map((g) => `<path d="${poly(g.poly)}"/>`).join('');
    const mid = `${id}-f${i}`;
    if (front) {
      masks.push(`<mask id="${mid}" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
        <rect width="${W}" height="${H}" fill="#fff"/><g fill="#000">${front}</g></mask>`);
    }
    return `<g ${front ? `mask="url(#${mid})"` : ''} fill="none" stroke="${C.white}" stroke-linejoin="round" stroke-linecap="round">
      <path d="${poly(face.poly)}" stroke-width="0.9"/>${face.detail ?? ''}</g>`;
  });
  const silhouette = `<g fill="#000">${fs.map((g) => `<path d="${poly(g.poly)}"/>`).join('')}</g>`;
  return { defs: masks.join(''), svg: layers.join(''), silhouette };
}

// ---------------------------------------------------------------- garis ukur: 1928 x 2026
function dimensions() {
  const tick = (p) => seg([p[0] - 1.3, p[1] - 1.3, 0], [p[0] + 1.3, p[1] + 1.3, 0]);
  const yx = D + 14;
  const xy = L + 14;
  const lines = [
    seg([0, D + 4, 0], [0, yx + 2, 0]),
    seg([L, D + 4, 0], [L, yx + 2, 0]),
    seg([0, yx, 0], [L, yx, 0]),
    tick([0, yx]),
    tick([L, yx]),
    seg([L + 5, 0, 0], [xy + 2, 0, 0]),
    seg([L + 5, D, 0], [xy + 2, D, 0]),
    seg([xy, 0, 0], [xy, D, 0]),
    tick([xy, 0]),
    tick([xy, D]),
  ];
  // teks rebah di bidang lantai, mengikuti arah garis ukurnya
  const tx = iso([L / 2, yx - 1.6, 0]);
  const ty = iso([xy - 1.6, D / 2, 0]);
  const text = (m, s) =>
    `<text transform="matrix(${m.map(f).join(' ')})" text-anchor="middle" font-family="${MONO}" font-weight="700" font-size="5.2" letter-spacing="0.6" fill="${C.white}">${s}</text>`;
  return `<path d="${lines.join(' ')}" fill="none" stroke="${C.white}" stroke-width="0.45" stroke-linecap="round"/>
    ${text([C30, 0.5, -C30, 0.5, tx[0], tx[1]], '1928')}
    ${text([C30, -0.5, C30, 0.5, ty[0], ty[1]], '2026')}`;
}

// ---------------------------------------------------------------- keterangan (callout)
function callout(target, elbow, end, label, desc, side) {
  const [tx, ty] = iso(target);
  const anchor = side === 'left' ? 'start' : 'end';
  const x = end[0];
  return `<g>
    <circle cx="${f(tx)}" cy="${f(ty)}" r="1" fill="${C.white}"/>
    <path d="M${f(tx)},${f(ty)} L${elbow[0]},${elbow[1]} L${end[0]},${end[1]}" fill="none" stroke="${C.white}" stroke-width="0.45"/>
    <text x="${x}" y="${end[1] - 1.8}" text-anchor="${anchor}" font-family="${MONO}" font-weight="700" font-size="5" fill="${C.white}">${label}</text>
    <text x="${x}" y="${end[1] + 5}" text-anchor="${anchor}" font-family="${MONO}" font-weight="700" font-size="3.8" fill="${C.white}">${desc}</text>
  </g>`;
}

const CALLOUTS = [
  [[6, 33, roofZ(33)], [62, 158], [18, 158], 'ATAP', 'MENAUNGI SEMUA', 'left'],
  [[28.8, D + 5.3, 12], [58, 214], [18, 214], 'PINTU', 'SELALU TERBUKA', 'left'],
  [[8, D, 4], [50, 252], [18, 252], 'DINDING', 'BATA DEMI BATA', 'left'],
  [[L + 2, 8, -2], [250, 234], [282, 234], 'FONDASI', 'SEMANGAT 1928', 'right'],
];
const callouts = () => CALLOUTS.map((c) => callout(...c)).join('');

// Area teks yang tidak boleh tertimpa tanda silang kisi: [x0, y0, x1, y1]
const KEEP_OUT = [
  ...CALLOUTS.map(([, , [x, y], , , side]) => (side === 'left' ? [x - 2, y - 9, x + 46, y + 8] : [x - 46, y - 9, x + 2, y + 8])),
  [254, 138, 282, 168], // mata angin
];

function northArrow(x, y) {
  return `<g fill="none" stroke="${C.white}" stroke-width="0.55">
    <circle cx="${x}" cy="${y}" r="7"/>
    <path d="M${x},${y - 9.5} L${x + 3},${y + 4} L${x},${y + 2} Z" fill="${C.white}" stroke="none"/>
    <path d="M${x},${y - 9.5} L${x - 3},${y + 4} L${x},${y + 2} Z" stroke-linejoin="round"/>
    <text x="${x}" y="${y - 11}" text-anchor="middle" font-family="${MONO}" font-weight="700" font-size="4.4" fill="${C.white}" stroke="none">U</text>
  </g>`;
}

// Tanda silang kisi gambar, disembunyikan di balik rumah.
function crosses() {
  const out = [];
  const free = (x, y) => !KEEP_OUT.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
  for (let x = 30; x <= 270; x += 20) {
    for (let y = 146; y <= 286; y += 20) {
      if (free(x, y)) out.push(`M${x - 1.2},${y} L${x + 1.2},${y} M${x},${y - 1.2} L${x},${y + 1.2}`);
    }
  }
  return `<path d="${out.join(' ')}" fill="none" stroke="${C.white}" stroke-width="0.4"/>`;
}

// ---------------------------------------------------------------- lembar gambar
const FR = { x0: 10, y0: 100, x1: 290, y1: 394 };

function header() {
  return `<text x="${CX}" y="123" text-anchor="middle" font-family="${STENCIL}" font-size="20.5" letter-spacing="0.6" fill="${C.white}">CETAK BIRU INDONESIA</text>
    <text x="${CX}" y="130" text-anchor="middle" font-family="${MONO}" font-weight="700" font-size="3.9" letter-spacing="0.5" fill="${C.white}">GAMBAR RENCANA · RUMAH UNTUK SEMUA · DIRANCANG 28.10.1928</text>
    <path d="M${FR.x0},134 L${FR.x1},134" stroke="${C.white}" stroke-width="0.6"/>`;
}

function taglineBand(id) {
  const y = 300;
  const h = 22;
  return {
    defs: `<mask id="${id}-tag" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/>
      <text x="${CX}" y="${y + 16}" text-anchor="middle" font-family="${STENCIL}" font-size="15.2" letter-spacing="0.8" fill="#000">TOGETHER WE BUILD INDONESIA</text>
    </mask>`,
    svg: `<rect x="${FR.x0 + 6}" y="${y}" width="${FR.x1 - FR.x0 - 12}" height="${h}" fill="${C.white}" mask="url(#${id}-tag)"/>`,
  };
}

function notes() {
  const x = 17;
  const line = (y, s, size = 4.2) =>
    `<text x="${x}" y="${y}" font-family="${MONO}" font-weight="700" font-size="${size}" fill="${C.white}">${s}</text>`;
  return `${line(335, 'CATATAN RANCANGAN', 5)}
    <path d="M${x},338 L118,338" stroke="${C.white}" stroke-width="0.45"/>
    ${line(345, 'KAMI PUTRA DAN PUTRI INDONESIA:')}
    ${line(353, '1. BERTUMPAH DARAH YANG SATU')}
    ${line(360.5, '2. BERBANGSA YANG SATU')}
    ${line(368, '3. MENJUNJUNG BAHASA PERSATUAN')}
    ${line(378, 'KONGRES PEMUDA II · 28.10.1928', 3.6)}`;
}

function titleBlock() {
  const x0 = 158;
  const x1 = FR.x1 - 6;
  const xm = 194;
  const y0 = 329;
  const rows = [
    ['PROYEK', 'RUMAH INDONESIA'],
    ['PERANCANG', 'PEMUDA INDONESIA, 1928'],
    ['PELAKSANA', 'RELAWAN 28UILD, 2026'],
    ['SKALA', '1 : 1 NUSANTARA'],
    ['NO. GAMBAR', '28'],
  ];
  const rh = 11.6;
  const grid = [`M${x0},${y0} L${x1},${y0} L${x1},${y0 + rows.length * rh} L${x0},${y0 + rows.length * rh}Z`, `M${xm},${y0} L${xm},${y0 + rows.length * rh}`];
  for (let i = 1; i < rows.length; i++) grid.push(`M${x0},${y0 + i * rh} L${x1},${y0 + i * rh}`);
  const cells = rows
    .map(
      ([k, v], i) =>
        `<text x="${x0 + 2.4}" y="${f(y0 + i * rh + 7.4)}" font-size="3.4">${k}</text>
         <text x="${xm + 2.6}" y="${f(y0 + i * rh + 7.9)}" font-size="4.6">${v}</text>`,
    )
    .join('');
  return `<path d="${grid.join(' ')}" fill="none" stroke="${C.white}" stroke-width="0.55"/>
    <g font-family="${MONO}" font-weight="700" fill="${C.white}">${cells}</g>`;
}

// Cap merah "SAH" Kongres Pemuda II.
function stamp(id, x, y) {
  const r = 12.6;
  return {
    defs: `<path id="${id}-stamp" d="M${-r},0 A${r},${r} 0 1 1 ${r},0 A${r},${r} 0 1 1 ${-r},0"/>`,
    svg: `<g transform="translate(${x},${y}) rotate(-14)" fill="${C.red}">
      <circle r="17" fill="none" stroke="${C.red}" stroke-width="1.3"/>
      <circle r="10.6" fill="none" stroke="${C.red}" stroke-width="0.7"/>
      <text font-family="${MONO}" font-weight="700" font-size="3.3" letter-spacing="0.42">
        <textPath href="#${id}-stamp" startOffset="0">KONGRES PEMUDA II • 28.10.1928 •</textPath>
      </text>
      <text y="2.9" text-anchor="middle" font-family="${STENCIL}" font-size="8.4">SAH</text>
    </g>`,
  };
}

export function backSVG({ id = 'k3', ...frame } = {}) {
  const hs = house(id);
  const tag = taglineBand(id);
  const st = stamp(id, 140, 356);
  const defs = `${hs.defs}${tag.defs}${st.defs}
    <mask id="${id}-grid" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/>${hs.silhouette}
    </mask>`;
  return backFrame(
    frame,
    defs,
    `
  <rect x="${FR.x0}" y="${FR.y0}" width="${FR.x1 - FR.x0}" height="${FR.y1 - FR.y0}" fill="none" stroke="${C.white}" stroke-width="0.9"/>
  ${header()}
  <g mask="url(#${id}-grid)">${crosses()}</g>
  ${hs.svg}
  ${dimensions()}
  ${callouts()}
  ${northArrow(268, 156)}
  ${tag.svg}
  ${notes()}
  ${titleBlock()}
  ${st.svg}`,
  );
}

export const karya3 = {
  slug: 'karya-3-cetak-biru',
  title: 'Cetak Biru Indonesia',
  display: { family: STENCIL, style: 'normal', weight: 400, mockupSize: 52, conceptSize: 72, upper: true },
  sleeve: { family: STENCIL, weight: 400, size: 21 },
  inks: ['white', 'red'],
  lead: 'Sebelum Indonesia merdeka, para pemuda sudah merancangnya. Pada 28 Oktober 1928, Sumpah Pemuda menjadi cetak biru sebuah bangsa. Hampir seabad kemudian, relawan 28UILD mewujudkan rancangan itu menjadi rumah-rumah nyata, bata demi bata.',
  points: [
    ['Cetak Biru Bangsa', 'Sumpah Pemuda adalah rancangan Indonesia yang dibuat pemuda, 17 tahun sebelum kemerdekaan. Kaos Biru Habitat menjadi kertas cetak birunya.'],
    ['Gambar Kerja Rumah', 'Rumah digambar sebagai gambar teknik isometri lengkap dengan garis ukur dan keterangan: rencana yang siap dibangun bersama.'],
    ['Ukuran 1928 × 2026', 'Angka pada garis ukur adalah dua tahun penting: 1928 saat rancangan dibuat, 2026 saat pemuda membangunnya.'],
    ['Pintu yang Terbuka', 'Pintu digambar terbuka dan bercahaya, sejalan dengan semangat Let’s Open The Door: rumah layak untuk semua.'],
    ['Catatan & Cap Sah', 'Tiga ikrar Sumpah Pemuda tercantum sebagai catatan rancangan, disahkan cap merah Kongres Pemuda II, 28.10.1928.'],
    ['Together We Build Indonesia', 'Tagline tampil sebagai judul gambar: rancangan para pemuda dibangun bersama, dari dulu hingga sekarang.'],
  ],
  backSVG,
};
