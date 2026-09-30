// Render design/infografis.html menjadi PNG 1080x1350 (1x) dan 2160x2700 (2x).
// Pemakaian:
//   node scripts/render.mjs --nama "Nama Lengkap" --instansi "Universitas X"
//   node scripts/render.mjs --mode wireframe
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

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

for (const scale of [1, 2]) {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: scale,
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const overflow = await page.evaluate(() => window.__checkOverflow && window.__checkOverflow());
  if (overflow && overflow.length) console.warn('Peringatan overflow:', overflow);
  const name = `infografis-${mode}-${1080 * scale}x${1350 * scale}.png`;
  await page.screenshot({ path: path.join(root, 'output', name), clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  console.log('Tersimpan: output/' + name);
  await page.close();
}
await browser.close();
