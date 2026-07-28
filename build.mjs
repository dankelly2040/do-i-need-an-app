// Wraps src/page.html (authored as an artifact fragment: title + style + body
// content) into a complete standalone HTML document in dist/, ready for
// `eas deploy`. Keeping the fragment as the source of truth means the artifact
// and the deployed site cannot drift.

import { readFile, writeFile, mkdir } from "node:fs/promises";

const SRC = new URL("./src/page.html", import.meta.url);
const OUT_DIR = new URL("./dist/", import.meta.url);
const OUT = new URL("./index.html", OUT_DIR);

const DESCRIPTION =
  "Describe your business and find out whether a mobile app is worth building, " +
  "which use cases fit, and how to start building it with Expo.";

// Expo chevron, inline so there is no second request and no external asset.
const FAVICON =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 20">' +
      '<path d="M13 1.4 L25.2 18.6 L19.6 18.6 L13 9.2 L6.4 18.6 L0.8 18.6 Z" fill="#1c2024"/>' +
      "</svg>"
  );

// Minimal reset. The artifact runtime supplies one; a standalone page does not.
const RESET = `
  *, *::before, *::after { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; min-height: 100%; }
  img, svg { display: block; max-width: 100%; }
  button, input, select, textarea { font: inherit; color: inherit; }
  ul, ol { margin: 0; }
  h1, h2, h3, h4, p { margin: 0; }
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

const src = await readFile(SRC, "utf8");

const titleMatch = src.match(/<title>([\s\S]*?)<\/title>/i);
if (!titleMatch) throw new Error("src/page.html is missing a <title> element");
const title = titleMatch[1].trim();

const styles = [...src.matchAll(/<style>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
if (styles.length === 0) throw new Error("src/page.html is missing a <style> block");

// Everything after the last </style> is page content (header / main / script).
const lastStyleEnd = src.toLowerCase().lastIndexOf("</style>") + "</style>".length;
const body = src.slice(lastStyleEnd).trim();
if (!body.includes("<main")) throw new Error("Could not find page body after the last <style> block");

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${DESCRIPTION}" />
<meta name="color-scheme" content="light dark" />
<link rel="icon" href="${FAVICON}" />

<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${DESCRIPTION}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${DESCRIPTION}" />

<!-- Prototype. Keep it out of search results until the content is real. -->
<meta name="robots" content="noindex, nofollow" />

<style>${RESET}</style>
<style>${styles.join("\n")}</style>
</head>
<body>
${body}
</body>
</html>
`;

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT, doc, "utf8");

const kb = (Buffer.byteLength(doc, "utf8") / 1024).toFixed(1);
console.log(`Built dist/index.html (${kb} kB)`);
