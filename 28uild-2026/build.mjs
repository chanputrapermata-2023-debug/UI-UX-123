// Render semua artwork ke PNG (300 DPI) dan PDF vektor memakai Chromium (Playwright).
//   node build.mjs                 -> semua karya ke export/<karya>/
//   node build.mjs preview         -> pratinjau cepat (resolusi rendah) ke export/preview/
//   node build.mjs [preview] 2     -> hanya karya yang slug-nya mengandung "2"
import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, fontCSS } from './src/common.mjs';
import { W as BW, H as BH } from './src/common.mjs';
import { mockupSVG, MW, MH } from './src/mockup.mjs';
import { conceptSVG, PW, PH } from './src/concept.mjs';
import { karya1 } from './src/karya1.mjs';
import { karya2 } from './src/karya2.mjs';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require('/opt/node22/lib/node_modules/playwright');
}

const args = process.argv.slice(2);
const preview = args.includes('preview');
const only = args.find((a) => a !== 'preview');
const DESIGNS = [karya1, karya2].filter((d) => !only || d.slug.includes(only));

const MM_PER_IN = 25.4;
const DPI = 300;
const pxToMm = (px) => (px / 96) * MM_PER_IN;

const html = (body, bg = 'transparent') => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCSS}
html,body{margin:0;padding:0;background:${bg};}
body>svg{display:block;width:100vw;height:100vh;}
</style></head><body>${body}</body></html>`;

// Tulis resolusi (pHYs) ke PNG supaya aplikasi desain/percetakan membaca DPI yang benar.
function setPngDpi(file, dpi) {
  const png = fs.readFileSync(file);
  const ppm = Math.round(dpi / 0.0254);
  const data = Buffer.alloc(9);
  data.writeUInt32BE(ppm, 0);
  data.writeUInt32BE(ppm, 4);
  data.writeUInt8(1, 8); // satuan: meter
  const type = Buffer.from('pHYs');
  const chunk = Buffer.alloc(21);
  chunk.writeUInt32BE(9, 0);
  type.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(zlib.crc32(Buffer.concat([type, data])), 17);
  const ihdrEnd = 8 + 25; // signature + chunk IHDR
  fs.writeFileSync(file, Buffer.concat([png.subarray(0, ihdrEnd), chunk, png.subarray(ihdrEnd)]));
}

async function renderPNG(browser, svg, { wmm, hmm, dpi = DPI, file, bg }) {
  // Chromium memakai 96 px CSS per inci; deviceScaleFactor menaikkannya ke DPI target.
  const cssW = Math.round((wmm / MM_PER_IN) * 96);
  const cssH = Math.round((hmm / MM_PER_IN) * 96);
  const page = await browser.newPage({ viewport: { width: cssW, height: cssH }, deviceScaleFactor: dpi / 96 });
  await page.setContent(html(svg, bg || 'transparent'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: !bg });
  await page.close();
  setPngDpi(file, dpi);
  return file;
}

// Beberapa SVG -> satu PDF (satu SVG per halaman), tetap vektor.
async function renderPDF(browser, svgs, { wmm, hmm, file, bg = '#ffffff' }) {
  const page = await browser.newPage();
  const body = svgs.map((s) => `<section>${s}</section>`).join('');
  await page.setContent(
    html(body, bg).replace(
      'body>svg{display:block;width:100vw;height:100vh;}',
      `@page{size:${wmm}mm ${hmm}mm;margin:0}
       section{width:${wmm}mm;height:${hmm}mm;overflow:hidden;break-after:page;}
       section:last-child{break-after:auto;}
       section>svg{display:block;width:${wmm}mm;height:${hmm}mm;}`,
    ),
    { waitUntil: 'load' },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: file, width: `${wmm}mm`, height: `${hmm}mm`, printBackground: true });
  await page.close();
  return file;
}

const browser = await playwright.chromium.launch();
const jobs = [];

for (const d of DESIGNS) {
  const OUT = path.join(ROOT, 'export', preview ? 'preview' : d.slug);
  fs.mkdirSync(OUT, { recursive: true });
  const out = (name) => path.join(OUT, preview ? `${d.slug}-${name}` : name);
  const back = (o) => d.backSVG({ mm: false, ...o });

  if (preview) {
    jobs.push(renderPNG(browser, back({ shirt: true }), { wmm: BW, hmm: BH, dpi: 72, file: out('belakang.png'), bg: '#0099CC' }));
    jobs.push(renderPNG(browser, mockupSVG(d), { wmm: pxToMm(MW), hmm: pxToMm(MH), dpi: 96, file: out('mockup.png'), bg: '#fff' }));
    jobs.push(renderPNG(browser, conceptSVG(d), { wmm: pxToMm(PW), hmm: pxToMm(PH), dpi: 96, file: out('konsep.png'), bg: '#fff' }));
    continue;
  }
  // 1. Papan mockup depan & belakang (3840 x 2160 px)
  jobs.push(renderPNG(browser, mockupSVG(d), { wmm: pxToMm(MW), hmm: pxToMm(MH), dpi: 192, file: out('01-mockup-depan-belakang.png'), bg: '#fff' }));
  // 2. Desain belakang 30 x 40 cm @300 DPI, di atas warna kaos + penanda area sponsor
  jobs.push(renderPNG(browser, back({ shirt: true }), { wmm: BW, hmm: BH, file: out('02-desain-belakang-30x40cm-300dpi.png'), bg: '#0099CC' }));
  // 3. File cetak: latar transparan, tanpa garis panduan
  jobs.push(renderPNG(browser, back({ guides: false }), { wmm: BW, hmm: BH, file: out('03-file-cetak-transparan-30x40cm-300dpi.png') }));
  // 4. Halaman konsep
  jobs.push(renderPNG(browser, conceptSVG(d), { wmm: pxToMm(PW), hmm: pxToMm(PH), dpi: 192, file: out('04-konsep-desain.png'), bg: '#fff' }));
  // 5. PDF vektor desain belakang ukuran asli
  jobs.push(renderPDF(browser, [back({ shirt: true })], { wmm: BW, hmm: BH, file: out('05-desain-belakang-30x40cm.pdf'), bg: '#0099CC' }));
  // 6. PDF presentasi (mockup + konsep)
  jobs.push(renderPDF(browser, [mockupSVG(d), conceptSVG(d)], { wmm: pxToMm(MW), hmm: pxToMm(MH), file: out(`06-presentasi-${d.slug}.pdf`) }));
}

for (const f of await Promise.all(jobs)) console.log('✓', path.relative(ROOT, f));
await browser.close();
