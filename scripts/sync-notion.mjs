// Pulls the research table from Notion into data/notion-research.json.
//
//   NOTION_TOKEN=ntn_... node scripts/sync-notion.mjs
//   node scripts/build-research.mjs
//   node build.mjs && npx eas-cli deploy --prod
//
// The token needs read access to "Mobile App Business Cases by Industry".
// Create an internal integration at notion.so/my-integrations, then share the
// database with it (Share → Connections → your integration).
//
// The current snapshot in data/notion-research.json was taken through the
// Notion MCP connector rather than this script, and is scoped to the rows that
// back the industries the picker offers. Running this pulls every row.

import { writeFile } from "node:fs/promises";

const DATABASE_ID = "84b4f706-3ae1-4868-8044-6c4806ba632f";
const OUT = new URL("../data/notion-research.json", import.meta.url);

const token = process.env.NOTION_TOKEN;
if (!token) {
  console.error("NOTION_TOKEN is not set. See the header of this file.");
  process.exit(1);
}

async function notion(path, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Notion ${path} returned ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

// Notion returns rich text as an array of runs; join their plain_text.
const plain = (prop) => {
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("");
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("");
  if (prop.type === "select") return prop.select ? prop.select.name : "";
  return "";
};

const pages = [];
let cursor;
do {
  const page = await notion(`databases/${DATABASE_ID}/query`, cursor ? { start_cursor: cursor } : {});
  pages.push(...page.results);
  cursor = page.has_more ? page.next_cursor : undefined;
} while (cursor);

const rows = pages
  .map((p) => ({
    industry: plain(p.properties["Industry"]),
    roi: plain(p.properties["ROI Archetype"]),
    metrics: plain(p.properties["Key Value Drivers & Metrics"]),
    why: plain(p.properties["Strategic Business Case (Why)"]),
    considerations: plain(p.properties["Vertical-Specific Considerations"]),
  }))
  .filter((r) => r.industry && r.metrics)
  .sort((a, b) => a.industry.localeCompare(b.industry));

if (!rows.length) throw new Error("Query returned no usable rows — check the integration has access.");

const payload = {
  source: {
    database: "Mobile App Business Cases by Industry",
    databaseId: DATABASE_ID,
    url: `https://app.notion.com/p/${DATABASE_ID.replace(/-/g, "")}`,
    syncedAt: new Date().toISOString().slice(0, 10),
    note: `Full table pulled by scripts/sync-notion.mjs. ${rows.length} rows.`,
  },
  rows,
};

await writeFile(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Wrote data/notion-research.json (${rows.length} rows)`);
console.log("Next: node scripts/build-research.mjs");
