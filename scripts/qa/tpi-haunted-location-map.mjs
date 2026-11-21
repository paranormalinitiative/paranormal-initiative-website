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
const coordinates = [...script.matchAll(/\['([a-z-]+)', '([A-Z]{2})',/g)];
const slugs = new Set(stateCards.map(match => match[1]));
const coordinateSlugs = new Set(coordinates.map(match => match[1]));

check("Haunted Locations includes the TPI map stylesheet", page.includes('href="haunted-locations-map.css?v=1"'));
check("Haunted Locations includes the TPI map script", page.includes('src="haunted-locations-map.js?v=1"'));
check("map has an accessible Haunted USA Locations heading", page.includes('id="haunted-usa-map-title">Haunted USA Locations</h2>'));
check("map has a state selector and live status region", page.includes('id="haunted-usa-state-select"') && page.includes('id="haunted-usa-map-status"'));
check("map has a selected-state directory link", page.includes('id="haunted-usa-selected-link"'));
check("all 50 state cards remain available below the map", stateCards.length === 50, `found ${stateCards.length}`);
check("map defines one coordinate for every state card", coordinates.length === 50 && [...slugs].every(slug => coordinateSlugs.has(slug)), `found ${coordinates.length} coordinates`);
check("map coordinates do not contain duplicate state slugs", coordinateSlugs.size === coordinates.length, `found ${coordinateSlugs.size} unique slugs`);
check("map renders keyboard-accessible state controls", script.includes('role="button"') && script.includes('tabindex="0"') && script.includes("event.key !== 'Enter'"));
check("map derives displayed totals from the unified State Directory cards", script.includes("#state-directory a[href*="));
check("map has responsive layout rules", style.includes("@media (max-width: 900px)") && style.includes("@media (max-width: 680px)"));
check("legacy split directory headings are absent", !page.includes("Complete State Directory") && !page.includes("New State Research Leads"));

if (failures.length) {
  console.error(`TPI Haunted USA map verification failed: ${failures.length} check(s).`);
  process.exit(1);
}
console.log(`TPI Haunted USA map verification passed: ${stateCards.length} state cards and ${coordinates.length} interactive map states.`);
