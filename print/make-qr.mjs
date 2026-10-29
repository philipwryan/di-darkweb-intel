// Generates the printable QR sign once the live URL is known.
// Usage: node print/make-qr.mjs https://example.com/di-darkweb-intel/
// Outputs (in print/out/): qr.svg, qr.png, qr-card.html, qr-card-letter.pdf
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import QRCode from "qrcode";

const url = process.argv[2];
if (!url || !/^https:\/\//.test(url)) {
  console.error("Pass the final HTTPS URL, e.g. node print/make-qr.mjs https://…");
  process.exit(1);
}

const OUT = "print/out";
mkdirSync(OUT, { recursive: true });

// Error correction H survives smudges and glare; margin 4 modules is the spec quiet zone.
const opts = { errorCorrectionLevel: "H", margin: 4, color: { dark: "#000000", light: "#ffffff" } };
const svg = await QRCode.toString(url, { ...opts, type: "svg" });
writeFileSync(`${OUT}/qr.svg`, svg);
await QRCode.toFile(`${OUT}/qr.png`, url, { ...opts, width: 1200 });

const card = `<!doctype html>
<html><head><meta charset="utf-8"><title>DI DARKWEB INTEL: QR sign</title>
<style>
  @page { size: letter; margin: 0; }
  html, body { margin: 0; }
  body { width: 8.5in; height: 11in; display: grid; place-items: center; background: #050807; color: #e6efec;
         font-family: "Chakra Petch", "Arial Narrow", Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .card { width: 6.5in; text-align: center; padding: .6in .5in; border: 2px solid #39ffb0; border-radius: .3in;
          box-shadow: 0 0 .4in rgba(57,255,176,.35); background: radial-gradient(120% 60% at 50% 0%, #0c2620, #050807 70%); }
  .sigil { width: .7in; height: .7in; color: #39ffb0; }
  h1 { margin: .15in 0 0; font-size: 46pt; line-height: 1; letter-spacing: .04em; color: #effff8; }
  .prompt { margin: .2in 0 .35in; font: 600 20pt/1.2 "Courier New", monospace; color: #39ffb0; }
  .qr { display: inline-block; background: #fff; padding: .25in; border-radius: .12in; }
  .qr svg { display: block; width: 3.6in; height: 3.6in; }
  .fine { margin: .35in 0 0; font: 11pt/1.4 Arial, sans-serif; color: #93a6a1; }
</style></head>
<body><div class="card">
  <svg class="sigil" viewBox="0 0 100 100"><g fill="none" stroke="currentColor" stroke-width="3"><path d="M50 8 92 86H8Z"/><path d="M50 30 74 74H26Z" opacity=".55"/></g><circle cx="50" cy="60" r="7" fill="currentColor"/></svg>
  <h1>DI DARKWEB INTEL</h1>
  <p class="prompt">Scan to enter the underground</p>
  <div class="qr">${svg}</div>
  <p class="fine">A Halloween parody. Every listing is fictional.<br>No real data, credentials or purchases.</p>
</div></body></html>`;
writeFileSync(`${OUT}/qr-card.html`, card);

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(card);
await page.pdf({ path: `${OUT}/qr-card-letter.pdf`, format: "Letter", printBackground: true });
await browser.close();
console.log(`QR for ${url} written to ${OUT}/`);
