#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const kbRoot = path.join(root, "docs/TPI-MASTER-DEVELOPMENT/DIRECTIVE-KNOWLEDGE-BASE");

function loadJsonl(file) {
  return fs.readFileSync(path.join(kbRoot, file), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

const args = process.argv.slice(2);
let project = "";
let id = "";
let limit = 12;
let includeDocuments = false;
let json = false;
const queryParts = [];
for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--project") project = (args[++i] ?? "").toUpperCase();
  else if (arg === "--id") id = (args[++i] ?? "").toUpperCase();
  else if (arg === "--limit") limit = Number(args[++i] ?? 12);
  else if (arg === "--documents") includeDocuments = true;
  else if (arg === "--json") json = true;
  else queryParts.push(arg);
}

if (!queryParts.length && !project && !id) {
  console.error("Usage: node scripts/directives/search-knowledge-base.mjs [--project STUDIOFLOW] [--id TPI-STUDIOFLOW-017] [--documents] [--limit 12] query");
  process.exit(2);
}

const records = [
  ...loadJsonl("DIRECTIVE-RECORDS.jsonl"),
  ...(includeDocuments ? loadJsonl("DOCUMENT-ANCHORS.jsonl") : []),
  ...(includeDocuments ? loadJsonl("DOCUMENT-CHUNKS.jsonl") : []),
];
const query = queryParts.join(" ").trim().toLowerCase();
const terms = query ? query.split(/\s+/).filter(Boolean) : [];
const results = records
  .filter((record) => !project || record.projects?.includes(project))
  .filter((record) => !id || record.directive_ids?.some((value) => value.toUpperCase() === id))
  .map((record) => {
    const haystack = JSON.stringify(record).toLowerCase();
    let score = 0;
    if (query && haystack.includes(query)) score += 12;
    for (const term of terms) if (haystack.includes(term)) score += 1;
    if (id && record.directive_ids?.some((value) => value.toUpperCase() === id)) score += 20;
    if (project && record.projects?.[0] === project) score += 3;
    return { score, record };
  })
  .filter(({ score }) => (query || id ? score > 0 : true))
  .sort((a, b) => b.score - a.score || (a.record.master_sequence ?? 999999) - (b.record.master_sequence ?? 999999))
  .slice(0, Math.max(1, limit));

if (json) {
  console.log(JSON.stringify(results.map(({ score, record }) => ({ score, ...record })), null, 2));
} else {
  for (const { score, record } of results) {
    const sequence = record.master_sequence ? `master ${String(record.master_sequence).padStart(4, "0")}` : record.chunk_id ?? "document";
    const ids = record.directive_ids?.join(", ") || "no explicit ID";
    console.log(`[${score}] ${sequence} | ${record.projects?.join(", ")} | ${ids}`);
    console.log(`    ${record.source_locator}`);
    console.log(`    ${record.excerpt}`);
  }
  console.log(`\n${results.length} result(s)`);
}
