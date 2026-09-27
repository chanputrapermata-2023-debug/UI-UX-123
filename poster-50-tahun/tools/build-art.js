// Builds poster-art.svg: every non-text layer of the remastered poster (A3, 1123x1587).
// Text (title, subtitle, tagline) and the two logos are live layers in the artboard.
const fs = require('fs');
const path = require('path');
const opentype = require('opentype.js');

const OPT = Object.assign({ penjor: true, out: path.join(__dirname, '..', 'poster-art.svg') }, JSON.parse(process.argv[2] || '{}'));

const W = 1123, H = 1587, CX = W / 2;
const n = (v) => Math.round(v * 100) / 100;
const poly = (pts, close = true) => pts.map(([x, y], i) => (i ? 'L' : 'M') + n(x) + ',' + n(y)).join(' ') + (close ? ' Z' : '');
const rng = (seed) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const lerp = (a, b, t) => a + (b - a) * t;

function bez(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
          u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
}
const sampleBez = (seg, N = 240) => Array.from({ length: N + 1 }, (_, i) => bez(...seg, i / N));
function yAt(samples, x) {
  for (let i = 1; i < samples.length; i++) {
    const [x0, y0] = samples[i - 1], [x1, y1] = samples[i];
    if ((x >= x0 && x <= x1) || (x <= x0 && x >= x1)) return y0 + (y1 - y0) * ((x - x0) / ((x1 - x0) || 1));
  }
  return samples[x < samples[0][0] ? 0 : samples.length - 1][1];
}
function catmull(points, seg = 18) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}
// variable-width ribbon along a polyline
function ribbon(center, wFn) {
  const L = [], R = [], N = center.length;
  for (let i = 0; i < N; i++) {
    const a = center[Math.max(0, i - 1)], b = center[Math.min(N - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
    const w = wFn(i / (N - 1)) / 2;
    L.push([center[i][0] - dy * w, center[i][1] + dx * w]);
    R.push([center[i][0] + dy * w, center[i][1] - dx * w]);
  }
  return poly(L.concat(R.reverse()));
}
function pointAndNormal(poly, t) {
  const i = Math.min(poly.length - 2, Math.max(0, Math.floor(t * (poly.length - 1))));
  const a = poly[i], b = poly[i + 1];
  let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
  const f = t * (poly.length - 1) - i;
  return { p: [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], tan: [dx, dy], nor: [-dy, dx] };
}
const star4 = (x, y, s, fill, op = 1, thin = 0.14) => {
  const k = s * thin;
  return `<path d="M${n(x)},${n(y - s)} C${n(x + k)},${n(y - k)} ${n(x + k)},${n(y - k)} ${n(x + s)},${n(y)} C${n(x + k)},${n(y + k)} ${n(x + k)},${n(y + k)} ${n(x)},${n(y + s)} C${n(x - k)},${n(y + k)} ${n(x - k)},${n(y + k)} ${n(x - s)},${n(y)} C${n(x - k)},${n(y - k)} ${n(x - k)},${n(y - k)} ${n(x)},${n(y - s)} Z" fill="${fill}" opacity="${op}"/>`;
};

const defs = [];
const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, extra = '') =>
  defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${extra}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`);
const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5, extra = '') =>
  defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${extra}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`);
const blur = (id, sd) => defs.push(`<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sd}"/></filter>`);
[2, 4, 8, 14, 24, 40].forEach((s) => blur('b' + s, s));

// ---------------------------------------------------------------- palette
const GOLD = { hi: '#FFF3C4', light: '#F8D98A', mid: '#E6B650', deep: '#B98126', dark: '#7C5214' };
lg('gGoldH', [[0, '#A8741F'], [0.18, '#F3CE70'], [0.42, '#FFF0B8'], [0.62, '#E2AE48'], [0.85, '#F6D27A'], [1, '#A8741F']], 0, 0, 1, 0);
lg('gGoldV', [[0, '#FFF0B8'], [0.45, '#EFC766'], [1, '#B98126']]);
lg('gGoldRim', [[0, '#FFF1BE'], [0.3, '#EDC15D'], [0.55, '#B98126'], [0.75, '#F7D680'], [1, '#9C6A1C']], 0, 0, 1, 1);

// ---------------------------------------------------------------- layout constants
const DROP = { cx: CX, R: 262, bottom: 1193, k: 1.6 };
DROP.cy = DROP.bottom - DROP.R;          // 931
DROP.tip = DROP.cy - DROP.k * DROP.R;     // ~512
const PIPE = { y: 1224, r: 25 };
const BAND = 1330;

function dropPath(cx, tipY, cy, R) {
  const k = 0.5523 * R;
  const c1 = [cx + 0.30 * R, tipY + 0.55 * R], c2 = [cx + R, cy - 0.50 * R];
  return `M${n(cx)},${n(tipY)} C${n(c1[0])},${n(c1[1])} ${n(c2[0])},${n(c2[1])} ${n(cx + R)},${n(cy)} ` +
    `C${n(cx + R)},${n(cy + k)} ${n(cx + k)},${n(cy + R)} ${n(cx)},${n(cy + R)} ` +
    `C${n(cx - k)},${n(cy + R)} ${n(cx - R)},${n(cy + k)} ${n(cx - R)},${n(cy)} ` +
    `C${n(2 * cx - c2[0])},${n(c2[1])} ${n(2 * cx - c1[0])},${n(c1[1])} ${n(cx)},${n(tipY)} Z`;
}
const dropD = dropPath(DROP.cx, DROP.tip, DROP.cy, DROP.R);
const dropInner = dropPath(DROP.cx, DROP.tip + 17, DROP.cy, DROP.R - 9);
const dropOuter = dropPath(DROP.cx, DROP.tip - 20, DROP.cy, DROP.R + 11);
defs.push(`<clipPath id="cDrop"><path d="${dropD}"/></clipPath>`);
defs.push(`<clipPath id="cAboveBand"><rect x="0" y="0" width="${W}" height="${BAND}"/></clipPath>`);

const out = [];
const add = (s) => out.push(s);

// ================================================================ BACKGROUND
lg('gSky', [[0, '#060E26'], [0.28, '#0B1B45'], [0.55, '#10285C'], [0.8, '#0C2150'], [1, '#081636']]);
add(`<rect width="${W}" height="${H}" fill="url(#gSky)"/>`);
rg('gHalo', [[0, '#2A6CA8', 0.55], [0.45, '#1B4C86', 0.28], [1, '#10285C', 0]]);
add(`<ellipse cx="${CX}" cy="${DROP.cy - 40}" rx="620" ry="560" fill="url(#gHalo)"/>`);
rg('gWarm', [[0, '#F4C76A', 0.30], [0.5, '#E8B24E', 0.10], [1, '#E8B24E', 0]]);
add(`<ellipse cx="${CX}" cy="455" rx="300" ry="190" fill="url(#gWarm)"/>`);

// ripple rings (fade out toward the top)
defs.push(`<linearGradient id="gRingFade" gradientUnits="userSpaceOnUse" x1="0" y1="330" x2="0" y2="1300"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.42" stop-color="#fff" stop-opacity="0.2"/><stop offset="0.75" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>`);
defs.push(`<mask id="mRing"><rect width="${W}" height="${H}" fill="url(#gRingFade)"/></mask>`);
{
  const rings = [318, 372, 440, 520, 612, 716, 830];
  add(`<g mask="url(#mRing)" fill="none">` + rings.map((r, i) =>
    `<circle cx="${CX}" cy="${DROP.cy}" r="${r}" stroke="#7CC4E4" stroke-width="${i % 2 ? 1 : 1.4}" stroke-opacity="${n(0.2 - i * 0.022)}"${i % 3 === 2 ? ' stroke-dasharray="2 7"' : ''}/>`).join('') + `</g>`);
}

// stars
{
  const r = rng(7);
  const zones = [[40, 300, 250, 1080], [873, 300, 1083, 1080], [60, 60, 240, 300], [883, 60, 1063, 300], [250, 330, 380, 520], [743, 330, 873, 520]];
  let s = '';
  zones.forEach(([x0, y0, x1, y1], zi) => {
    const count = zi < 2 ? 9 : 3;
    for (let i = 0; i < count; i++) {
      const x = lerp(x0, x1, r()), y = lerp(y0, y1, r());
      const big = r() < 0.3;
      if (big) s += star4(x, y, 5 + r() * 5, r() < 0.5 ? '#F7DC8F' : '#E9F4FF', 0.85);
      else s += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.8 + r() * 1.3)}" fill="#DCEBFF" opacity="${n(0.35 + r() * 0.5)}"/>`;
    }
  });
  add(s);
}

// ================================================================ PENJOR FRAME (gold line art)
lg('gPole', [[0, '#8C5E1A'], [0.5, '#F2CD72'], [1, '#FFF0BE']], 0, 1, 0, 0);
function penjor(mirror) {
  const base = [104, 1172], c1 = [88, 860], c2 = [120, 505], tip = [268, 404];
  const curve = sampleBez([base, c1, c2, tip], 300);
  let g = '';
  // janur fringe: hanging leaves under the arc
  for (let i = 0; i <= 26; i++) {
    const t = 0.50 + i * 0.018;
    if (t > 0.985) break;
    const { p, nor } = pointAndNormal(curve, t);
    const len = 16 + 9 * Math.sin(i * 1.3) + (i % 2 ? 6 : 0);
    const x = p[0] + nor[0] * -2, y = p[1] + 2;
    g += `<path d="M${n(x)},${n(y)} C${n(x - 3)},${n(y + len * 0.45)} ${n(x - 1.5)},${n(y + len * 0.8)} ${n(x + 1)},${n(y + len)} C${n(x + 2.5)},${n(y + len * 0.7)} ${n(x + 2)},${n(y + len * 0.4)} ${n(x)},${n(y)} Z" fill="#E9C46A" opacity="${i % 2 ? 0.75 : 0.95}"/>`;
  }
  // fine outer fringe on the convex side
  for (let i = 0; i <= 40; i++) {
    const t = 0.36 + i * 0.0155;
    if (t > 0.99) break;
    const { p, nor } = pointAndNormal(curve, t);
    const len = 7 + (i % 3) * 2;
    g += `<line x1="${n(p[0] + nor[0] * 3)}" y1="${n(p[1] + nor[1] * 3)}" x2="${n(p[0] + nor[0] * (3 + len) - 2)}" y2="${n(p[1] + nor[1] * (3 + len) - 3)}" stroke="#F3D37E" stroke-width="1.3" stroke-linecap="round" opacity="0.8"/>`;
  }
  // pole
  g += `<path d="${ribbon(curve, (t) => lerp(7.5, 2.2, t))}" fill="url(#gPole)"/>`;
  // bamboo nodes
  for (let i = 1; i < 9; i++) {
    const t = i * 0.055;
    const { p, nor } = pointAndNormal(curve, t);
    const w = lerp(7.5, 2.2, t) / 2 + 1.2;
    g += `<line x1="${n(p[0] - nor[0] * w)}" y1="${n(p[1] - nor[1] * w)}" x2="${n(p[0] + nor[0] * w)}" y2="${n(p[1] + nor[1] * w)}" stroke="#8C5E1A" stroke-width="1.2"/>`;
  }
  // sanggah (little shrine) on the pole
  {
    const { p } = pointAndNormal(curve, 0.16);
    const [x, y] = p;
    g += `<g transform="translate(${n(x)},${n(y)})">` +
      `<path d="M-15,-30 L15,-30 L11,-40 L-11,-40 Z" fill="#E6B650"/>` +
      `<rect x="-11" y="-30" width="22" height="18" fill="none" stroke="#E6B650" stroke-width="1.6"/>` +
      `<rect x="-6" y="-26" width="12" height="10" fill="#E6B650" opacity="0.55"/>` +
      `<rect x="-14" y="-12" width="28" height="3" fill="#E6B650"/>` +
      `<path d="M0,-40 L0,-47" stroke="#E6B650" stroke-width="1.6"/>` +
      `</g>`;
  }
  // lamak (hanging panel)
  {
    const { p } = pointAndNormal(curve, 0.30);
    const [x, y] = p;
    g += `<g transform="translate(${n(x + 3)},${n(y)})">` +
      `<rect x="-2" y="-2" width="20" height="3" fill="#E6B650"/>` +
      `<path d="M0,0 L16,0 L16,64 L8,74 L0,64 Z" fill="none" stroke="#E6B650" stroke-width="1.5"/>` +
      [8, 20, 32, 44].map((yy) => `<path d="M3,${yy} L8,${yy + 7} L13,${yy} Z" fill="#E6B650" opacity="0.8"/>`).join('') +
      `<circle cx="8" cy="58" r="2.2" fill="#E6B650"/>` +
      `</g>`;
  }
  // tamiang (round ornament)
  {
    const { p } = pointAndNormal(curve, 0.43);
    const [x, y] = p;
    let rays = '';
    for (let a = 0; a < 16; a++) {
      const ang = (a / 16) * Math.PI * 2;
      rays += `<line x1="${n(Math.cos(ang) * 5)}" y1="${n(Math.sin(ang) * 5)}" x2="${n(Math.cos(ang) * 11)}" y2="${n(Math.sin(ang) * 11)}" stroke="#E6B650" stroke-width="1"/>`;
    }
    g += `<g transform="translate(${n(x + 17)},${n(y + 16)})"><path d="M-17,-16 L-2,-6" stroke="#E6B650" stroke-width="1.2"/><circle r="12" fill="none" stroke="#E6B650" stroke-width="1.5"/>${rays}<circle r="3" fill="#E6B650"/></g>`;
  }
  // sampian hanging from the tip
  {
    const [x, y] = tip;
    g += `<path d="M${x},${y} L${x},${y + 30}" stroke="#E6B650" stroke-width="1.3"/>` +
      `<g transform="translate(${x},${y + 30})">` +
      `<path d="M0,0 C-16,4 -20,24 -8,36 C-12,24 -8,12 0,8 C8,12 12,24 8,36 C20,24 16,4 0,0 Z" fill="url(#gGoldV)"/>` +
      `<path d="M0,8 L0,46" stroke="#E6B650" stroke-width="1.3"/>` +
      `<path d="M-6,38 C-7,48 -5,56 -3,62 M6,38 C7,48 5,56 3,62 M0,46 L0,66" stroke="#E6B650" stroke-width="1.1" fill="none" stroke-linecap="round"/>` +
      `<circle cx="0" cy="48" r="3" fill="#FFF0BE"/>` +
      `</g>`;
  }
  return `<g${mirror ? ` transform="translate(${W},0) scale(-1,1)"` : ''} opacity="0.92">${g}</g>`;
}
if (OPT.penjor) { add(penjor(false)); add(penjor(true)); }

// ================================================================ LOWER LANDSCAPE (horizon, water)
{
  // far hills silhouette
  const hills = catmull([[-20, 1150], [90, 1128], [200, 1142], [330, 1118], [450, 1140], [CX, 1132], [673, 1140], [793, 1118], [923, 1142], [1033, 1128], [1143, 1150]], 14);
  lg('gHill', [[0, '#12305F'], [1, '#0A1B3D']]);
  add(`<path d="${poly([...hills, [1143, 1360], [-20, 1360]])}" fill="url(#gHill)"/>`);
  add(`<path d="${poly(hills, false)}" fill="none" stroke="#3B84BA" stroke-width="1.4" stroke-opacity="0.45"/>`);
  // silhouettes on the horizon: meru + palms (left), candi bentar + palms (right)
  const sil = '#0A1A3A';
  const meru = (x, y, s) => {
    let d = `<g transform="translate(${x},${y}) scale(${s})" fill="${sil}">`;
    d += `<rect x="-14" y="-18" width="28" height="18"/>`;
    const tiers = [[34, 9], [28, 8], [22, 7], [16, 6], [10, 5]];
    let yy = -18;
    tiers.forEach(([w, h]) => { d += `<path d="M${-w / 2},${yy} L${w / 2},${yy} L${w / 2 - 6},${yy - h} L${-w / 2 + 6},${yy - h} Z"/><rect x="-3" y="${yy - h - 4}" width="6" height="4"/>`; yy -= h + 4; });
    d += `<rect x="-1" y="${yy - 8}" width="2" height="8"/></g>`;
    return d;
  };
  const palm = (x, y, h, lean, s = 1) => {
    const top = [x + lean, y - h];
    let d = `<path d="M${x - 3 * s},${y} C${x - 2},${y - h * 0.5} ${top[0] - 3},${top[1] + h * 0.25} ${top[0] - 1.5 * s},${top[1]} L${top[0] + 1.5 * s},${top[1]} C${top[0] + 2},${top[1] + h * 0.25} ${x + 3},${y - h * 0.5} ${x + 3 * s},${y} Z" fill="${sil}"/>`;
    const fr = [[-34, 8], [-26, -8], [-12, -14], [12, -14], [26, -8], [34, 8], [0, -18]];
    fr.forEach(([dx, dy]) => {
      const ex = top[0] + dx * s, ey = top[1] + dy * s + 10;
      d += `<path d="M${n(top[0])},${n(top[1])} Q${n(top[0] + dx * 0.5 * s)},${n(top[1] + dy * s - 6)} ${n(ex)},${n(ey)} Q${n(top[0] + dx * 0.55 * s)},${n(top[1] + dy * 0.6 * s)} ${n(top[0])},${n(top[1] + 3)} Z" fill="${sil}"/>`;
    });
    return d;
  };
  const gate = (x, y, s) => {
    let d = `<g transform="translate(${x},${y}) scale(${s})" fill="${sil}">`;
    [[-1], [1]].forEach(([m]) => {
      const steps = [[26, 20], [20, 22], [24, 5], [17, 8], [20, 4], [13, 7], [15, 4], [9, 6], [5, 8]];
      let yy = 0;
      steps.forEach(([w, h]) => { const x0 = m < 0 ? -5 - w : 5; d += `<rect x="${x0}" y="${yy - h}" width="${w}" height="${h}"/>`; yy -= h; });
    });
    return d + '</g>';
  };
  add(meru(186, 1136, 1.05) + meru(236, 1140, 0.8) + palm(56, 1150, 70, -6, 1.1) + palm(290, 1136, 52, 5, 0.85) +
      gate(946, 1140, 1.05) + palm(1066, 1150, 74, 7, 1.1) + palm(846, 1138, 50, -4, 0.85) + meru(1010, 1146, 0.7));
  // water surface
  lg('gWater', [[0, '#0E2B5C'], [1, '#081835']]);
  add(`<rect x="0" y="1168" width="${W}" height="${BAND - 1168 + 4}" fill="url(#gWater)"/>`);
  let lines = '';
  const r = rng(21);
  for (let i = 0; i < 16; i++) {
    const y = 1180 + i * 10 + r() * 4;
    const amp = 2 + r() * 2.5, ph = r() * 6;
    const pts = [];
    for (let x = -10; x <= W + 10; x += 20) pts.push([x, y + Math.sin(x / 70 + ph) * amp]);
    const segs = [];
    // break the line into dashes of various lengths
    let x = -10;
    while (x < W) {
      const len = 60 + r() * 220, gap = 20 + r() * 70;
      segs.push([x, Math.min(W + 10, x + len)]);
      x += len + gap;
    }
    segs.forEach(([a, b]) => {
      const seg = pts.filter((p) => p[0] >= a && p[0] <= b);
      if (seg.length > 1) lines += `<path d="${poly(seg, false)}"/>`;
    });
  }
  add(`<g fill="none" stroke="#5FB2E0" stroke-width="1.2" stroke-opacity="0.22" stroke-linecap="round">${lines}</g>`);
  // light reflection column under the coupling
  rg('gReflect', [[0, '#7FF1E6', 0.55], [0.5, '#4FC9D6', 0.18], [1, '#4FC9D6', 0]]);
  add(`<ellipse cx="${CX}" cy="${1290}" rx="120" ry="70" fill="url(#gReflect)"/>`);
}

// ================================================================ DROP GLOW (behind)
add(`<path d="${dropD}" fill="none" stroke="#4FD6D0" stroke-width="46" stroke-opacity="0.16" filter="url(#b24)"/>`);
add(`<path d="${dropD}" fill="none" stroke="#F3C969" stroke-width="16" stroke-opacity="0.38" filter="url(#b8)"/>`);

// ================================================================ DROP SCENE
const scene = [];
const S = (s) => scene.push(s);
const L = DROP.cx - DROP.R - 12, Rr = DROP.cx + DROP.R + 12; // scene x range
const HORIZON = 902, NEAR = 948;
{
  // sky
  defs.push(`<linearGradient id="gSceneSkyU" gradientUnits="userSpaceOnUse" x1="0" y1="${DROP.tip}" x2="0" y2="${HORIZON + 10}"><stop offset="0" stop-color="#1D6A99"/><stop offset="0.3" stop-color="#3F98BE"/><stop offset="0.62" stop-color="#8ACCD7"/><stop offset="0.86" stop-color="#EFE5BF"/><stop offset="1" stop-color="#FAD69C"/></linearGradient>`);
  S(`<rect x="${L}" y="${DROP.tip - 20}" width="${Rr - L}" height="${DROP.bottom - DROP.tip + 40}" fill="url(#gSceneSkyU)"/>`);
  // sun + glow
  const sun = [CX + 178, 800];
  rg('gSunGlow', [[0, '#FFE7A8', 0.85], [0.3, '#FFDC95', 0.4], [1, '#FFD890', 0]]);
  S(`<circle cx="${sun[0]}" cy="${sun[1]}" r="104" fill="url(#gSunGlow)"/>`);
  S(`<circle cx="${sun[0]}" cy="${sun[1]}" r="27" fill="#FFF0C2"/><circle cx="${sun[0]}" cy="${sun[1]}" r="21" fill="#FFF8E2"/>`);
  // clouds
  const cloud = (x, y, w, op) => {
    const h = w * 0.28;
    return `<g opacity="${op}"><path d="M${x - w / 2},${y} C${x - w / 2},${y - h * 0.9} ${x - w * 0.22},${y - h * 1.05} ${x - w * 0.12},${y - h * 0.62} C${x - w * 0.06},${y - h * 1.5} ${x + w * 0.22},${y - h * 1.55} ${x + w * 0.24},${y - h * 0.7} C${x + w * 0.36},${y - h * 1.1} ${x + w / 2},${y - h * 0.7} ${x + w / 2},${y} Z" fill="#FFFFFF"/>` +
      `<path d="M${x - w / 2},${y} L${x + w / 2},${y} C${x + w * 0.3},${y + h * 0.18} ${x - w * 0.3},${y + h * 0.18} ${x - w / 2},${y} Z" fill="#D6ECF1"/></g>`;
  };
  S(cloud(CX - 92, 640, 116, 0.92) + cloud(CX + 112, 722, 96, 0.85) + cloud(CX - 205, 776, 70, 0.7) + cloud(CX + 30, 598, 54, 0.55));
  // birds
  S(`<g fill="none" stroke="#2C5F7C" stroke-width="1.6" stroke-linecap="round">` +
    [[CX + 44, 660, 7], [CX + 62, 668, 5.5], [CX + 30, 674, 4.5]].map(([x, y, s]) => `<path d="M${x - s},${y - s * 0.4} Q${x - s * 0.4},${y - s * 0.6} ${x},${y} Q${x + s * 0.4},${y - s * 0.6} ${x + s},${y - s * 0.4}"/>`).join('') + `</g>`);
  // Gunung Agung
  lg('gMount', [[0, '#5C87AE'], [0.55, '#86AFC9'], [1, '#B9D3DC']]);
  const peak = [CX - 46, 668];
  S(`<path d="M${L},${HORIZON} C${L + 70},${HORIZON - 40} ${peak[0] - 170},${peak[1] + 90} ${peak[0] - 16},${peak[1] + 6} Q${peak[0]},${peak[1] - 3} ${peak[0] + 16},${peak[1] + 5} C${peak[0] + 150},${peak[1] + 80} ${Rr - 90},${HORIZON - 50} ${Rr},${HORIZON} Z" fill="url(#gMount)"/>`);
  // shaded right flank + ridges
  S(`<path d="M${peak[0] + 16},${peak[1] + 5} C${peak[0] + 150},${peak[1] + 80} ${Rr - 90},${HORIZON - 50} ${Rr},${HORIZON} L${peak[0] + 60},${HORIZON} C${peak[0] + 40},${peak[1] + 120} ${peak[0] + 20},${peak[1] + 60} ${peak[0] + 16},${peak[1] + 5} Z" fill="#4E7AA3" opacity="0.35"/>`);
  S(`<g fill="none" stroke="#D9ECF2" stroke-width="1.3" stroke-opacity="0.5" stroke-linecap="round">` +
    `<path d="M${peak[0] - 8},${peak[1] + 10} C${peak[0] - 18},${peak[1] + 40} ${peak[0] - 34},${peak[1] + 70} ${peak[0] - 60},${peak[1] + 96}"/>` +
    `<path d="M${peak[0] + 4},${peak[1] + 12} C${peak[0] + 2},${peak[1] + 40} ${peak[0] - 4},${peak[1] + 66} ${peak[0] - 14},${peak[1] + 100}"/>` +
    `<path d="M${peak[0] - 26},${peak[1] + 30} C${peak[0] - 50},${peak[1] + 64} ${peak[0] - 84},${peak[1] + 92} ${peak[0] - 120},${peak[1] + 118}"/></g>`);
  // haze band at the foot of the mountain
  defs.push(`<linearGradient id="gHaze" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON - 70}" x2="0" y2="${HORIZON}"><stop offset="0" stop-color="#F3E6C4" stop-opacity="0"/><stop offset="1" stop-color="#F3E6C4" stop-opacity="0.7"/></linearGradient>`);
  S(`<rect x="${L}" y="${HORIZON - 70}" width="${Rr - L}" height="72" fill="url(#gHaze)"/>`);
  // distant hills (teal-green)
  const hillPts = catmull([[L, HORIZON - 18], [L + 80, HORIZON - 34], [L + 170, HORIZON - 16], [CX + 20, HORIZON - 26], [CX + 120, HORIZON - 12], [Rr - 60, HORIZON - 30], [Rr, HORIZON - 14]], 12);
  S(`<path d="${poly([...hillPts, [Rr, HORIZON + 30], [L, HORIZON + 30]])}" fill="#78B6A2"/>`);

  // ---- temple group (far plane, base at HORIZON)
  const brick = '#BF553C', brickL = '#DA7152', brickD = '#8E3A2A', stone = '#F1E4C9';
  // wall with posts
  const gx = CX - 58; // candi bentar center
  S(`<rect x="${gx - 150}" y="${HORIZON - 18}" width="300" height="18" fill="${brick}"/>` +
    `<rect x="${gx - 150}" y="${HORIZON - 21}" width="300" height="4" fill="${stone}"/>` +
    `<rect x="${gx - 150}" y="${HORIZON - 8}" width="300" height="2" fill="${brickD}" opacity="0.5"/>`);
  [gx - 146, gx - 104, gx + 92, gx + 136].forEach((x) => S(
    `<rect x="${x - 5}" y="${HORIZON - 34}" width="10" height="34" fill="${brick}"/><rect x="${x - 7}" y="${HORIZON - 37}" width="14" height="4" fill="${stone}"/><path d="M${x - 5},${HORIZON - 37} L${x},${HORIZON - 46} L${x + 5},${HORIZON - 37} Z" fill="${brickL}"/>`));
  // meru (5 tiers) behind wall, left of gate
  {
    const mx = gx - 118, base = HORIZON - 16;
    let d = `<rect x="${mx - 16}" y="${base - 26}" width="32" height="26" fill="${stone}"/><rect x="${mx - 12}" y="${base - 22}" width="24" height="18" fill="${brick}"/><rect x="${mx - 3}" y="${base - 16}" width="6" height="12" fill="#5B2A1E"/>`;
    let y = base - 26;
    [[62, 13], [52, 12], [42, 11], [32, 10], [22, 9]].forEach(([w, h], i) => {
      d += `<rect x="${mx - 5}" y="${y - 5}" width="10" height="5" fill="#8C6A4E"/>`;
      y -= 5;
      d += `<path d="M${mx - w / 2},${y} L${mx + w / 2},${y} L${mx + w / 2 - 9},${y - h} L${mx - w / 2 + 9},${y - h} Z" fill="#3C3029"/>` +
        `<path d="M${mx - w / 2},${y} L${mx + w / 2},${y} L${mx + w / 2 - 1.5},${y - 2.5} L${mx - w / 2 + 1.5},${y - 2.5} Z" fill="#6A5446"/>`;
      y -= h;
    });
    d += `<path d="M${mx - 3},${y} L${mx + 3},${y} L${mx},${y - 12} Z" fill="#E7B650"/>`;
    S(d);
  }
  // bale with thatched roof (far left)
  {
    const bx = L + 78, base = HORIZON - 4;
    S(`<rect x="${bx - 34}" y="${base - 30}" width="68" height="30" fill="#F2E6CF"/>` +
      `<rect x="${bx - 34}" y="${base - 8}" width="68" height="8" fill="${brick}"/>` +
      `<rect x="${bx - 8}" y="${base - 26}" width="16" height="18" fill="#6B4A36"/>` +
      `<path d="M${bx - 50},${base - 28} L${bx + 50},${base - 28} L${bx + 12},${base - 86} L${bx - 12},${base - 86} Z" fill="#6E5845"/>` +
      `<path d="M${bx - 50},${base - 28} L${bx},${base - 28} L${bx - 2},${base - 86} L${bx - 12},${base - 86} Z" fill="#8A735C"/>` +
      `<g stroke="#4F3F31" stroke-width="1" opacity="0.6">${[-36, -24, -12, 0, 12, 24, 36].map((dx) => `<line x1="${bx + dx}" y1="${base - 29}" x2="${bx + dx * 0.3}" y2="${base - 84}"/>`).join('')}</g>` +
      `<rect x="${bx - 14}" y="${base - 90}" width="28" height="5" fill="#4F3F31"/>`);
  }
  // candi bentar (split gate)
  {
    // [width, height, kind] from the ground up; widths measured from the inner (split) edge
    const steps = [[42, 12, 'stone'], [35, 30, 'body'], [39, 4, 'lip'], [30, 12, 'brick'], [33, 3, 'lip'], [25, 11, 'brick'], [28, 3, 'lip'], [20, 10, 'brick'], [22, 3, 'lip'], [14, 9, 'brick'], [9, 8, 'brick'], [4, 8, 'gold']];
    const col = { stone: '#E6D4B0', body: brick, lip: '#EEDFC0', brick: brick, gold: '#E7B650' };
    [-1, 1].forEach((m) => {
      let y = HORIZON;
      let d = '';
      steps.forEach(([w, h, kind]) => {
        const x0 = m < 0 ? gx - 8 - w : gx + 8;
        d += `<rect x="${x0}" y="${y - h}" width="${w}" height="${h}" fill="${col[kind]}"/>`;
        if (kind === 'brick' || kind === 'body') {
          const sx = m < 0 ? x0 : x0 + w - 4;
          d += `<rect x="${sx}" y="${y - h}" width="4" height="${h}" fill="${brickD}" opacity="0.32"/>`;
        }
        if (kind === 'lip') {
          const ox = m < 0 ? x0 : x0 + w;
          d += `<path d="M${ox},${y - h} l${m * 4},-5 l0,5 z" fill="${col.lip}"/>`;
        }
        if (kind === 'body') {
          const px = m < 0 ? x0 + 7 : x0 + 5;
          d += `<rect x="${px}" y="${y - h + 6}" width="${w - 12}" height="${h - 12}" fill="none" stroke="#E9C7A0" stroke-width="1.2" opacity="0.8"/>` +
            `<circle cx="${px + (w - 12) / 2}" cy="${y - h / 2}" r="3" fill="#E9C7A0" opacity="0.9"/>`;
        }
        y -= h;
      });
      // the split: dark inner face
      d += `<rect x="${m < 0 ? gx - 11 : gx + 8}" y="${HORIZON - 104}" width="3" height="104" fill="${brickD}" opacity="0.6"/>`;
      S(d);
    });
    // steps in front of the gate
    S(`<rect x="${gx - 16}" y="${HORIZON - 5}" width="32" height="5" fill="#EEDFC0"/><rect x="${gx - 21}" y="${HORIZON}" width="42" height="4" fill="#DCCBA9"/>`);
  }
  // penjor arching over the gate
  {
    const pb = [gx + 44, HORIZON], pc1 = [gx + 40, HORIZON - 120], pc2 = [gx + 20, HORIZON - 168], pt = [gx - 38, HORIZON - 156];
    const c = sampleBez([pb, pc1, pc2, pt], 120);
    let d = '';
    for (let i = 0; i <= 16; i++) {
      const t = 0.5 + i * 0.03; if (t > 0.98) break;
      const { p } = pointAndNormal(c, t);
      const len = 7 + (i % 2) * 4;
      d += `<path d="M${n(p[0])},${n(p[1])} q-1.5,${len * 0.5} 0.5,${len} q1.5,-${len * 0.4} -0.5,-${len}" fill="#F4E7A0"/>`;
    }
    d += `<path d="${ribbon(c, (t) => lerp(3.4, 1.2, t))}" fill="#D9B45C"/>`;
    d += `<path d="M${pt[0]},${pt[1]} l0,12" stroke="#D9B45C" stroke-width="1"/><path d="M${pt[0]},${pt[1] + 12} c-6,2 -7,10 -3,15 c-1,-5 1,-9 3,-10 c2,1 4,5 3,10 c4,-5 3,-13 -3,-15 z" fill="#F2D27A"/>`;
    const lm = pointAndNormal(c, 0.22).p;
    d += `<path d="M${n(lm[0] + 1)},${n(lm[1])} l8,0 l0,26 l-4,5 l-4,-5 z" fill="#F4E7A0" opacity="0.95"/>`;
    S(d);
  }
  // palm trees
  const palmTree = (x, y, h, lean, s, flip) => {
    const top = [x + lean, y - h];
    let d = `<path d="M${x - 3.2 * s},${y} C${x - 2},${y - h * 0.45} ${top[0] - 4},${top[1] + h * 0.3} ${top[0] - 1.8 * s},${top[1]} L${top[0] + 1.8 * s},${top[1]} C${top[0] + 1},${top[1] + h * 0.3} ${x + 3},${y - h * 0.45} ${x + 3.2 * s},${y} Z" fill="#6C5A45"/>`;
    for (let i = 1; i < 9; i++) { const t = i / 9; const px = lerp(x, top[0], t * t * 0.9 + t * 0.1), py = lerp(y, top[1], t); d += `<line x1="${n(px - 3 * s)}" y1="${n(py)}" x2="${n(px + 3 * s)}" y2="${n(py - 1.5)}" stroke="#4E4133" stroke-width="0.9"/>`; }
    const fronds = [[-1, 38, 10], [-1, 30, -8], [-1, 18, -18], [1, 18, -18], [1, 30, -8], [1, 38, 10], [0, 4, -24], [-1, 26, 22], [1, 26, 22]];
    fronds.forEach(([dir, len, dy], i) => {
      const ex = top[0] + dir * len * s + (dir === 0 ? 3 : 0), ey = top[1] + dy * s + 8;
      const mx = top[0] + dir * len * 0.55 * s, my = top[1] + dy * s - 8;
      d += `<path d="M${n(top[0])},${n(top[1])} Q${n(mx)},${n(my - 4)} ${n(ex)},${n(ey)} Q${n(mx + dir * 2)},${n(my + 7)} ${n(top[0])},${n(top[1] + 4)} Z" fill="${i % 2 ? '#2F7550' : '#3E8B5F'}"/>`;
      d += `<path d="M${n(top[0])},${n(top[1] + 1)} Q${n(mx)},${n(my)} ${n(ex)},${n(ey)}" fill="none" stroke="#24583D" stroke-width="0.9"/>`;
    });
    d += `<circle cx="${top[0] - 2}" cy="${top[1] + 5}" r="2.6" fill="#7A6A3E"/><circle cx="${top[0] + 2.5}" cy="${top[1] + 6}" r="2.4" fill="#7A6A3E"/>`;
    return `<g${flip ? ` transform="translate(${2 * x},0) scale(-1,1)"` : ''}>${d}</g>`;
  };
  S(palmTree(Rr - 44, NEAR - 6, 142, -10, 1.1, false));

  // near plateau where the family stands
  const plateau = catmull([[L, HORIZON + 6], [L + 150, HORIZON + 2], [CX, HORIZON + 8], [CX + 140, HORIZON + 4], [Rr, HORIZON + 8]], 10);
  S(`<path d="${poly([...plateau, [Rr, NEAR + 20], [L, NEAR + 20]])}" fill="#8FD088"/>`);

  // ---- terraces (subak)
  const tl = [
    [[L, 952], [L + 150, 934], [CX + 60, 966], [Rr, 944]],
    [[L, 992], [L + 160, 978], [CX + 40, 1008], [Rr, 982]],
    [[L, 1036], [L + 130, 1054], [CX + 90, 1016], [Rr, 1034]],
    [[L, 1080], [L + 180, 1066], [CX + 60, 1102], [Rr, 1076]],
    [[L, 1122], [L + 150, 1140], [CX + 80, 1104], [Rr, 1126]],
    [[L, 1160], [L + 180, 1150], [CX + 60, 1182], [Rr, 1162]],
  ];
  const tops = tl.map((seg) => sampleBez(seg, 160));
  const bands = ['#86CD7F', '#6CBF70', 'water', '#58AE62', '#4A9E57', '#3B8B4C'];
  for (let i = 0; i < tops.length; i++) {
    const top = tops[i];
    const bot = i < tops.length - 1 ? tops[i + 1] : [[Rr, DROP.bottom + 30], [L, DROP.bottom + 30]].reverse();
    const shape = poly([...top, ...bot.slice().reverse()]);
    if (bands[i] === 'water') {
      defs.push(`<linearGradient id="gPaddy" gradientUnits="userSpaceOnUse" x1="0" y1="1010" x2="0" y2="1100"><stop offset="0" stop-color="#CDEFE3"/><stop offset="1" stop-color="#8FD2C3"/></linearGradient>`);
      S(`<path d="${shape}" fill="url(#gPaddy)"/>`);
    } else S(`<path d="${shape}" fill="${bands[i]}"/>`);
  }
  // bunds, shadows and planting rows
  const r = rng(3);
  for (let i = 0; i < tops.length; i++) {
    const top = tops[i];
    const shadow = top.map(([x, y]) => [x, y + 4]);
    S(`<path d="${poly(shadow, false)}" fill="none" stroke="#2F6F3E" stroke-width="3" stroke-opacity="0.28"/>`);
    S(`<path d="${poly(top, false)}" fill="none" stroke="#E6F8D4" stroke-width="2.4" stroke-opacity="0.95"/>`);
    const bot = i < tops.length - 1 ? tops[i + 1] : null;
    const rows = bands[i] === 'water' ? [0.4] : [0.36, 0.74];
    rows.forEach((fr, ri) => {
      for (let x = L + 6 + (ri % 2) * 11; x < Rr; x += 22 + r() * 6) {
        const y0 = yAt(top, x), y1 = bot ? yAt(bot, x) : DROP.bottom + 10;
        const y = lerp(y0, y1, fr);
        if (bands[i] === 'water') {
          S(`<path d="M${n(x - 2)},${n(y)} l2,-4 l2,4" fill="none" stroke="#4E9E7A" stroke-width="1.1" stroke-linecap="round"/>`);
        } else {
          const s = 2.2 + fr * 1.6 + i * 0.3;
          S(`<path d="M${n(x - s)},${n(y - s * 1.1)} Q${n(x - s * 0.2)},${n(y - s * 0.3)} ${n(x)},${n(y)} Q${n(x + s * 0.2)},${n(y - s * 0.3)} ${n(x + s)},${n(y - s * 1.1)} M${n(x)},${n(y)} L${n(x)},${n(y - s * 1.3)}" fill="none" stroke="${i < 2 ? '#56A862' : '#2F7A43'}" stroke-width="1.1" stroke-linecap="round" stroke-opacity="0.55"/>`);
        }
      }
    });
    if (bands[i] === 'water') {
      for (let k = 0; k < 7; k++) {
        const x = lerp(L + 40, Rr - 60, r()), y = lerp(yAt(top, x), yAt(tops[i + 1], x), 0.2 + r() * 0.6);
        S(`<line x1="${n(x)}" y1="${n(y)}" x2="${n(x + 16 + r() * 24)}" y2="${n(y)}" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.75"/>`);
      }
    }
  }

  // ---- glowing stream from the standpipe down to the pipe coupling
  const sp = [CX + 58, NEAR + 2];
  const centre = catmull([sp, [CX + 40, 980], [CX - 14, 1004], [CX - 44, 1040], [CX - 6, 1078], [CX + 42, 1106], [CX + 22, 1146], [CX - 6, 1172], [CX, DROP.bottom + 8]], 22);
  const wfn = (t) => lerp(5, 34, Math.pow(t, 1.15));
  S(`<path d="${ribbon(centre, (t) => wfn(t) + 26)}" fill="#8BF5EA" opacity="0.45" filter="url(#b8)"/>`);
  S(`<path d="${ribbon(centre, (t) => wfn(t) + 6)}" fill="#54D8D2"/>`);
  S(`<path d="${ribbon(centre, wfn)}" fill="#A8FBF3"/>`);
  S(`<path d="${ribbon(centre, (t) => wfn(t) * 0.38)}" fill="#FFFFFF" opacity="0.9"/>`);
  // sparkles along the stream
  const rs = rng(11);
  for (let i = 0; i < 9; i++) {
    const { p, nor } = pointAndNormal(centre, 0.12 + i * 0.1);
    const off = (rs() - 0.5) * 40;
    S(star4(p[0] + nor[0] * off, p[1] + nor[1] * off, 3.5 + rs() * 4, '#FFFFFF', 0.95));
  }

  // ---- standpipe, bucket
  const px = CX + 50;
  S(`<ellipse cx="${px + 28}" cy="${NEAR + 3}" rx="70" ry="6" fill="#3E8B4C" opacity="0.35"/>`);
  lg('gSteel', [[0, '#8C99AB'], [0.35, '#F1F5F9'], [0.7, '#C4CED9'], [1, '#7D8A9C']], 0, 0, 1, 0);
  S(`<rect x="${px - 4.5}" y="${NEAR - 62}" width="9" height="62" rx="2" fill="url(#gSteel)"/>` +
    `<rect x="${px - 7}" y="${NEAR - 66}" width="14" height="9" rx="3" fill="url(#gSteel)"/>` +
    `<path d="M${px + 5},${NEAR - 62} L${px + 18},${NEAR - 62} Q${px + 22},${NEAR - 62} ${px + 22},${NEAR - 58} L${px + 22},${NEAR - 54} L${px + 17},${NEAR - 54} L${px + 17},${NEAR - 57} L${px + 5},${NEAR - 57} Z" fill="url(#gSteel)"/>` +
    `<rect x="${px - 6}" y="${NEAR - 72}" width="12" height="3" rx="1.5" fill="#D2553F"/><rect x="${px - 1}" y="${NEAR - 72}" width="2" height="6" fill="#9E3A2C"/>` +
    `<rect x="${px - 7}" y="${NEAR - 4}" width="14" height="5" rx="1" fill="#9AA6B6"/>`);
  // water from tap into bucket
  S(`<path d="M${px + 17.5},${NEAR - 54} L${px + 21.5},${NEAR - 54} L${px + 22.5},${NEAR - 20} L${px + 16.5},${NEAR - 20} Z" fill="#BFF6F1" opacity="0.95"/>`);
  S(`<path d="M${px + 8},${NEAR - 22} L${px + 32},${NEAR - 22} L${px + 29},${NEAR - 2} L${px + 11},${NEAR - 2} Z" fill="#2FA9BD"/>` +
    `<ellipse cx="${px + 20}" cy="${NEAR - 22}" rx="12" ry="3" fill="#7EE3E6"/><path d="M${px + 11},${NEAR - 22} Q${px + 20},${NEAR - 38} ${px + 29},${NEAR - 22}" fill="none" stroke="#1F7F90" stroke-width="1.2"/>`);

  // ---- family (near plane)
  const skin = '#A0643F', skinD = '#834F31', hair = '#1D1A20';
  // child
  {
    const x = CX + 104, f = NEAR;
    S(`<ellipse cx="${x}" cy="${f + 1}" rx="12" ry="2.5" fill="#2F6F3E" opacity="0.35"/>` +
      `<rect x="${x - 6}" y="${f - 17}" width="4.5" height="15" rx="2" fill="${skin}"/><rect x="${x + 1.5}" y="${f - 17}" width="4.5" height="15" rx="2" fill="${skinD}"/>` +
      `<rect x="${x - 7}" y="${f - 3}" width="6" height="3" rx="1.5" fill="#2A2A33"/><rect x="${x + 1}" y="${f - 3}" width="6" height="3" rx="1.5" fill="#2A2A33"/>` +
      `<path d="M${x - 9},${f - 28} L${x + 9},${f - 28} L${x + 8},${f - 15} L${x - 8},${f - 15} Z" fill="#23427C"/>` +
      `<path d="M${x - 10},${f - 50} Q${x},${f - 54} ${x + 10},${f - 50} L${x + 10},${f - 27} L${x - 10},${f - 27} Z" fill="#F4C53D"/>` +
      `<path d="M${x - 9},${f - 49} Q${x - 22},${f - 46} ${x - 29},${f - 52}" fill="none" stroke="#F4C53D" stroke-width="6" stroke-linecap="round"/>` +
      `<circle cx="${x - 31}" cy="${f - 53}" r="3" fill="${skin}"/>` +
      `<path d="M${x + 9},${f - 49} Q${x + 13},${f - 40} ${x + 12},${f - 32}" fill="none" stroke="#F4C53D" stroke-width="5.5" stroke-linecap="round"/><circle cx="${x + 12}" cy="${f - 30}" r="2.6" fill="${skin}"/>` +
      `<rect x="${x - 2.5}" y="${f - 57}" width="5" height="5" fill="${skinD}"/>` +
      `<circle cx="${x}" cy="${f - 64}" r="8.5" fill="${skin}"/>` +
      `<path d="M${x - 8.8},${f - 64} C${x - 9},${f - 75} ${x + 9},${f - 76} ${x + 8.8},${f - 65} C${x + 5},${f - 69} ${x - 3},${f - 70} ${x - 8.8},${f - 64} Z" fill="${hair}"/>`);
  }
  // mother
  {
    const x = CX + 152, f = NEAR;
    S(`<ellipse cx="${x}" cy="${f + 1}" rx="16" ry="3" fill="#2F6F3E" opacity="0.35"/>` +
      `<path d="M${x - 11},${f - 46} L${x + 11},${f - 46} L${x + 12},${f - 4} L${x - 12},${f - 4} Z" fill="#A23533"/>` +
      `<g fill="#F1C35A">${[-6, 0, 6].map((dx) => [-38, -28, -18, -10].map((dy) => `<path d="M${x + dx},${f + dy - 2} l2,2 l-2,2 l-2,-2 z"/>`).join('')).join('')}</g>` +
      `<path d="M${x - 11},${f - 46} L${x + 11},${f - 46} L${x + 11},${f - 41} L${x - 11},${f - 41} Z" fill="#7E2627"/>` +
      `<rect x="${x - 12}" y="${f - 4}" width="24" height="2" fill="#7E2627"/>` +
      `<rect x="${x - 9}" y="${f - 3}" width="7" height="3" rx="1.5" fill="#2A2A33"/><rect x="${x + 2}" y="${f - 3}" width="7" height="3" rx="1.5" fill="#2A2A33"/>` +
      `<path d="M${x - 13},${f - 80} Q${x},${f - 86} ${x + 13},${f - 80} L${x + 12},${f - 46} L${x - 12},${f - 46} Z" fill="#FBF7EE"/>` +
      `<path d="M${x - 12},${f - 52} L${x + 12},${f - 52} L${x + 12},${f - 45} L${x - 12},${f - 45} Z" fill="#E7B545"/>` +
      `<path d="M${x - 3},${f - 81} L${x},${f - 66} L${x + 3},${f - 81}" fill="none" stroke="#E6DCC8" stroke-width="1.2"/>` +
      `<path d="M${x - 12},${f - 78} Q${x - 26},${f - 66} ${x - 34},${f - 62}" fill="none" stroke="#FBF7EE" stroke-width="7" stroke-linecap="round"/><circle cx="${x - 37}" cy="${f - 61}" r="3.3" fill="${skin}"/>` +
      `<path d="M${x + 12},${f - 78} Q${x + 18},${f - 64} ${x + 16},${f - 52}" fill="none" stroke="#FBF7EE" stroke-width="6.5" stroke-linecap="round"/><circle cx="${x + 16}" cy="${f - 50}" r="3" fill="${skin}"/>` +
      `<rect x="${x - 3}" y="${f - 90}" width="6" height="8" fill="${skinD}"/>` +
      `<circle cx="${x}" cy="${f - 97}" r="10" fill="${skin}"/>` +
      `<path d="M${x - 10.4},${f - 97} C${x - 11},${f - 111} ${x + 11},${f - 112} ${x + 10.4},${f - 97} C${x + 7},${f - 103} ${x - 4},${f - 105} ${x - 10.4},${f - 97} Z" fill="${hair}"/>` +
      `<circle cx="${x + 11}" cy="${f - 102}" r="6.5" fill="${hair}"/>` +
      `<g transform="translate(${x + 13},${f - 110})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-3" rx="2.2" ry="3.4" fill="#FFFFFF" transform="rotate(${a})"/>`).join('')}<circle r="1.8" fill="#F6C544"/></g>`);
  }
  // father
  {
    const x = CX + 205, f = NEAR;
    S(`<ellipse cx="${x}" cy="${f + 1}" rx="18" ry="3.2" fill="#2F6F3E" opacity="0.35"/>` +
      `<path d="M${x - 13},${f - 46} L${x + 13},${f - 46} L${x + 15},${f - 4} L${x - 15},${f - 4} Z" fill="#473629"/>` +
      `<path d="M${x - 2},${f - 46} L${x + 3},${f - 46} L${x + 6},${f - 6} L${x},${f + 1} L${x - 5},${f - 6} Z" fill="#5A4535"/>` +
      `<g stroke="#C79A45" stroke-width="1" opacity="0.8">${[-30, -20, -10].map((dy) => `<line x1="${x - 13}" y1="${f + dy}" x2="${x + 13}" y2="${f + dy}"/>`).join('')}</g>` +
      `<rect x="${x - 11}" y="${f - 3}" width="8" height="3" rx="1.5" fill="#2A2A33"/><rect x="${x + 3}" y="${f - 3}" width="8" height="3" rx="1.5" fill="#2A2A33"/>` +
      `<path d="M${x - 15},${f - 60} L${x + 15},${f - 60} L${x + 14},${f - 40} L${x - 14},${f - 40} Z" fill="#E0A63F"/>` +
      `<path d="M${x - 14},${f - 44} L${x + 14},${f - 52} L${x + 14},${f - 48} L${x - 14},${f - 40} Z" fill="#B98126"/>` +
      `<path d="M${x - 15},${f - 93} Q${x},${f - 99} ${x + 15},${f - 93} L${x + 15},${f - 60} L${x - 15},${f - 60} Z" fill="#FBF8F1"/>` +
      `<path d="M${x},${f - 93} L${x},${f - 60}" stroke="#E4DDCF" stroke-width="1.2"/>` +
      `<g fill="#D9D1C0">${[-86, -78, -70].map((dy) => `<circle cx="${x + 2.5}" cy="${f + dy}" r="0.9"/>`).join('')}</g>` +
      `<path d="M${x - 14},${f - 90} Q${x - 30},${f - 80} ${x - 34},${f - 74}" fill="none" stroke="#FBF8F1" stroke-width="7.5" stroke-linecap="round"/><circle cx="${x - 36}" cy="${f - 72}" r="3.5" fill="${skin}"/>` +
      `<path d="M${x + 14},${f - 90} Q${x + 20},${f - 74} ${x + 18},${f - 60}" fill="none" stroke="#FBF8F1" stroke-width="7" stroke-linecap="round"/><circle cx="${x + 18}" cy="${f - 57}" r="3.3" fill="${skin}"/>` +
      `<rect x="${x - 3.5}" y="${f - 104}" width="7" height="9" fill="${skinD}"/>` +
      `<circle cx="${x}" cy="${f - 111}" r="11" fill="${skin}"/>` +
      `<path d="M${x - 11.6},${f - 111} C${x - 13},${f - 124} ${x + 13},${f - 125} ${x + 11.6},${f - 111} L${x + 10},${f - 113} C${x + 4},${f - 117} ${x - 4},${f - 117} ${x - 10},${f - 113} Z" fill="#FBF8F1"/>` +
      `<path d="M${x - 1},${f - 121} L${x + 3},${f - 132} L${x + 6},${f - 120} Z" fill="#FBF8F1"/>` +
      `<path d="M${x - 11},${f - 115} Q${x},${f - 120} ${x + 11},${f - 115}" fill="none" stroke="#E0D6C3" stroke-width="1.2"/>`);
  }
}
add(`<g clip-path="url(#cDrop)">${scene.join('')}` +
  // glass: inner vignette + highlights
  `<path d="${dropD}" fill="none" stroke="#0B2A4A" stroke-width="60" stroke-opacity="0.35" filter="url(#b14)"/>` +
  `<path d="M${n(DROP.cx - DROP.R + 26)},${n(DROP.cy - 40)} C${n(DROP.cx - DROP.R + 20)},${n(DROP.cy - 190)} ${n(DROP.cx - 140)},${n(DROP.tip + 150)} ${n(DROP.cx - 44)},${n(DROP.tip + 70)} C${n(DROP.cx - 120)},${n(DROP.tip + 170)} ${n(DROP.cx - DROP.R + 44)},${n(DROP.cy - 170)} ${n(DROP.cx - DROP.R + 26)},${n(DROP.cy - 40)} Z" fill="#FFFFFF" opacity="0.28"/>` +
  `</g>`);

// ================================================================ DROP RIM
add(`<path d="${dropOuter}" fill="none" stroke="#E9C46A" stroke-width="1.2" stroke-opacity="0.55"/>`);
add(`<path d="${dropD}" fill="none" stroke="url(#gGoldRim)" stroke-width="9"/>`);
add(`<path d="${dropD}" fill="none" stroke="#FFF4CF" stroke-width="1.2" stroke-opacity="0.7"/>`);
add(`<path d="${dropInner}" fill="none" stroke="#FCE3A0" stroke-width="1.3" stroke-opacity="0.75"/>`);
add(star4(DROP.cx, DROP.tip - 2, 16, '#FFF6D8', 1, 0.1));
add(`<circle cx="${DROP.cx}" cy="${DROP.tip - 2}" r="14" fill="#FFF1C4" opacity="0.5" filter="url(#b8)"/>`);

// ================================================================ "50"
{
  const font = opentype.loadSync(path.join(__dirname, 'fonts', 'BodoniModa-96-900.ttf'));
  const size = 222;
  const adv = font.getAdvanceWidth('50', size);
  const base = DROP.tip - 4;
  const x0 = CX - adv / 2 + 1;
  const p = font.getPath('50', x0, base, size);
  const bb = p.getBoundingBox();
  const d = p.toPathData(2);
  defs.push(`<path id="fifty" d="${d}"/>`);
  defs.push(`<linearGradient id="gFiftyFace" gradientUnits="userSpaceOnUse" x1="0" y1="${n(bb.y1)}" x2="0" y2="${n(bb.y2)}">` +
    [[0, '#FFF7D6'], [0.16, '#FBE094'], [0.38, '#EDBF57'], [0.5, '#C08A2E'], [0.56, '#B07A24'], [0.66, '#E0AC46'], [0.84, '#F8D983'], [1, '#C99536']].map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('') + `</linearGradient>`);
  defs.push(`<linearGradient id="gFiftySide" gradientUnits="userSpaceOnUse" x1="0" y1="${n(bb.y1)}" x2="0" y2="${n(bb.y2 + 8)}"><stop offset="0" stop-color="#8A5A16"/><stop offset="1" stop-color="#4E300A"/></linearGradient>`);
  defs.push(`<linearGradient id="gSheen" gradientUnits="userSpaceOnUse" x1="${n(bb.x1)}" y1="${n(bb.y1)}" x2="${n(bb.x2)}" y2="${n(bb.y2)}"><stop offset="0.28" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.36" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="0.42" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.7" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="0.74" stop-color="#FFFFFF" stop-opacity="0.35"/><stop offset="0.78" stop-color="#FFFFFF" stop-opacity="0"/></linearGradient>`);
  defs.push(`<clipPath id="cFifty"><use href="#fifty"/></clipPath>`);
  add(`<use href="#fifty" fill="#000" opacity="0.5" transform="translate(0,16)" filter="url(#b14)"/>`);
  let ext = '';
  for (let i = 7; i >= 1; i--) ext += `<use href="#fifty" transform="translate(${n(i * 0.25)},${i})" fill="url(#gFiftySide)"/>`;
  add(ext);
  add(`<use href="#fifty" fill="url(#gFiftyFace)"/>`);
  add(`<rect x="${n(bb.x1 - 10)}" y="${n(bb.y1 - 10)}" width="${n(bb.x2 - bb.x1 + 20)}" height="${n(bb.y2 - bb.y1 + 20)}" fill="url(#gSheen)" clip-path="url(#cFifty)"/>`);
  add(`<use href="#fifty" fill="none" stroke="#FFF3C8" stroke-width="1.2" stroke-opacity="0.65"/>`);
  add(star4(bb.x2 - 36, bb.y1 + 22, 13, '#FFFFFF', 0.95, 0.1) + star4(bb.x1 + 70, bb.y1 + 16, 8, '#FFFFFF', 0.85, 0.12));
  OPT.fiftyBox = bb;
}

// ================================================================ HANDS
// POV grip, so forearm, wrist and hand read as one limb: the sleeve comes up from the bottom edge, the gloved hand
// leaves the sleeve at the wrist, the back of the hand faces the viewer, the fingers curl over the top of the pipe
// (knuckles, finger backs, rounded middle knuckles) and the thumb runs along the pipe toward the coupling.
// Worn tan leather work gloves, grimy uniform sleeve. Defined for the hand right of the coupling (thumb toward -x);
// the left one is mirrored with its own dirt.
const HAND = { hx: 160, hs: 1.55 };
const LTH = { hi: '#F2DEB8', light: '#E1C18E', mid: '#C99D64', dark: '#9C7143', deep: '#6F4D2A', ink: '#553718', grime: '#5A4330' };
function blobPath(cx, cy, rx, ry, rnd, k = 9, jit = 0.55, rot = 0) {
  const P = [];
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2, sc = 1 - jit / 2 + rnd() * jit;
    const x = Math.cos(a) * rx * sc, y = Math.sin(a) * ry * sc;
    P.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  let d = `M${n(P[0][0])},${n(P[0][1])}`;
  for (let i = 0; i < k; i++) {
    const p0 = P[(i - 1 + k) % k], p1 = P[i], p2 = P[(i + 1) % k], p3 = P[(i + 2) % k];
    d += ` C${n(p1[0] + (p2[0] - p0[0]) / 6)},${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)},${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])},${n(p2[1])}`;
  }
  return d + ' Z';
}
const PR = PIPE.r / HAND.hs; // pipe edges in the hand's local units
// finger backs rising from the knuckles and curling over the pipe: [base x, width, base y, middle-knuckle top y, tilt°]
const FINGERS = [
  [-25, 18.5, -8, -27.5, -5],     // index
  [-7.5, 19.5, -10, -29.5, -1.5], // middle
  [10.5, 18.5, -9, -28.5, 2.5],   // ring
  [26, 15.5, -6, -24.5, 7],       // pinky
];
function fingerD([bx, w, by, top]) {
  const r = w / 2;
  return `M${n(bx - r)},${n(by)} L${n(bx - r - 0.6)},${n(top + r)} C${n(bx - r - 0.6)},${n(top + 2)} ${n(bx - r + 4)},${n(top)} ${n(bx)},${n(top)} ` +
    `C${n(bx + r - 4)},${n(top)} ${n(bx + r + 0.6)},${n(top + 2)} ${n(bx + r + 0.6)},${n(top + r)} L${n(bx + r)},${n(by)} Z`;
}
const fingerT = (fg) => `rotate(${fg[4]} ${fg[0]} ${fg[2]})`;
// back of the hand: knuckle bumps on top, tapering to the wrist, which is set a little outward to meet the forearm
const BACK_D = 'M-35,-3 C-35,-9 -31,-14 -25,-14 C-20,-14 -17,-11 -16,-9 C-15,-14 -11,-17 -7,-17 C-2,-17 1,-14 2,-11 ' +
  'C3,-15 7,-17 11,-17 C15,-17 18,-14 19,-10 C20,-13 23,-14 26,-14 C31,-14 34,-9 34,-3 ' +
  'C38,8 38,24 36,44 L-20,46 C-27,33 -34,16 -35.5,4 C-35.8,1 -35.6,-1 -35,-3 Z';
const THUMB_D = 'M-31,4 C-41,1.5 -52,1 -60,3.5 C-67,6 -67.5,15 -61,17 C-52,19.5 -40,24 -27,27 C-23,19 -24,10 -31,4 Z';
// sleeve: frayed hem across the wrist, running down and out along the forearm
const SLEEVE_D = 'M-25,41 C-8,37 20,31 39,28 C47,52 64,98 84,150 L8,158 C-6,120 -18,74 -25,41 Z';
defs.push(`<clipPath id="cSleeveL"><path d="${SLEEVE_D}"/></clipPath>`);
defs.push(`<clipPath id="cGloveL"><path d="${BACK_D}"/><path d="${THUMB_D}"/>${FINGERS.map((fg) => `<path d="${fingerD(fg)}" transform="${fingerT(fg)}"/>`).join('')}</clipPath>`);

function handParts() {
  const ink = LTH.ink, g = [];
  defs.push(`<linearGradient id="gBackHand" gradientUnits="userSpaceOnUse" x1="-34" y1="-16" x2="30" y2="44"><stop offset="0" stop-color="#EDD3A6"/><stop offset="0.45" stop-color="#D1A871"/><stop offset="0.8" stop-color="#B78956"/><stop offset="1" stop-color="#94693D"/></linearGradient>`);
  defs.push(`<linearGradient id="gFingerBack" gradientUnits="userSpaceOnUse" x1="0" y1="-36" x2="0" y2="-6"><stop offset="0" stop-color="#F3DFBA"/><stop offset="0.35" stop-color="#E0BF8B"/><stop offset="1" stop-color="#C39862"/></linearGradient>`);
  defs.push(`<linearGradient id="gThumbB" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="28"><stop offset="0" stop-color="#E8CA98"/><stop offset="0.55" stop-color="#C99D64"/><stop offset="1" stop-color="#94693D"/></linearGradient>`);
  lg('gSleeve', [[0, '#4673B0'], [0.5, '#325C98'], [1, '#203F72']], 0, 0, 1, 0.25);

  // fingers (drawn first; the knuckles of the hand overlap their bases)
  FINGERS.forEach((fg, i) => {
    const [bx, w, by, top] = fg, r = w / 2;
    const t = (y) => n((y - top) / (by - top));
    defs.push(`<linearGradient id="gFb${i}" gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${by}"><stop offset="0" stop-color="#A97D4B"/><stop offset="${t(top + 3)}" stop-color="#D9B780"/><stop offset="${t(top + 6)}" stop-color="#F1DBB2"/><stop offset="${t(top + 11)}" stop-color="#DDBA86"/><stop offset="1" stop-color="#C39862"/></linearGradient>`);
    g.push(`<g transform="${fingerT(fg)}">` +
      `<path d="${fingerD(fg)}" fill="url(#gFb${i})" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>` +
      // middle-knuckle wrinkles and the soft light on the knuckle itself
      `<path d="M${n(bx - r + 3)},${n(top + r + 3)} Q${n(bx)},${n(top + r + 6.5)} ${n(bx + r - 3)},${n(top + r + 3)}" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>` +
      `<path d="M${n(bx - r + 4.5)},${n(top + r + 6.5)} Q${n(bx)},${n(top + r + 9)} ${n(bx + r - 4.5)},${n(top + r + 6.5)}" fill="none" stroke="${LTH.deep}" stroke-width="0.9" stroke-linecap="round" opacity="0.55"/>` +
      `<path d="M${n(bx - r + 3)},${n(top + r)} C${n(bx - r + 3)},${n(top + 3.5)} ${n(bx - 2)},${n(top + 2.5)} ${n(bx + 2)},${n(top + 2.5)}" fill="none" stroke="#FFF4DC" stroke-width="2" stroke-linecap="round" opacity="0.6"/>` +
      `</g>`);
  });
  // back of the hand
  g.push(`<path d="${BACK_D}" fill="url(#gBackHand)" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>`);
  // knuckle light, knuckle seam, tendon ridges, shade toward the pinky side
  [[-25, -11], [-7, -14], [11, -14], [26, -11]].forEach(([x, y]) => g.push(`<ellipse cx="${x}" cy="${y + 2.5}" rx="5.2" ry="2.6" fill="#FBEACB" opacity="0.55"/>`));
  g.push(`<path d="M-32,-2 C-14,-9 14,-9 32,-1" fill="none" stroke="${LTH.deep}" stroke-width="1.1" stroke-dasharray="3.2 2.6" opacity="0.8"/>`);
  g.push(`<g fill="none" stroke="#F6E3BE" stroke-width="2.2" stroke-linecap="round" opacity="0.4"><path d="M-22,4 C-18,16 -12,26 -6,34"/><path d="M-6,2 C-4,14 -1,24 2,34"/><path d="M10,2 C11,14 12,24 12,34"/></g>`);
  g.push(`<path d="M34,-3 C38,8 38,24 36,44 L27,44 C31,26 31,10 28,-4 Z" fill="${LTH.deep}" opacity="0.25"/>`);
  // back panel seam and wrist shirring where the glove tucks into the sleeve
  g.push(`<path d="M-30,8 C-12,4 16,4 33,9" fill="none" stroke="${LTH.deep}" stroke-width="1" stroke-dasharray="3.2 2.6" opacity="0.65"/>`);
  g.push(`<g fill="none" stroke="${LTH.deep}" stroke-width="1.1" stroke-linecap="round" opacity="0.6"><path d="M-18,30 q4,-2 8,0 t8,0 t8,0 t8,0 t8,0 t8,-1"/><path d="M-20,35 q4,-2 8,0 t8,0 t8,0 t8,0 t8,0 t8,-1 t6,-1"/></g>`);
  // thumb along the pipe, pointing at the coupling
  g.push(`<path d="${THUMB_D}" fill="url(#gThumbB)" stroke="${ink}" stroke-width="1.5" stroke-linejoin="round"/>`);
  g.push(`<path d="M-47,2.5 C-50,8 -50,16 -46,22" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round"/>`);
  g.push(`<path d="M-57,3.5 C-61,8 -61,13.5 -57.5,17.5" fill="none" stroke="${LTH.deep}" stroke-width="1" stroke-dasharray="2.4 2" opacity="0.8"/>`);
  g.push(`<path d="M-35,4.5 C-45,2.5 -54,2.5 -61,5.5" fill="none" stroke="#FBEBCB" stroke-width="1.8" stroke-linecap="round" opacity="0.6"/>`);
  g.push(`<path d="M-30,24.5 C-42,22.5 -52,19.5 -59,17" fill="none" stroke="${LTH.deep}" stroke-width="2" stroke-linecap="round" opacity="0.35"/>`);
  // shadow the sleeve casts on the glove just above the hem
  g.push(`<path d="M-24,40 C-8,36 20,30 38,27 L38.5,23 C20,26 -8,32 -23,36 Z" fill="#3B2814" opacity="0.28"/>`);
  const glove = g.join('');

  // sleeve
  let sl = `<path d="${SLEEVE_D}" fill="url(#gSleeve)" stroke="#132A4E" stroke-width="1.5" stroke-linejoin="round"/>`;
  sl += `<g fill="none" stroke-linecap="round"><path d="M-6,52 C4,70 12,90 18,112" stroke="#15305A" stroke-width="2.2" opacity="0.45"/><path d="M26,40 C36,62 44,86 50,108" stroke="#15305A" stroke-width="2" opacity="0.4"/><path d="M-12,50 C-2,68 5,86 10,104" stroke="#6E90C4" stroke-width="1.6" opacity="0.35"/><path d="M-20,47 C-6,44 18,39 36,36" stroke="#15305A" stroke-width="1.6" opacity="0.4"/></g>`;
  // dulled reflective band wrapping the sleeve
  sl += `<path d="M-15,64 C4,60 28,54 47,49 L50,59 C31,64 7,70 -12,74 Z" fill="#C4C0AF"/><path d="M-13.5,69 C5,65 29,59 48.5,54" fill="none" stroke="#DEDBCD" stroke-width="1.8"/><path d="M-15,64 C4,60 28,54 47,49 M-12,74 C7,70 31,64 50,59" fill="none" stroke="#8F8B7E" stroke-width="1.1"/>`;
  // worn, darker hem edge
  sl += `<path d="M-25,41 C-8,37 20,31 39,28 L40,32.5 C21,35.5 -7,41.5 -24,45.5 Z" fill="#132A4E" opacity="0.8"/>`;
  return { glove, sleeve: sl };
}
const HANDPARTS = handParts();

// dirt differs per hand so the mirrored pair doesn't look stamped
function handDirt(seed) {
  const r = rng(seed);
  // sleeve: mud and dust smudges, grease streaks, speckles, loose threads at the hem
  let a = '';
  for (let i = 0; i < 6; i++) {
    const t = r(), u = r();
    const cx = lerp(-14, 40, u) + t * 30, cy = lerp(48, 78, t);
    const rx = 4 + r() * 7, ry = 2.5 + r() * 4, rot = (r() - 0.5) * 1.2;
    const col = r() < 0.7 ? '#5B4631' : '#A5977E';
    a += `<path d="${blobPath(cx, cy, rx, ry, r, 9, 0.6, rot)}" fill="${col}" opacity="${n(0.22 + r() * 0.16)}"/>`;
    if (col === '#5B4631') a += `<path d="${blobPath(cx + (r() - 0.5) * 3, cy + (r() - 0.5) * 2, rx * 0.5, ry * 0.5, r, 8, 0.6, rot)}" fill="#4A3826" opacity="${n(0.25 + r() * 0.15)}"/>`;
  }
  for (let i = 0; i < 2; i++) {
    const x0 = lerp(-12, 30, r()), y0 = lerp(46, 64, r());
    a += `<path d="M${n(x0)},${n(y0)} c${n(3 + r() * 4)},${n(5 + r() * 3)} ${n(7 + r() * 4)},${n(10 + r() * 4)} ${n(9 + r() * 6)},${n(16 + r() * 6)}" fill="none" stroke="#1E1C20" stroke-width="${n(2 + r() * 1.5)}" stroke-linecap="round" opacity="0.22"/>`;
  }
  for (let i = 0; i < 34; i++) { const t = r(); a += `<circle cx="${n(lerp(-20, 44, r()) + t * 30)}" cy="${n(lerp(42, 80, t))}" r="${n(0.4 + r() * 1.1)}" fill="${r() < 0.7 ? '#4A3826' : '#CFC4AE'}" opacity="${n(0.3 + r() * 0.4)}"/>`; }
  a += `<path d="M-13.5,69 C5,65 29,59 48.5,54 L50,59 C31,64 7,70 -12,74 Z" fill="#6B5A43" opacity="0.2"/>`;
  a += `<path d="M-24,45.5 C-7,41.5 21,35.5 40,32.5 L41,37 C22,40 -6,46 -23,50 Z" fill="#3F3122" opacity="0.28"/>`;
  let threads = '';
  for (let i = 0; i < 6; i++) {
    const t = r(), x = lerp(-22, 36, t), y = lerp(40.5, 29, t) + 2;
    threads += `<path d="M${n(x)},${n(y)} q${n((r() - 0.5) * 3)},${n(2 + r() * 2)} ${n((r() - 0.5) * 4)},${n(4 + r() * 3)}"/>`;
  }
  const sleeve = `<g clip-path="url(#cSleeveL)">${a}</g><g fill="none" stroke="#2A4674" stroke-width="0.9" stroke-linecap="round" opacity="0.9">${threads}</g>`;

  // glove: grime on the knuckles and finger tops, thumb tip, a couple of stains, leather grain
  let g = '';
  FINGERS.forEach(([bx, w, by, top, tilt]) => {
    g += `<g transform="rotate(${tilt} ${bx} ${by})"><path d="${blobPath(bx + (r() - 0.5) * 3, top + 2.5, w * 0.48, 3.5 + r() * 1.5, r, 9, 0.35)}" fill="#3F2C18" opacity="${n(0.2 + r() * 0.1)}"/></g>`;
  });
  g += `<path d="${blobPath(-62, 10.5, 5.5, 7, r, 8, 0.35)}" fill="#3F2C18" opacity="0.26"/>`;
  for (let i = 0; i < 3; i++) g += `<path d="${blobPath(lerp(-28, 28, r()), lerp(-4, 28, r()), 3 + r() * 4, 2 + r() * 2.5, r, 8, 0.6, r() - 0.5)}" fill="#4E3923" opacity="${n(0.16 + r() * 0.12)}"/>`;
  [[-25, -10], [-7, -13], [11, -13], [26, -10]].forEach(([x, y]) => { g += `<path d="${blobPath(x + (r() - 0.5) * 3, y + 1, 4.5, 2, r, 7, 0.5)}" fill="#FBEFD3" opacity="${n(0.25 + r() * 0.15)}"/>`; });
  for (let i = 0; i < 46; i++) g += `<circle cx="${n(lerp(-68, 38, r()))}" cy="${n(lerp(-36, 44, r()))}" r="${n(0.35 + r() * 0.8)}" fill="${r() < 0.75 ? '#4A3218' : '#F6E6C6'}" opacity="${n(0.25 + r() * 0.35)}"/>`;
  const glove = `<g clip-path="url(#cGloveL)">${g}</g>`;
  return { sleeve, glove };
}
const DIRT_R = handDirt(311), DIRT_L = handDirt(577);

// ================================================================ PIPE + COUPLING
{
  const y0 = PIPE.y - PIPE.r, h = PIPE.r * 2;
  add(`<ellipse cx="${CX}" cy="${PIPE.y + 40}" rx="560" ry="16" fill="#000" opacity="0.35" filter="url(#b8)"/>`);
  defs.push(`<linearGradient id="gPipe" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y0 + h}"><stop offset="0" stop-color="#E9F0F7"/><stop offset="0.14" stop-color="#FFFFFF"/><stop offset="0.34" stop-color="#D3DCE6"/><stop offset="0.62" stop-color="#9DAABB"/><stop offset="0.86" stop-color="#6D7A8F"/><stop offset="1" stop-color="#4D596C"/></linearGradient>`);
  defs.push(`<linearGradient id="gCollar" gradientUnits="userSpaceOnUse" x1="0" y1="${y0 - 7}" x2="0" y2="${y0 + h + 7}"><stop offset="0" stop-color="#C9D3DF"/><stop offset="0.16" stop-color="#F4F7FA"/><stop offset="0.4" stop-color="#B6C1CF"/><stop offset="0.7" stop-color="#7F8CA0"/><stop offset="1" stop-color="#465266"/></linearGradient>`);
  add(`<rect x="-10" y="${y0}" width="${W + 20}" height="${h}" fill="url(#gPipe)"/>`);
  add(`<rect x="-10" y="${y0 + h - 3}" width="${W + 20}" height="3" fill="#39455A" opacity="0.6"/>`);
  [150, W - 150].forEach((x) => add(`<rect x="${x - 12}" y="${y0 - 6}" width="24" height="${h + 12}" rx="3" fill="url(#gCollar)"/><rect x="${x - 12}" y="${y0 - 6}" width="3" height="${h + 12}" fill="#FFFFFF" opacity="0.5"/><rect x="${x + 9}" y="${y0 - 6}" width="3" height="${h + 12}" fill="#3E4A5E" opacity="0.4"/>`));
  // coupling glow
  rg('gCoupleGlow', [[0, '#B8FFF6', 0.95], [0.4, '#5FE3DB', 0.45], [1, '#2FB9C9', 0]]);
  add(`<ellipse cx="${CX}" cy="${y0 - 6}" rx="120" ry="40" fill="url(#gCoupleGlow)"/>`);
  // coupling body
  const cw = 60, ct = y0 - 13, cb = y0 + h + 13;
  defs.push(`<linearGradient id="gCoupling" gradientUnits="userSpaceOnUse" x1="0" y1="${ct}" x2="0" y2="${cb}"><stop offset="0" stop-color="#DCE4EE"/><stop offset="0.12" stop-color="#FFFFFF"/><stop offset="0.36" stop-color="#C6D0DC"/><stop offset="0.68" stop-color="#8795A9"/><stop offset="1" stop-color="#4A566A"/></linearGradient>`);
  add(`<rect x="${CX - cw}" y="${ct}" width="${cw * 2}" height="${cb - ct}" rx="7" fill="url(#gCoupling)"/>`);
  [-cw + 12, cw - 12].forEach((dx) => add(`<rect x="${CX + dx - 7}" y="${ct - 5}" width="14" height="${cb - ct + 10}" rx="4" fill="url(#gCollar)"/><rect x="${CX + dx - 7}" y="${ct - 5}" width="2.5" height="${cb - ct + 10}" fill="#FFFFFF" opacity="0.6"/>`));
  add(`<rect x="${CX - 22}" y="${ct + 2}" width="44" height="${cb - ct - 4}" rx="3" fill="#FFFFFF" opacity="0.18"/>`);
  [[-cw + 12, ct + 4], [cw - 12, ct + 4], [-cw + 12, cb - 4], [cw - 12, cb - 4]].forEach(([dx, y]) =>
    add(`<circle cx="${CX + dx}" cy="${y}" r="4.2" fill="#56627A"/><circle cx="${CX + dx - 1}" cy="${y - 1}" r="2.2" fill="#EEF3F8"/>`));
  // water entering the coupling
  add(`<path d="M${CX - 20},${ct + 1} Q${CX},${ct - 12} ${CX + 20},${ct + 1} Z" fill="#DFFFFB" opacity="0.9"/>`);
}


// hands gripping the pipe on both sides of the coupling: sleeve, glove and thumb as one limb in front of the pipe
{
  const { hx, hs } = HAND;
  const limb = (d) => `${HANDPARTS.glove}${d.glove}${HANDPARTS.sleeve}${d.sleeve}`;
  add(`<g clip-path="url(#cAboveBand)">` +
    `<ellipse cx="${n(CX + hx + 14)}" cy="${PIPE.y + 16}" rx="${n(44 * hs)}" ry="${n(36 * hs)}" fill="#0A1633" opacity="0.32" filter="url(#b8)"/>` +
    `<ellipse cx="${n(CX - hx - 14)}" cy="${PIPE.y + 16}" rx="${n(44 * hs)}" ry="${n(36 * hs)}" fill="#0A1633" opacity="0.32" filter="url(#b8)"/>` +
    `<g transform="translate(${n(CX + hx)},${PIPE.y}) scale(${hs})">${limb(DIRT_R)}</g>` +
    `<g transform="translate(${n(CX - hx)},${PIPE.y}) scale(${-hs},${hs})">${limb(DIRT_L)}</g>` +
    `</g>`);
}

// ================================================================ BOTTOM BAND + PANEL
{
  lg('gPanel', [[0, '#081330'], [1, '#050C20']]);
  add(`<rect x="0" y="${BAND}" width="${W}" height="${H - BAND}" fill="url(#gPanel)"/>`);
  rg('gPanelGlow', [[0, '#1E4C86', 0.5], [1, '#1E4C86', 0]]);
  add(`<ellipse cx="${CX}" cy="${BAND + 70}" rx="420" ry="90" fill="url(#gPanelGlow)"/>`);
  defs.push(`<linearGradient id="gBand" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="0"><stop offset="0" stop-color="#A8741F"/><stop offset="0.25" stop-color="#F1CB6C"/><stop offset="0.5" stop-color="#FFEDB0"/><stop offset="0.75" stop-color="#F1CB6C"/><stop offset="1" stop-color="#A8741F"/></linearGradient>`);
  add(`<rect x="0" y="${BAND}" width="${W}" height="3.5" fill="url(#gBand)"/>`);
  let tri = '';
  const step = 26, tw = 19, th = 17, ty = BAND + 8;
  const count = Math.ceil(W / step) + 2;
  const start = CX - Math.floor(count / 2) * step;
  for (let i = 0; i < count; i++) {
    const x = start + i * step;
    tri += `<path d="M${n(x - tw / 2)},${ty} L${n(x + tw / 2)},${ty} L${n(x)},${ty + th} Z"/>`;
    tri += `<circle cx="${n(x + step / 2)}" cy="${ty + 3}" r="1.6"/>`;
  }
  add(`<g fill="url(#gBand)">${tri}</g>`);
  add(`<rect x="0" y="${ty + th + 6}" width="${W}" height="1.5" fill="url(#gBand)" opacity="0.8"/>`);
}

// ================================================================ CORNER ORNAMENTS
function corner(armV = 176) {
  const gold = 'url(#gGoldV)';
  let d = '';
  d += `<path d="M0,${armV} L0,0 L176,0" fill="none" stroke="#E9C46A" stroke-width="2.4"/>`;
  d += `<path d="M10,${armV - 38} L10,10 L138,10" fill="none" stroke="#E9C46A" stroke-width="1" stroke-opacity="0.7"/>`;
  d += `<path d="M176,0 C188,-6 202,-5 214,0 C202,5 188,6 176,0 Z" fill="#E9C46A"/>`;
  d += `<path d="M0,${armV} C-6,${armV + 12} -5,${armV + 26} 0,${armV + 38} C5,${armV + 26} 6,${armV + 12} 0,${armV} Z" fill="#E9C46A"/>`;
  d += `<circle cx="138" cy="10" r="2.2" fill="#E9C46A"/><circle cx="10" cy="${armV - 38}" r="2.2" fill="#E9C46A"/>`;
  // patra scrolls
  const scroll = `M34,28 C52,14 86,12 104,26 C118,37 114,56 99,57 C88,58 83,47 90,41 C94,38 99,40 99,44`;
  d += `<path d="${scroll}" fill="none" stroke="${gold}" stroke-width="2.4" stroke-linecap="round"/>`;
  d += `<path d="${scroll}" fill="none" stroke="${gold}" stroke-width="2.4" stroke-linecap="round" transform="matrix(0,1,1,0,0,0)"/>`;
  d += `<path d="M58,20 C70,26 74,34 72,42 C66,36 60,30 58,20 Z" fill="#E9C46A"/>`;
  d += `<path d="M58,20 C70,26 74,34 72,42 C66,36 60,30 58,20 Z" fill="#E9C46A" transform="matrix(0,1,1,0,0,0)"/>`;
  d += `<path d="M18,18 C30,22 44,30 46,44 C38,48 26,44 22,36 C18,30 17,24 18,18 Z" fill="${gold}"/>`;
  d += `<path d="M20,20 C28,27 36,34 42,42" fill="none" stroke="#8C5E1A" stroke-width="1.1" stroke-linecap="round" opacity="0.8"/>`;
  d += `<circle cx="56" cy="56" r="3" fill="#E9C46A"/><circle cx="70" cy="66" r="2" fill="#E9C46A"/><circle cx="66" cy="70" r="2" fill="#E9C46A"/>`;
  return d;
}
{
  const c = corner(), cb = corner(132), i = 32;
  add(`<g transform="translate(${i},${i})">${c}</g>`);
  add(`<g transform="translate(${W - i},${i}) scale(-1,1)">${c}</g>`);
  add(`<g transform="translate(${i},${H - i}) scale(1,-1)">${cb}</g>`);
  add(`<g transform="translate(${W - i},${H - i}) scale(-1,-1)">${cb}</g>`);
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join('')}</defs>${out.join('\n')}</svg>`;
fs.writeFileSync(OPT.out, svg);
console.log('wrote', OPT.out, (svg.length / 1024).toFixed(1) + ' KB', 'fifty bbox', JSON.stringify(OPT.fiftyBox && { x1: n(OPT.fiftyBox.x1), y1: n(OPT.fiftyBox.y1), x2: n(OPT.fiftyBox.x2), y2: n(OPT.fiftyBox.y2) }));
