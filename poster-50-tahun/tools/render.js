// Render a local HTML/SVG file to PNG with the preinstalled Chromium.
// usage: node render.js <input> <output.png> [width] [height] [scale] [clipX clipY clipW clipH]
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const [, , input, output, w = '1123', h = '1587', scale = '1', cx, cy, cw, ch] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: +scale });
  await page.goto('file://' + path.resolve(input));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  const clip = cx !== undefined ? { x: +cx, y: +cy, width: +cw, height: +ch } : { x: 0, y: 0, width: +w, height: +h };
  await page.screenshot({ path: output, clip });
  await browser.close();
})();
