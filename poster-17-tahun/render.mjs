// Render poster HTML -> PNG mentah ukuran A4 300 dpi (2480 x 3508 px) dengan Playwright (Chromium).
// Konversi akhir ke JPG/PNG ber-metadata 300 dpi dilakukan oleh finalize.py.
// Usage: node render.mjs [--preview]
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, 'output');
fs.mkdirSync(out, { recursive: true });

const W = 1200, H = 1698;               // desain: 1200 x 1697,42 px (rasio A4)
const A4_300DPI_W = 2480;               // 210 mm @ 300 dpi (tinggi 297 mm = 3508 px)
const preview = process.argv.includes('--preview');
const exe = process.env.CHROMIUM_PATH ||
  (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
    ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined);

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const url = 'file://' + path.join(here, 'index.html');

async function shot(scale, file) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__posterReady === true);
  await (await page.$('#poster')).screenshot({ path: path.join(out, file), type: 'png' });
  await page.close();
  console.log('wrote', file);
}

await shot(preview ? 1 : A4_300DPI_W / W, preview ? 'preview.png' : '_raw-a4.png');

// Versi Instagram 4:5: bidang 1357,94 x 1697,42 px desain (poster A4 utuh di tengah, latar diperlebar),
// dirender 2160 x 2700 px lalu diperkecil ke 1080 x 1350 px oleh finalize.py.
if (!preview) {
  const FH = 1697.42, FW = FH * 4 / 5;
  const page = await browser.newPage({ viewport: { width: Math.ceil(FW), height: Math.ceil(FH) }, deviceScaleFactor: 2160 / FW });
  await page.goto(url + '?ig');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__posterReady === true);
  await page.screenshot({ path: path.join(out, '_raw-ig.png'), clip: { x: 0, y: 0, width: FW, height: FH } });
  await page.close();
  console.log('wrote _raw-ig.png');
}
await browser.close();
