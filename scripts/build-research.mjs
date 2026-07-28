// Turns data/notion-research.json into src/research.generated.js.
//
// The Notion table holds each industry's findings as one dense paragraph in
// "Key Value Drivers & Metrics". This splits that into individual claims,
// pulls out the headline figure, and works out how much weight to give each
// one — including honouring the weight guidance written into the prose
// ("high weight", "low weight, do not lead with it", "vendor aggregation").
//
// Run after scripts/sync-notion.mjs, or after editing the snapshot by hand.

import { readFile, writeFile } from "node:fs/promises";

const RAW = new URL("../data/notion-research.json", import.meta.url);
const OUT = new URL("../src/research.generated.js", import.meta.url);

// Named sources carry real weight. Vendor aggregations do not.
const NAMED_SOURCES = [
  "McKinsey", "Aberdeen", "Nielsen", "ABA", "AMA", "J.D. Power", "Criteo",
  "Sensor Tower", "Antavo", "ACEEE", "NPD", "Statista", "Gartner", "MobiLoud",
  "Ticketmaster", "Google", "Shopify", "Moxo", "Pushpay", "Barna", "Pew"
];

function detectSource(text) {
  // An explicit parenthetical wins: "(Aberdeen)", "(NPD)", "(AMA, up from…)".
  const paren = text.match(/\(([^)]*)\)/g) || [];
  for (const p of paren) {
    for (const s of NAMED_SOURCES) {
      if (p.includes(s)) return s;
    }
  }
  for (const s of NAMED_SOURCES) {
    if (text.includes(s)) return s;
  }
  return null;
}

function detectConfidence(text, source) {
  const t = text.toLowerCase();
  // The table sometimes says outright how much weight a claim deserves.
  if (t.includes("high weight") || t.includes("first-party and specific")) return "strong";
  if (t.includes("low weight") || t.includes("do not lead with it")) return "vendor";
  if (t.includes("vendor benchmark") || t.includes("vendor aggregation") ||
      t.includes("vendor case study") || t.includes("single vendor")) return "vendor";
  if (t.includes("projected") || t.includes("cagr") || t.includes("estimat")) return "directional";
  if (source) return "strong";
  // "Starbucks: 30M+ mobile users…" is company reported, not a guess.
  if (/^[A-Z][A-Za-z.'&-]*(?: [A-Z][A-Za-z.'&-]*)*:/.test(text.trim())) return "strong";
  return "directional";
}

// The headline number a card leads with. Take whichever figure appears
// earliest, not whichever pattern is listed first — otherwise a trailing
// "+12% YoY" beats the "1B+ installs" the claim is actually about.
function detectStat(text) {
  const patterns = [
    /\$[\d.,]+ ?(?:B|M|K|bn|billion|million)?/i,   // $1.77B
    /\d[\d.,]*\s?(?:B|M|K)\+?\b/,                  // 30M+, 1B+
    /[+-]?\d[\d.,]*\s?%/,                          // 60%, +237%
    /\d[\d.,]*\s?(?:x|×)\b/i,                      // 2.2x
    /\d[\d.,]*/                                    // bare number, last resort
  ];
  let bestAt = Infinity;
  let best = null;
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m.index < bestAt) { bestAt = m.index; best = m[0]; }
  }
  return best ? best.replace(/\s+/g, "").replace(/^~/, "").replace(/[.,;:]+$/, "") : null;
}

// Claims are usually semicolon separated, but some rows run them together as
// sentences. Split on semicolons, then break any long chunk at a sentence
// boundary that starts a new claim.
function splitClaims(metrics) {
  const out = [];
  for (const chunk of metrics.split(/;\s+/)) {
    if (chunk.length <= 200) { out.push(chunk); continue; }
    const parts = chunk.split(/(?<=[.!])\s+(?=[A-Z])/);
    for (const p of parts) out.push(p);
  }
  return out;
}

// Strip the meta-commentary so the card reads as a finding, not a note to self.
function cleanClaim(text) {
  return text
    .replace(/—\s*(first-party and specific,\s*)?(high|low) weight[^.;]*/gi, "")
    .replace(/,?\s*(single vendor case study|vendor aggregation|vendor benchmark)\b/gi, "")
    .replace(/\s*,?\s*do not lead with it\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.;,])/g, "$1")
    .replace(/[,;\s]+$/, "")
    .trim();
}

const raw = JSON.parse(await readFile(RAW, "utf8"));

const industries = raw.rows.map((row) => {
  // Pull out any GAPS note first: it is guidance for us, never a claim.
  let metrics = row.metrics;
  let gap = null;
  const gapMatch = metrics.match(/GAPS?:\s*(.+)$/i);
  if (gapMatch) {
    gap = gapMatch[1].trim();
    metrics = metrics.slice(0, gapMatch.index).trim();
  }

  const claims = splitClaims(metrics)
    .map((s) => s.trim())
    .filter((s) => s.length > 25)
    .map((chunk) => {
      const source = detectSource(chunk);
      const confidence = detectConfidence(chunk, source);
      const stat = detectStat(chunk);
      const claim = cleanClaim(chunk);
      const label = source || (confidence === "strong" ? "Company reported" : "Industry research");
      return stat && claim ? { stat, claim, source: label, confidence } : null;
    })
    .filter(Boolean);

  return {
    industry: row.industry,
    roi: row.roi,
    why: row.why,
    considerations: row.considerations,
    gap,
    claims
  };
});

const total = industries.reduce((n, i) => n + i.claims.length, 0);
const byConfidence = industries
  .flatMap((i) => i.claims)
  .reduce((acc, c) => ((acc[c.confidence] = (acc[c.confidence] || 0) + 1), acc), {});

const banner = `/* Generated by scripts/build-research.mjs from data/notion-research.json.
   Do not edit by hand — edit the Notion table, re-sync, and rebuild.
   Source: ${raw.source.database} (${raw.source.url})
   Snapshot: ${raw.source.syncedAt} · ${industries.length} industries · ${total} claims */`;

const body = `${banner}

var RESEARCH = ${JSON.stringify({ source: raw.source, industries }, null, 1)};
`;

await writeFile(OUT, body, "utf8");

console.log(`Wrote src/research.generated.js`);
console.log(`  ${industries.length} industries, ${total} claims`);
console.log(`  confidence: ${Object.entries(byConfidence).map(([k, v]) => `${k} ${v}`).join(", ")}`);
for (const i of industries) {
  const g = i.gap ? " · GAP noted" : "";
  console.log(`  ${String(i.claims.length).padStart(2)} claims  ${i.industry}${g}`);
}
