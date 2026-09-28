// Render semua artwork ke PNG (300 DPI) dan PDF vektor memakai Chromium (Playwright).
//   node build.mjs            -> semua file ke export/
//   node build.mjs preview    -> pratinjau cepat (resolusi rendah) ke export/preview/
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, fontCSS } from './src/common.mjs';
import { backSVG, W as BW, H as BH } from './src/back.mjs';
import { mockupSVG, MW, MH } from './src/mockup.mjs';
import { conceptSVG, PW, PH } from './src/concept.mjs';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require('/opt/node22/lib/node_modules/playwright');
}

const preview = process.argv[2] === 'preview';
const OUT = path.join(ROOT, preview ? 'export/preview' : 'export');
fs.mkdirSync(OUT, { recursive: true });

const MM_PER_IN = 25.4;
const DPI = 300;
const pxToMm = (px) => (px / 96) * MM_PER_IN;

const html = (body, bg = 'transparent') => `<!doctype html><html><head><meta charset="utf-8"><style>
${fontCSS}
html,body{margin:0;padding:0;background:${bg};}
body>svg{display:block;width:100vw;height:100vh;}
</style></head><body>${body}</body></html>`;

async function renderPNG(browser, svg, { wmm, hmm, dpi = DPI, file, bg }) {
  // Chromium memakai 96 px CSS per inci; deviceScaleFactor menaikkannya ke DPI target.
  const cssW = Math.round((wmm / MM_PER_IN) * 96);
  const cssH = Math.round((hmm / MM_PER_IN) * 96);
  const page = await browser.newPage({ viewport: { width: cssW, height: cssH }, deviceScaleFactor: dpi / 96 });
  await page.setContent(html(svg, bg || 'transparent'), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: file, omitBackground: !bg });
  await page.close();
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
const out = (name) => path.join(OUT, name);
const jobs = [];

if (preview) {
  jobs.push(renderPNG(browser, backSVG({ shirt: true, mm: false }), { wmm: BW, hmm: BH, dpi: 72, file: out('belakang.png'), bg: '#0099CC' }));
  jobs.push(renderPNG(browser, mockupSVG(), { wmm: pxToMm(MW), hmm: pxToMm(MH), dpi: 96, file: out('mockup.png'), bg: '#fff' }));
  jobs.push(renderPNG(browser, conceptSVG(), { wmm: pxToMm(PW), hmm: pxToMm(PH), dpi: 96, file: out('konsep.png'), bg: '#fff' }));
} else {
  // 1. Papan mockup depan & belakang (3840 x 2160 px)
  jobs.push(renderPNG(browser, mockupSVG(), { wmm: pxToMm(MW), hmm: pxToMm(MH), dpi: 192, file: out('01-mockup-depan-belakang.png'), bg: '#fff' }));
  // 2. Desain belakang 30 x 40 cm @300 DPI, di atas warna kaos + penanda area sponsor
  jobs.push(renderPNG(browser, backSVG({ shirt: true, mm: false }), { wmm: BW, hmm: BH, file: out('02-desain-belakang-30x40cm-300dpi.png'), bg: '#0099CC' }));
  // 3. File cetak: latar transparan, tanpa garis panduan
  jobs.push(renderPNG(browser, backSVG({ shirt: false, guides: false, mm: false }), { wmm: BW, hmm: BH, file: out('03-file-cetak-transparan-30x40cm-300dpi.png') }));
  // 4. Halaman konsep
  jobs.push(renderPNG(browser, conceptSVG(), { wmm: pxToMm(PW), hmm: pxToMm(PH), dpi: 192, file: out('04-konsep-desain.png'), bg: '#fff' }));
  // 5. PDF vektor desain belakang ukuran asli
  jobs.push(renderPDF(browser, [backSVG({ shirt: true, mm: false })], { wmm: BW, hmm: BH, file: out('05-desain-belakang-30x40cm.pdf'), bg: '#0099CC' }));
  // 6. PDF presentasi (mockup + konsep)
  jobs.push(renderPDF(browser, [mockupSVG(), conceptSVG()], { wmm: pxToMm(MW), hmm: pxToMm(MH), file: out('06-presentasi-28uild-2026.pdf') }));
}

for (const f of await Promise.all(jobs)) console.log('✓', path.relative(ROOT, f));
await browser.close();
