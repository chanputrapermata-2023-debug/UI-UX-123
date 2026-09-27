// Render poster HTML -> PNG / JPG / PDF with Playwright (Chromium).
// Usage: node render.mjs [--preview]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'output');
fs.mkdirSync(out, { recursive: true });

const W = 1200, H = 1697;              // design size (A-series ratio 1 : 1.414)
const preview = process.argv.includes('--preview');
const exe = process.env.CHROMIUM_PATH ||
  (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const url = 'file://' + path.join(here, 'index.html');

async function shot(scale, file, type = 'png', quality) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__posterReady === true);
  const el = await page.$('#poster');
  await el.screenshot({ path: path.join(out, file), type, ...(quality ? { quality } : {}) });
  await page.close();
  console.log('wrote', file);
}

if (preview) {
  await shot(1, 'preview.png');
} else {
  // A3 @300 dpi = 3508 x 4961 px  (scale 2.9233)
  await shot(3508 / W, 'poster-17-tahun-eximbank-A3-300dpi.jpg', 'jpeg', 92);
  await shot(2480 / W, 'poster-17-tahun-eximbank.png');
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__posterReady === true);
  await page.pdf({
    path: path.join(out, 'poster-17-tahun-eximbank-A3.pdf'),
    width: '297mm', height: '420mm', printBackground: true,
    scale: (297 / 25.4 * 96) / W, pageRanges: '1',
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  console.log('wrote poster-17-tahun-eximbank-A3.pdf');
  await page.close();
}
await browser.close();
