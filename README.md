# DI DARKWEB INTEL

A fictional Halloween "dark web" marketplace starring nine DI colleagues. It's a parody: no real data, credentials or payments.

The deliverable is **one self-contained file**, `dist/index.html` (~3.4 MB). It has every image, font, style and script inlined, so it can be hosted anywhere that serves a static HTML file.

## Layout

| Path | What |
| --- | --- |
| `src/index.html`, `src/styles.css`, `src/app.js` | Editable source (no framework) |
| `src/data.js` | All listing copy, prices and image lists, one entry per seller |
| `src/img/` | Web-optimized portraits and product art (WebP) |
| `build.mjs` | Inlines everything into `dist/index.html` |
| `print/make-qr.mjs` | Builds the printable QR sign once the live URL exists |

## Commands

```bash
npm install
npm run build                        # → dist/index.html
npm run qr -- https://final-url/          # → print/out/ plain qr.svg, qr.png, qr-card-letter.pdf
npm run qr:branded -- https://final-url/  # → print/out/ branded-qr.svg/.png, di-darkweb-qr-sign-letter.pdf
```

## Pages (hash routes, so deep links work from a single file)

- `#/` portal · `#/market` seller roster · `#/seller/<name>` listing · `#/cart` Bank of Dad checkout · `#/receipt`

## Adding the missing art

Jason and Zach each have one product image; the brief calls for a second. Drop the new WebP into
`src/img/products/<name>/` and add an entry to that seller's `images` array in `src/data.js` (there is a TODO at the spot). Then run `npm run build`.
To replace Zach's portrait, overwrite `src/img/portraits/zach_portrait.webp` (square, ~720px).
