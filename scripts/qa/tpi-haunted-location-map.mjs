#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const page = readFileSync(resolve(root, "haunted-locations.html"), "utf8");
const script = readFileSync(resolve(root, "haunted-locations-map.js"), "utf8");
const style = readFileSync(resolve(root, "haunted-locations-map.css"), "utf8");
const failures = [];

const check = (label, condition, detail = "") => {
  if (!condition) failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
  console.log(`${condition ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

const stateCards = [...page.matchAll(/href="haunted-location-directory\/([^\"]+)\.html"><strong>([^<]+)<\/strong><span>([^<]+)<\/span>/g)];
const slugs = new Set(stateCards.map(match => match[1]));
const mapAssetMatch = page.match(/data-map-assets="([^"]+)"/);
const mapAssets = mapAssetMatch ? mapAssetMatch[1].split(/\s+/).filter(Boolean) : [];
const mapGroupIds = new Set(mapAssets.flatMap(asset => {
  const source = readFileSync(resolve(root, asset), "utf8");
  return [...source.matchAll(/<g id="([A-Z]{2})"/g)].map(match => match[1]);
}));
const stateCodes = [...script.matchAll(/:\s*'([A-Z]{2})'/g)].map(match => match[1]);
const stateCodeSet = new Set(stateCodes);

check("Haunted Locations includes the TPI map stylesheet", page.includes('href="haunted-locations-map.css?v=1"'));
check("Haunted Locations includes the TPI map script", page.includes('src="haunted-locations-map.js?v=1"'));
check("map has an accessible Haunted USA Locations heading", page.includes('id="haunted-usa-map-title">Haunted USA Locations</h2>'));
check("map has a state selector and live status region", page.includes('id="haunted-usa-state-select"') && page.includes('id="haunted-usa-map-status"'));
check("map has a selected-state directory link", page.includes('id="haunted-usa-selected-link"'));
check("all 50 state cards remain available below the map", stateCards.length === 50, `found ${stateCards.length}`);
check("map loads local state-boundary geometry", mapAssets.length > 0 && mapAssets.every(asset => page.includes(asset)), `found ${mapAssets.length} map assets`);
check("map geometry covers all 50 state codes", stateCodeSet.size === 50 && [...stateCodeSet].every(code => mapGroupIds.has(code)), `found ${mapGroupIds.size} geometry groups`);
check("map geometry includes actual state boundary paths", mapAssets.every(asset => readFileSync(resolve(root, asset), "utf8").includes('class="boundary"')));
check("map renders keyboard-accessible state controls", script.includes("setAttribute('role', 'button')") && script.includes("setAttribute('tabindex', '0')") && script.includes("event.key !== 'Enter'"));
check("map derives displayed totals from the unified State Directory cards", script.includes("#state-directory a[href*="));
check("map credits its boundary geometry source", page.includes("deytah/svg-us-map") && page.includes("CC BY-SA 3.0"));
check("map has responsive layout rules", style.includes("@media (max-width: 900px)") && style.includes("@media (max-width: 680px)"));
check("legacy split directory headings are absent", !page.includes("Complete State Directory") && !page.includes("New State Research Leads"));

if (failures.length) {
  console.error(`TPI Haunted USA map verification failed: ${failures.length} check(s).`);
  process.exit(1);
}
console.log(`TPI Haunted USA map verification passed: ${stateCards.length} state cards and ${stateCodeSet.size} state-boundary controls.`);
