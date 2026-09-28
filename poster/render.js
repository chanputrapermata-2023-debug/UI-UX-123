// Renders poster.html to print-ready files.
// Usage: node poster/render.js   (needs Playwright; set NODE_PATH if it is installed globally)
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "output");
const SRC = "file://" + path.join(__dirname, "poster.html");

(async () => {
  const browser = await chromium.launch();

  const shoot = async (scale, file, opts = {}) => {
    const page = await browser.newPage({ viewport: { width: 1123, height: 1587 }, deviceScaleFactor: scale });
    await page.goto(SRC);
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#poster").screenshot({ path: path.join(OUT, file), ...opts });
    await page.close();
  };

  // A3 portrait: 1123 x 1587 CSS px; x3.125 is ~300 dpi (3509 x 4959 px)
  await shoot(3.125, "poster-A3-300dpi.png");
  await shoot(3.125, "poster-A3-300dpi.jpg", { type: "jpeg", quality: 92 });
  await shoot(1, "poster-preview.png");

  const page = await browser.newPage({ viewport: { width: 1123, height: 1587 } });
  await page.goto(SRC);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(OUT, "poster-A3.pdf"), width: "297mm", height: "420mm", printBackground: true, pageRanges: "1" });

  await browser.close();
})();
