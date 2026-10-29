// Branded DI DARKWEB INTEL QR sign: dotted modules, custom finder eyes and the
// portal sigil in the center, framed on a letter-size print sign.
// Usage: node print/make-branded-qr.mjs https://final-url/
// Outputs (in print/out/): branded-qr.svg, branded-qr.png, di-darkweb-qr-sign-letter.pdf
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import QRCode from "qrcode";

const url = process.argv[2];
if (!url || !/^https:\/\//.test(url)) {
  console.error("Pass the final HTTPS URL, e.g. node print/make-branded-qr.mjs https://…");
  process.exit(1);
}
const OUT = "print/out";
mkdirSync(OUT, { recursive: true });

// Level H tolerates ~30% damage; the center badge covers well under 10% of modules.
const qr = QRCode.create(url, { errorCorrectionLevel: "H" });
const n = qr.modules.size;
const dark = (x, y) => qr.modules.get(y, x) === 1;
const QUIET = 4;
const size = n + QUIET * 2;

const INK = "#03110b";        // near-black green: prints dark, scans as black
const PAPER = "#f2fff9";      // pale mint field: high contrast with INK
const GLOW = "#2ee59d";       // sigil accent (badge only; never inside scannable parts)

// Center badge: clear a square ~22% of the symbol width, rounded to whole modules.
const badge = Math.round(n * 0.22) | 1;
const b0 = Math.floor((n - badge) / 2);
const inBadge = (x, y) => x >= b0 - 1 && x < b0 + badge + 1 && y >= b0 - 1 && y < b0 + badge + 1;
const inFinder = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);

let dots = "";
for (let y = 0; y < n; y++) {
  for (let x = 0; x < n; x++) {
    if (!dark(x, y) || inFinder(x, y) || inBadge(x, y)) continue;
    dots += `<circle cx="${x + QUIET + 0.5}" cy="${y + QUIET + 0.5}" r="0.5"/>`;
  }
}

const eye = (fx, fy) => {
  const x = fx + QUIET, y = fy + QUIET;
  return `
    <rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="1.3" fill="none" stroke="${INK}" stroke-width="1"/>
    <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.7" fill="${INK}"/>`;
};

const bx = b0 + QUIET, bs = badge;
const sigil = `
  <g transform="translate(${bx} ${bx})">
    <rect x="0" y="0" width="${bs}" height="${bs}" rx="${bs * 0.22}" fill="${INK}"/>
    <rect x="0.6" y="0.6" width="${bs - 1.2}" height="${bs - 1.2}" rx="${bs * 0.18}" fill="none" stroke="${GLOW}" stroke-width="0.35"/>
    <g transform="translate(${bs * 0.14} ${bs * 0.12}) scale(${(bs * 0.72) / 100})" fill="none" stroke="${GLOW}" stroke-width="7" stroke-linejoin="round">
      <path d="M50 8 92 86H8Z"/>
      <path d="M50 34 72 74H28Z" stroke-width="5" opacity=".6"/>
      <circle cx="50" cy="61" r="8" fill="${GLOW}" stroke="none"/>
    </g>
  </g>`;

const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision">
  <rect width="${size}" height="${size}" rx="2" fill="${PAPER}"/>
  <g fill="${INK}">${dots}</g>
  ${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}
  ${sigil}
</svg>`;
writeFileSync(`${OUT}/branded-qr.svg`, qrSvg);

const font = (f) => `data:font/woff2;base64,${readFileSync(`src/fonts/${f}`).toString("base64")}`;
const web = (cls) => `<svg class="web ${cls}" viewBox="0 0 200 200"><g fill="none" stroke="currentColor" stroke-width="1.1"><path d="M0 0 200 60M0 0 150 150M0 0 60 200M0 0 200 0M0 0 0 200"/><path d="M40 0Q34 20 0 40M80 0Q66 46 0 80M120 0Q100 70 0 120M160 0Q132 96 0 160M200 0Q166 120 0 200"/></g></svg>`;
const bat = (cls) => `<svg class="bat ${cls}" viewBox="0 0 100 46"><path d="M50 14c3-7 6-9 6-9l2 7c8-6 22-7 32-2-7 2-10 7-10 12-8-5-17-3-22 4-3-4-5-6-8-6s-5 2-8 6c-5-7-14-9-22-4 0-5-3-10-10-12 10-5 24-4 32 2l2-7s3 2 6 9z" fill="currentColor"/></svg>`;

const sign = `<!doctype html>
<html><head><meta charset="utf-8"><title>DI DARKWEB INTEL: scan sign</title>
<style>
  @font-face { font-family: "Chakra Petch"; font-weight: 700; src: url(${font("chakra-petch-latin-700-normal.woff2")}) format("woff2"); }
  @font-face { font-family: "Chakra Petch"; font-weight: 500; src: url(${font("chakra-petch-latin-500-normal.woff2")}) format("woff2"); }
  @font-face { font-family: "JetBrains Mono"; font-weight: 500; src: url(${font("jetbrains-mono-latin-500-normal.woff2")}) format("woff2"); }
  @font-face { font-family: "Inter"; font-weight: 400; src: url(${font("inter-latin-400-normal.woff2")}) format("woff2"); }
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body { width: 8.5in; height: 11in; position: relative; overflow: hidden; color: #e6efec;
         background: radial-gradient(90% 55% at 50% 0%, #0d2c23 0%, #050807 62%), #050807;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .scan { position: absolute; inset: 0; background: repeating-linear-gradient(to bottom, transparent 0 3px, rgba(0,0,0,.28) 3px 4px); }
  .web { position: absolute; width: 2.4in; height: 2.4in; color: rgba(147,166,161,.32); }
  .tl { top: 0; left: 0; } .br { bottom: 0; right: 0; transform: rotate(180deg); }
  .bat { position: absolute; color: #0f1916; }
  .b1 { width: 1.1in; top: 1.15in; right: .9in; transform: rotate(10deg); }
  .b2 { width: .7in; top: .75in; right: 2.1in; transform: rotate(-8deg); opacity: .8; }
  .b3 { width: .55in; bottom: 1.35in; left: 1.05in; transform: rotate(-14deg); opacity: .7; }
  .frame { position: absolute; inset: .45in; border: 2px solid #39ffb0; border-radius: .28in;
           box-shadow: 0 0 .35in rgba(57,255,176,.35), inset 0 0 .35in rgba(57,255,176,.12); }
  .corner { position: absolute; width: .32in; height: .32in; border: 4px solid #39ffb0; }
  .c1 { top: .33in; left: .33in; border-right: 0; border-bottom: 0; border-radius: .1in 0 0 0; }
  .c2 { top: .33in; right: .33in; border-left: 0; border-bottom: 0; border-radius: 0 .1in 0 0; }
  .c3 { bottom: .33in; left: .33in; border-right: 0; border-top: 0; border-radius: 0 0 0 .1in; }
  .c4 { bottom: .33in; right: .33in; border-left: 0; border-top: 0; border-radius: 0 0 .1in 0; }
  .content { position: absolute; inset: .45in; display: flex; flex-direction: column; align-items: center; text-align: center; padding: .55in .6in 0; }
  .eyebrow { font: 500 11pt/1 "JetBrains Mono", monospace; letter-spacing: .32em; color: #39ffb0; text-transform: uppercase; }
  h1 { margin: .18in 0 0; font: 700 64pt/.92 "Chakra Petch", sans-serif; letter-spacing: .03em; color: #f0fff9;
       text-shadow: 0 0 18px rgba(57,255,176,.55), -2px 0 rgba(34,211,238,.55), 2px 0 rgba(255,77,109,.45); }
  .tag { margin: .2in 0 0; font: 500 15pt/1.3 "JetBrains Mono", monospace; color: #93a6a1; }
  .tag b { color: #39ffb0; font-weight: 500; }
  .qrwrap { margin-top: .38in; padding: .14in; border-radius: .26in; background: linear-gradient(135deg, #39ffb0, #22d3ee);
            box-shadow: 0 0 .5in rgba(57,255,176,.45); }
  .qrwrap svg { display: block; width: 4.1in; height: 4.1in; border-radius: .16in; }
  .cta { margin: .32in 0 0; font: 700 26pt/1 "Chakra Petch", sans-serif; letter-spacing: .14em; color: #39ffb0; text-transform: uppercase; }
  .cta span { display: inline-block; width: .32in; height: .07in; margin: 0 .14in; vertical-align: middle; background: #39ffb0; }
  .fine { position: absolute; left: 0; right: 0; bottom: .32in; font: 400 9.5pt/1.45 Inter, Arial, sans-serif; color: #7d918c; }
</style></head>
<body>
  <div class="scan"></div>
  ${web("tl")}${web("br")}${bat("b1")}${bat("b2")}${bat("b3")}
  <div class="frame"></div>
  <div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div>
  <div class="content">
    <div class="eyebrow">// restricted access · halloween edition</div>
    <h1>DI DARKWEB<br>INTEL</h1>
    <p class="tag">Not everything in DI is <b>above ground.</b></p>
    <div class="qrwrap">${qrSvg}</div>
    <p class="cta"><span></span>Scan to enter<span></span></p>
    <p class="fine">A Halloween parody marketplace. Every listing is fictional.<br>No real data, credentials or purchases. Bank of Dad not FDIC insured.</p>
  </div>
</body></html>`;
writeFileSync(`${OUT}/di-darkweb-qr-sign.html`, sign);

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(sign, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: `${OUT}/di-darkweb-qr-sign-letter.pdf`, format: "Letter", printBackground: true });
// Standalone high-res PNG of just the branded code (for slides, emails, other layouts).
await page.setViewportSize({ width: 1600, height: 1600 });
await page.setContent(`<body style="margin:0;background:#fff">${qrSvg.replace("<svg ", '<svg width="1600" height="1600" ')}</body>`);
await page.screenshot({ path: `${OUT}/branded-qr.png`, clip: { x: 0, y: 0, width: 1600, height: 1600 } });
await browser.close();
console.log(`Branded QR (${n}×${n} modules, badge ${badge}×${badge}) for ${url} written to ${OUT}/`);
