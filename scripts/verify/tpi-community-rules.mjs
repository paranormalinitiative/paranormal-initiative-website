import { readFileSync } from "node:fs";

const read = file => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const rules = read("community-rules.js");
const settings = read("member-settings.js");
const home = read("member-home.html");
const login = read("member-login.html");
const client = read("member-login.js");
const api = read("functions/api/[[path]].js");
const migration = read("migrations/0075_community_rules_acceptance.sql");

const checks = [
  ["single versioned rules source exists", rules.includes('const version = "2026-11-21"') && rules.includes("window.TPICommunityRules")],
  ["full Code of Conduct contains all 19 rules", [...rules.matchAll(/\[\d+, "/g)].length >= 29 && rules.includes('[19, "Have Fun!"')],
  ["short member rules contain all 10 rules", rules.includes('[10, "Have Fun!"') && rules.includes("const shortRules")],
  ["full rules are available in Settings navigation", settings.includes("community-rules") && settings.includes("window.TPICommunityRules?.fullHtml")],
  ["composer links directly to short Community Rules", home.includes('href="community-rules.html"') && home.includes("Community Rules")],
  ["short page links back to full Settings rules", read("community-rules.html").includes('member-dashboard.html#community-rules')],
  ["normal registration requires the rules acknowledgement", login.includes('name="communityRulesAccepted"') && client.includes("communityRulesAccepted") && api.includes("communityRulesVersion")],
  ["invite registration requires the rules acknowledgement", login.match(/name="communityRulesAccepted"/g)?.length === 2 && client.includes("creating your contributor login")],
  ["acceptance is stored with a version and timestamp", migration.includes("community_rules_version") && migration.includes("community_rules_accepted_at") && api.includes("community_rules_accepted_at")],
  ["Settings loads the shared rules source before its renderer", read("member-dashboard.html").indexOf('community-rules.js?v=1') < read("member-dashboard.html").indexOf('member-settings.js?v=3')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI Community Rules source verification passed: ${checks.length} checks.`);
