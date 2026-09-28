// Render crop of the back artwork for close inspection: [KARYA=1] node tools/zoom.mjs x y w h dpi out
import path from 'node:path';
import { createRequire } from 'node:module';
import { fontCSS } from '../src/common.mjs';
const { backSVG } = await import(`../src/karya${process.env.KARYA ?? '3'}.mjs`);
const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const [x, y, w, h, dpi, out] = process.argv.slice(2);
const svg = backSVG({ shirt: true, mm: false }).replace(/viewBox="[^"]*"/, `viewBox="${x} ${y} ${w} ${h}"`);
const b = await chromium.launch();
const px = (+w / 25.4) * 96, py = (+h / 25.4) * 96;
const p = await b.newPage({ viewport: { width: Math.round(px), height: Math.round(py) }, deviceScaleFactor: +dpi / 96 });
await p.setContent(`<style>${fontCSS} body{margin:0} svg{display:block;width:100vw;height:100vh}</style>${svg}`);
await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: out });
await b.close();
