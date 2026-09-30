// Render design/infografis.html menjadi PNG 1080x1350 (1x) dan 2160x2700 (2x).
// Pemakaian:
//   node scripts/render.mjs --nama "Nama Lengkap" --instansi "Universitas X"
//   node scripts/render.mjs --mode wireframe
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';

// Tulis metadata resolusi (chunk pHYs) ke PNG: 300 DPI = 11811 piksel per meter.
function setPngDpi(buf, dpi) {
  const ppm = Math.round(dpi / 0.0254);
  const data = Buffer.alloc(9);
  data.writeUInt32BE(ppm, 0); data.writeUInt32BE(ppm, 4); data.writeUInt8(1, 8);
  const type = Buffer.from('pHYs');
  const len = Buffer.alloc(4); len.writeUInt32BE(9);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(Buffer.concat([type, data])) >>> 0);
  const chunk = Buffer.concat([len, type, data, crc]);
  let off = 8, out = [buf.subarray(0, 8)];
  while (off < buf.length) {
    const l = buf.readUInt32BE(off), t = buf.toString('ascii', off + 4, off + 8), end = off + 12 + l;
    if (t !== 'pHYs') out.push(buf.subarray(off, end));
    if (t === 'IHDR') out.push(chunk);
    off = end;
  }
  return Buffer.concat(out);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const params = new URLSearchParams();
for (const key of ['nama', 'instansi', 'mode']) if (args[key]) params.set(key, args[key]);
const mode = args.mode || 'final';
const url = pathToFileURL(path.join(root, 'design', 'infografis.html')).href + '?' + params;

const browser = await chromium.launch();
fs.mkdirSync(path.join(root, 'output'), { recursive: true });

// Juknis: kanvas 1080 x 1350 px (4:5), PNG/JPG, minimal 300 DPI.
// File utama dirender persis 1080x1350; file cadangan 3x untuk kebutuhan resolusi lebih besar.
const nama = (args.nama || '').trim();
const base = nama ? nama.replace(/\s+/g, '-') + '_Infografis-WFD2026' : `infografis-${mode}`;
const targets = mode === 'wireframe' ? [[1, `infografis-wireframe-1080x1350.png`]]
  : [[1, `${base}_1080x1350.png`], [3, `${base}_3240x4050_cadangan.png`]];

for (const [scale, name] of targets) {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: scale,
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => window.__checkOverflow && window.__checkOverflow());
  if (overflow && overflow.length) console.warn('Peringatan overflow:', overflow);
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  fs.writeFileSync(path.join(root, 'output', name), setPngDpi(png, 300));
  console.log('Tersimpan: output/' + name + ' (' + 1080 * scale + 'x' + 1350 * scale + ' px, 300 DPI)');
  await page.close();
}
await browser.close();
