// Karya 2 – "Seribu Atap, Satu Tanah Air".
// Rumah adat dari Sumatra sampai Papua berdiri di atas satu tanah merah putih,
// sementara pemuda membangun rumah baru di tengahnya.
// Semua koordinat dalam milimeter pada kanvas 300 x 400 mm (ukuran cetak maksimum).
import { C, f, W, H, CX, backFrame } from './common.mjs';

const G = 254; // garis tanah: semua rumah berdiri di sini
const DISPLAY = 'Fraunces';
const LABEL = 'Big Shoulders Display';

// ---------------------------------------------------------------- helper gambar
const rect = (x, y, w, h) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"/>`;
const path = (d) => `<path d="${d}"/>`;
const line = (d, w = 0.8) => `<path d="${d}" fill="none" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const posts = (xs, top, w, bottom = 0) => xs.map((x) => rect(x - w / 2, top, w, bottom - top)).join('');

// Setiap rumah: `solid` (putih) + `detail` (biru tua di atas putih). Titik (0,0) = tengah bawah, di garis tanah.
const HOUSES = {
  // Rumah Gadang – Sumatra Barat: atap bergonjong
  gadang: {
    w: 46,
    solid: [
      posts([-16, -9.6, -3.2, 3.2, 9.6, 16], -6, 1.8),
      rect(-17.5, -7, 35, 1.6),
      path('M-16.5,-5.5 L16.5,-5.5 L18,-18.5 L-18,-18.5Z'),
      path(
        'M-20.5,-18 Q-21.3,-23.5 -23,-31 Q-18.2,-24.6 -14.6,-24.4 Q-11,-24.8 -8.6,-38.6 Q-6,-29.2 0,-28.8 ' +
          'Q6,-29.2 8.6,-38.6 Q11,-24.8 14.6,-24.4 Q18.2,-24.6 23,-31 Q21.3,-23.5 20.5,-18Z',
      ),
    ],
    detail: [
      line('M-20.2,-18 L20.2,-18', 0.9),
      line('M-16.2,-8.6 L16.2,-8.6', 0.7),
      `<g stroke="none">${[-12, -6, 0, 6, 12].map((x) => rect(x - 1.6, -16, 3.2, 5)).join('')}</g>`,
    ],
  },
  // Joglo – Jawa: atap bertingkat, pendapa bertiang
  joglo: {
    w: 32,
    solid: [
      rect(-15, -3, 30, 3),
      posts([-11.5, -4, 4, 11.5], -16, 2.2, -3),
      path('M-16.5,-15.5 Q-12,-17.2 -9,-21.5 L-3.2,-33.5 L3.2,-33.5 L9,-21.5 Q12,-17.2 16.5,-15.5Z'),
    ],
    detail: [line('M-8.8,-21.5 L8.8,-21.5', 0.8), line('M-16,-15.6 L16,-15.6', 0.9), line('M0,-32.6 L0,-22.4', 0.6)],
  },
  // Rumah Betang – Kalimantan: rumah panjang di atas tiang tinggi
  betang: {
    w: 32,
    solid: [
      posts([-12, -7.2, -2.4, 2.4, 7.2, 12], -10, 1.6),
      rect(-13.5, -11.4, 27, 1.6),
      rect(-12.5, -18.6, 25, 7.4),
      path('M-15,-18 L-12.2,-25.5 L12.2,-25.5 L15,-18Z'),
      `<g fill="none" stroke="${C.white}" stroke-width="1.3" stroke-linecap="round">
        <path d="M-12.2,-25.3 Q-14.4,-26.8 -14.9,-30.3"/><path d="M12.2,-25.3 Q14.4,-26.8 14.9,-30.3"/>
        <path d="M-18,0 L-13,-11"/></g>`,
    ],
    detail: [
      `<g stroke="none">${rect(-1.8, -17.6, 3.6, 6.2)}${rect(-9.4, -16.6, 3.2, 2.8)}${rect(6.2, -16.6, 3.2, 2.8)}</g>`,
      line('M-14.4,-18 L14.4,-18', 0.8),
      line('M-13.3,-21.8 L13.3,-21.8', 0.6),
    ],
  },
  // Tongkonan – Sulawesi Selatan: atap perahu
  tongkonan: {
    w: 31,
    solid: [
      posts([-7, -2.4, 2.4, 7], -12.5, 2.2),
      path('M-8.5,-12 L8.5,-12 L9,-22.5 L-9,-22.5Z'),
      path(
        'M-21,-43.5 C-14,-37.6 -7,-36 0,-36 C7,-36 14,-37.6 21,-43.5 ' +
          'C17,-37.5 12,-26.5 8.8,-22 L-8.8,-22 C-12,-26.5 -17,-37.5 -21,-43.5Z',
      ),
      posts([-16.5, 16.5], -34.6, 1.5),
    ],
    detail: [
      line('M-7.6,-14.6 L-5.7,-18.8 L-3.8,-14.6 L-1.9,-18.8 L0,-14.6 L1.9,-18.8 L3.8,-14.6 L5.7,-18.8 L7.6,-14.6', 0.7),
      line('M-16.4,-39 C-11,-34.2 -5.5,-32.9 0,-32.9 C5.5,-32.9 11,-34.2 16.4,-39', 0.7),
      line('M-8.9,-22.1 L8.9,-22.1', 0.9),
    ],
  },
  // Mbaru Niang – Nusa Tenggara Timur: rumah kerucut
  mbaruNiang: {
    w: 18,
    solid: [
      path('M-8.5,-1.5 C-8.5,-13 -4.2,-28 0,-36.5 C4.2,-28 8.5,-13 8.5,-1.5Z'),
      rect(-6.5, -2, 13, 2),
      `<g fill="none" stroke="${C.white}" stroke-width="1.1" stroke-linecap="round">
        <path d="M0,-36 L0,-39.4"/><path d="M0,-39 Q-2.4,-39.8 -3,-42"/><path d="M0,-39 Q2.4,-39.8 3,-42"/></g>`,
    ],
    detail: [
      line('M-7.9,-9 Q0,-7.4 7.9,-9', 0.7),
      line('M-6.6,-17 Q0,-15.6 6.6,-17', 0.7),
      line('M-4.6,-25 Q0,-23.8 4.6,-25', 0.7),
      `<path stroke="none" d="M-1.9,-1.5 L-1.9,-5.4 Q0,-7.4 1.9,-5.4 L1.9,-1.5Z"/>`,
    ],
  },
  // Baileo – Maluku: balai terbuka beratap curam
  baileo: {
    w: 27,
    solid: [
      posts([-10, -5, 0, 5, 10], -8, 1.6),
      rect(-11.5, -9.4, 23, 1.6),
      posts([-9, -3, 3, 9], -15, 1.4, -9.4),
      path('M-13.5,-14.5 Q-8,-16.5 -5,-29 L5,-29 Q8,-16.5 13.5,-14.5Z'),
      `<g fill="none" stroke="${C.white}" stroke-width="1.1" stroke-linecap="round">
        <path d="M-5,-28.8 Q-6.6,-30.4 -6.8,-32.4"/><path d="M5,-28.8 Q6.6,-30.4 6.8,-32.4"/></g>`,
    ],
    detail: [line('M-13,-14.7 L13,-14.7', 0.9), line('M-2.2,-28.4 L-4.4,-15.4', 0.6), line('M2.2,-28.4 L4.4,-15.4', 0.6)],
  },
  // Honai – Papua: rumah bundar beratap kubah
  honai: {
    w: 20,
    solid: [rect(-7, -8, 14, 8), path('M-9.8,-7 C-9.8,-15.5 -5.2,-20 0,-20 C5.2,-20 9.8,-15.5 9.8,-7Z')],
    detail: [
      `<g stroke="none">${rect(-1.8, -5.4, 3.6, 5.4)}</g>`,
      line('M-9.6,-7.2 L9.6,-7.2', 0.9),
      line('M-8.4,-11 Q0,-9.4 8.4,-11', 0.7),
      line('M-6.2,-15.6 Q0,-14.2 6.2,-15.6', 0.7),
    ],
  },
};

function house(key, x, s = 1) {
  const h = HOUSES[key];
  return `<g transform="translate(${f(x)},${G}) scale(${s})">
    <g fill="${C.white}">${h.solid.join('')}</g>
    <g fill="${C.navy}" stroke="${C.navy}">${h.detail.join('')}</g>
  </g>`;
}

// ---------------------------------------------------------------- rumah yang sedang dibangun (tengah)
// Piktogram relawan: kepala, badan, tungkai (garis tebal membulat) + helm merah.
// `parts` digambar berurutan (belakang -> depan); tiap bagian diberi garis tepi sendiri
// supaya tungkai yang bersilangan tetap terbaca terpisah.
function volunteer(parts, helmet) {
  const [hx, hy, rot] = helmet;
  const layer = ([d, w]) =>
    `<path d="${d}" stroke="${C.navy}" stroke-width="${w + 1.5}"/><path d="${d}" stroke="${C.white}" stroke-width="${w}"/>`;
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${parts.map(layer).join('')}
      <circle cx="${hx}" cy="${hy}" r="3.15" fill="${C.navy}"/>
      <circle cx="${hx}" cy="${hy}" r="2.4" fill="${C.white}"/>
      <path transform="translate(${hx},${hy}) rotate(${rot})" d="M-2.9,-0.5 A2.9,2.9 0 0 1 2.9,-0.5 L4.3,-0.5 L4.3,0.5 L-2.9,0.5Z" fill="${C.red}" stroke="${C.navy}" stroke-width="0.5"/>
    </g>`;
}

function buildSite() {
  const wall = [rect(-24, -15, 19.5, 12.4), rect(4.5, -15, 19.5, 12.4)];
  // sambungan bata: tiga lapis, sambungan tegak berselang-seling
  const joints = [line('M-24,-6.73 L-4.5,-6.73 M4.5,-6.73 L24,-6.73 M-24,-10.87 L-4.5,-10.87 M4.5,-10.87 L24,-10.87', 0.55)];
  [
    [-6.73, -2.6, 0],
    [-10.87, -6.73, 3],
    [-15, -10.87, 0],
  ].forEach(([top, bottom, off]) => {
    for (let x = -21 + off; x < 24; x += 6) {
      if (Math.abs(x) > 5.5) joints.push(line(`M${x},${top} L${x},${bottom}`, 0.55));
    }
  });
  const ladderRungs = [];
  for (let t = 0.12; t < 0.98; t += 0.145) {
    const y = -31.5 * t;
    ladderRungs.push(`M${f(-38 + 9.5 * t)},${f(y)} L${f(-34.2 + 9.4 * t)},${f(y)}`);
  }
  return `<g transform="translate(${CX},${G})">
    <g fill="${C.white}">
      ${rect(-27, -2.6, 54, 2.6)}
      ${wall.join('')}
      ${posts([-22.1, 22.1], -30, 2.2, -15)}
      ${posts([-5.3, 5.3], -24.4, 1.6, -2.6)}
      ${rect(-6.1, -25.4, 12.2, 1.6)}
      ${rect(-25.5, -32.2, 51, 2.4)}
    </g>
    <g stroke="${C.white}" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-29.5,-31 L0,-55 L29.5,-31" stroke-width="2.4"/>
      <path d="M0,-55 L0,-32" stroke-width="2"/>
      <path d="M0,-34.5 L-12.6,-44.8 M0,-34.5 L12.6,-44.8" stroke-width="1.5"/>
      <path d="M0,-55 L0,-92" stroke-width="1.1"/>
      <path d="M-38,0 L-28.5,-31.5 M-34.2,0 L-24.8,-31.5 ${ladderRungs.join(' ')}" stroke-width="1"/>
    </g>
    <rect x="0.6" y="-92" width="15" height="5" fill="${C.red}"/>
    <rect x="0.6" y="-87" width="15" height="5" fill="${C.white}"/>
    <g stroke="${C.navy}" fill="none">${joints.join('')}</g>

    <!-- relawan di tangga, memaku kuda-kuda -->
    ${volunteer(
      [
        ['M-32.2,-19.6 L-33.4,-14.2 L-34.7,-8.8', 2.7],
        ['M-30.6,-26.8 L-27.6,-26.1', 2.3],
        ['M-32.2,-19.6 L-30.6,-27.4', 4.2],
        ['M-32.2,-19.6 L-28.6,-17.4 L-30.4,-13.2', 2.7],
        ['M-30.4,-26.6 L-27.4,-30.6 L-24,-34.6', 2.3],
      ],
      [-29.8, -30.8, 16],
    )}
    <g stroke-linecap="round" fill="none">
      <path d="M-24,-34.6 L-21.8,-37.8 M-23.5,-38.8 L-20,-36.7" stroke="${C.navy}" stroke-width="2.9"/>
      <path d="M-24,-34.6 L-21.8,-37.8 M-23.5,-38.8 L-20,-36.7" stroke="${C.white}" stroke-width="1.3"/>
    </g>

    <!-- relawan memikul papan -->
    <path d="M22.5,-18.8 L42.5,-16.6" stroke="${C.navy}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M22.5,-18.8 L42.5,-16.6" stroke="${C.white}" stroke-width="1.8" stroke-linecap="round"/>
    ${volunteer(
      [
        ['M34.1,-9.4 L35.9,-4.6 L38.5,0', 2.8],
        ['M33.1,-15.6 L35.9,-14.2 L37.7,-16.9', 2.4],
        ['M34.1,-9.4 L32.9,-16.6', 4.2],
        ['M34.1,-9.4 L31.9,-4.6 L29.1,0', 2.8],
        ['M32.9,-15.8 L30.1,-15.6 L27.5,-18.2', 2.4],
      ],
      [32.3, -19.8, -8],
    )}
  </g>`;
}

// ---------------------------------------------------------------- lanskap
function mountains() {
  const volcano = (x0, peak, x1, top) =>
    `<path d="M${x0},${G} C${x0 + (peak - x0) * 0.6},${G - 4} ${peak - 12},${G - top * 0.7} ${peak - 6},${G - top + 2} ` +
    `Q${peak},${G - top - 2} ${peak + 6},${G - top + 2} C${peak + 12},${G - top * 0.7} ${x1 - (x1 - peak) * 0.6},${G - 4} ${x1},${G}Z"/>`;
  return `<g fill="${C.navy}">${volcano(6, 77, 168, 58)}${volcano(132, 223, 294, 54)}</g>`;
}

// Alur lereng gunung: garis tipis yang dibolongkan (warna kaos terlihat).
function ridges() {
  const r = (peak, top) => {
    const y = G - top;
    return `<path d="M${peak - 3},${y + 5} Q${peak - 9},${y + 22} ${peak - 19},${y + 36}"/>
      <path d="M${peak + 3},${y + 5} Q${peak + 8},${y + 20} ${peak + 17},${y + 33}"/>
      <path d="M${peak},${y + 6} L${peak - 1},${y + 19}"/>`;
  };
  return `<g fill="none" stroke="#000" stroke-width="1.1" stroke-linecap="round">${r(77, 58)}${r(223, 54)}</g>`;
}

// Awan berlapis (terinspirasi mega mendung): tiga garis tepi sepusat.
function cloud(x, y, s, flip = false) {
  const d =
    'M-20,4 C-24.5,4 -24.5,-3 -18.5,-3 C-18.5,-9.5 -9.5,-11 -6.5,-6 C-4.5,-13.5 8,-13.5 9,-5 ' +
    'C13,-9.5 21.5,-6.5 19.5,-1 C24.5,0 23.5,4 19,4Z';
  const ring = (k) =>
    `<path d="${d}" transform="translate(0,${f(2.5 * (1 - k))}) scale(${k})" stroke-width="${f(1.15 / k)}"/>`;
  return `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})" fill="none" stroke="${C.white}" stroke-linejoin="round">
    ${ring(1)}${ring(0.68)}${ring(0.38)}</g>`;
}

function ground() {
  return `<rect x="6" y="${G}" width="288" height="4.2" fill="${C.red}"/>
    <rect x="6" y="${G + 5.2}" width="288" height="4.2" fill="${C.white}"/>`;
}

function waves() {
  const row = (x0, x1, y, phase) => {
    const L = 14;
    const a = 1.9;
    let d = `M${x0},${y}`;
    let up = phase;
    for (let x = x0; x + L / 2 <= x1 + 0.01; x += L / 2) {
      d += ` Q${f(x + L / 4)},${f(y + (up ? -a : a))} ${f(x + L / 2)},${y}`;
      up = !up;
    }
    return `<path d="${d}"/>`;
  };
  return `<g fill="none" stroke="${C.white}" stroke-width="1.5" stroke-linecap="round">
    ${row(10, 290, G + 17, true)}${row(31, 269, G + 25, false)}${row(59, 241, G + 33, true)}
  </g>`;
}

// ---------------------------------------------------------------- tipografi
const ARC_C = { x: CX, y: 562 }; // pusat busur judul

function arcPath(id, r, span = 40) {
  const a = (span * Math.PI) / 180;
  const x0 = ARC_C.x - r * Math.sin(a);
  const x1 = ARC_C.x + r * Math.sin(a);
  const y = ARC_C.y - r * Math.cos(a);
  return `<path id="${id}" d="M${f(x0)},${f(y)} A${r},${r} 0 0 1 ${f(x1)},${f(y)}"/>`;
}

// Pita bawah melengkung (senyum) untuk tagline.
const RIB = { cx: CX, cy: 350 - 620, r: 620, half: 9, x0: 36, x1: 264 };
const ribPt = (t, r) => [RIB.cx + r * Math.cos(t), RIB.cy + r * Math.sin(t)];

function ribbon(id) {
  const { r, half } = RIB;
  const tL = Math.acos((RIB.x0 - RIB.cx) / r);
  const tR = Math.acos((RIB.x1 - RIB.cx) / r);
  const P = (p) => p.map(f).join(',');
  const band = `M${P(ribPt(tL, r - half))} A${r - half},${r - half} 0 0 0 ${P(ribPt(tR, r - half))} L${P(ribPt(tR, r + half))} A${r + half},${r + half} 0 0 1 ${P(ribPt(tL, r + half))}Z`;

  // ekor pita di tiap ujung: bergeser turun, dengan lipatan biru tua
  const tail = (t, dir) => {
    const u = [-Math.sin(t) * dir, Math.cos(t) * dir]; // arah keluar sepanjang busur
    const n = [Math.cos(t), Math.sin(t)]; // arah radial ke luar (turun)
    const add = (p, v, k) => [p[0] + v[0] * k, p[1] + v[1] * k];
    const eIn = ribPt(t, r - half);
    const eOut = ribPt(t, r + half);
    const d = 5.5;
    const a = add(add(eIn, n, d), u, -6);
    const b = add(add(eOut, n, d), u, -6);
    const c = add(add(eOut, n, d), u, 17);
    const m = add(add(ribPt(t, r), n, d), u, 11);
    const e = add(add(eIn, n, d), u, 17);
    const fold = [eOut, add(eOut, n, d), add(add(eOut, n, d), u, -6)];
    return `<path d="M${P(a)} L${P(b)} L${P(c)} L${P(m)} L${P(e)}Z" fill="${C.red}"/>
      <path d="M${fold.map(P).join(' L')}Z" fill="${C.navy}"/>`;
  };
  const textR = r + 4.6;
  return {
    defs: `<path id="${id}" d="M${P(ribPt(tL + 0.02, textR))} A${textR},${textR} 0 0 0 ${P(ribPt(tR - 0.02, textR))}"/>`,
    svg: `${tail(tL, 1)}${tail(tR, -1)}
      <path d="${band}" fill="${C.red}"/>
      <text font-family="${LABEL}" font-weight="900" font-size="13.2" letter-spacing="1.5" fill="${C.white}">
        <textPath href="#${id}" startOffset="50%" text-anchor="middle">TOGETHER WE BUILD INDONESIA</textPath>
      </text>`,
  };
}

export function backSVG({ id = 'k2', ...frame } = {}) {
  const rib = ribbon(`${id}-rib`);
  const defs = `${arcPath(`${id}-arc`, 420)}${arcPath(`${id}-kick`, 452)}${rib.defs}
    <mask id="${id}-mtn" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
      <rect width="${W}" height="${H}" fill="#fff"/>${ridges()}
    </mask>`;
  return backFrame(
    frame,
    defs,
    `
  <text font-family="${LABEL}" font-weight="800" font-size="7.6" letter-spacing="2.6" fill="${C.white}">
    <textPath href="#${id}-kick" startOffset="50%" text-anchor="middle">KAMI PUTRA DAN PUTRI INDONESIA</textPath>
  </text>
  <text font-family="${DISPLAY}" font-weight="900" font-size="34" letter-spacing="0.8" fill="${C.white}">
    <textPath href="#${id}-arc" startOffset="50%" text-anchor="middle">SERIBU ATAP</textPath>
  </text>

  ${cloud(40, 179, 1)}
  ${cloud(261, 174, 0.9, true)}
  <g mask="url(#${id}-mtn)">${mountains()}</g>
  ${house('gadang', 30)}
  ${house('joglo', 69, 0.9)}
  ${house('betang', 99.5, 0.88)}
  ${buildSite()}
  ${house('tongkonan', 207, 0.86)}
  ${house('mbaruNiang', 231)}
  ${house('baileo', 254.5, 0.9)}
  ${house('honai', 279)}
  ${ground()}
  ${waves()}

  <text x="${CX}" y="322" text-anchor="middle" font-family="${DISPLAY}" font-weight="900" font-size="29" letter-spacing="0.6" fill="${C.white}">SATU TANAH AIR</text>
  ${rib.svg}
  <text x="${CX}" y="381" text-anchor="middle" font-family="${LABEL}" font-weight="700" font-size="7.2" letter-spacing="2.2" fill="${C.white}">SEMANGAT SUMPAH PEMUDA · 28 OKTOBER 1928</text>`,
  );
}

export const karya2 = {
  slug: 'karya-2-seribu-atap',
  title: 'Seribu Atap, Satu Tanah Air',
  display: { family: DISPLAY, style: 'normal', weight: 900, mockupSize: 50, conceptSize: 60 },
  sleeve: { family: LABEL, weight: 900 },
  lead: 'Pada 1928, pemuda dari berbagai daerah, dengan adat dan bahasanya masing-masing, berikrar menjadi satu bangsa. Desain ini merayakan keberagaman itu: seribu atap berbeda berdiri di atas satu tanah air, sementara pemuda hari ini bergotong royong membangun rumah baru untuk sesama.',
  points: [
    ['Seribu Atap', 'Rumah Gadang, Joglo, Betang, Tongkonan, Mbaru Niang, Baileo, dan Honai: rumah adat dari Sumatra sampai Papua, lambang pemuda dari berbagai daerah yang bersatu pada 1928.'],
    ['Satu Tanah Air', 'Semua rumah berdiri di atas satu pijakan merah putih. Tanah dan air, daratan dan lautan, menjadi satu Indonesia.'],
    ['Rumah yang Sedang Dibangun', 'Di tengah, relawan muda berhelm merah membangun rumah baru. Semangat Sumpah Pemuda diwujudkan lewat kerja nyata 28UILD.'],
    ['Merah Putih di Bubungan', 'Seperti tradisi pembangunan rumah di Indonesia, bendera Merah Putih dikibarkan saat rangka atap selesai dipasang.'],
    ['Gunung & Ombak', 'Pegunungan dan lautan Nusantara: laut tidak memisahkan pulau-pulau, justru menghubungkannya.'],
    ['Kami Putra dan Putri Indonesia', 'Kalimat pembuka ikrar 1928 memayungi seluruh desain, ditutup pita tagline Together We Build Indonesia.'],
  ],
  backSVG,
};
