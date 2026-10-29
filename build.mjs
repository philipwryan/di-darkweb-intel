// Bundles src/ into one self-contained dist/index.html:
// CSS, JS, fonts and images are all inlined (images and fonts as base64 data URIs).
// Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const SRC = "src";
const OUT = "dist";
const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2" };

const read = (p) => readFileSync(join(SRC, p), "utf8");
const dataUri = (p) => {
  const file = join(SRC, p);
  if (!existsSync(file)) throw new Error(`Missing asset: ${file}`);
  return `data:${MIME[extname(p)]};base64,${readFileSync(file).toString("base64")}`;
};
// Replace every quoted relative asset path (img/... or fonts/...) with a data URI.
const inlineAssets = (text) =>
  text.replace(/(["'(])((?:img|fonts)\/[\w./-]+\.(?:webp|png|jpg|svg|woff2))(["')])/g, (_, a, p, b) => `${a}${dataUri(p)}${b}`);
const safeScript = (js) => js.replace(/<\/script/gi, "<\\/script");

let html = read("index.html");
html = html.replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${inlineAssets(read("styles.css"))}\n</style>`);
html = html.replace('<script src="data.js"></script>', () => `<script>\n${safeScript(inlineAssets(read("data.js")))}\n</script>`);
html = html.replace('<script src="app.js"></script>', () => `<script>\n${safeScript(read("app.js"))}\n</script>`);

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "index.html"), html);
console.log(`dist/index.html  ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
