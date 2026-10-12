import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const config = readFileSync(new URL("../wrangler.dev.toml", import.meta.url), "utf8");
const required = [
  ['Worker name', /name\s*=\s*"theparanormalinitiative-dev"/],
  ['Account ID', /account_id\s*=\s*"221ea5479876fd303ddc87002b9e892d"/],
  ['Development environment', /TPI_ENV\s*=\s*"development"/],
  ['Outbound side-effect guard', /TPI_DISABLE_OUTBOUND\s*=\s*"1"/],
  ['Development D1 name', /database_name\s*=\s*"tpi_contributor_portal_dev"/],
  ['Development D1 ID', /database_id\s*=\s*"4948ecc5-35de-4782-8f6b-b07fa1782b66"/],
  ['Development R2 bucket', /bucket_name\s*=\s*"tpi-contributor-media-dev"/],
];

for (const [label, pattern] of required) {
  if (!pattern.test(config)) throw new Error(`${label} is missing from wrangler.dev.toml`);
}

for (const forbidden of [
  'name = "theparanormalinitiative"',
  'tpi_contributor_portal"',
  'f36b9161-b517-4634-9857-bef4147cefe3',
  'tpi-contributor-media"',
  'paranormalinitiative.com',
  'crons =',
]) {
  if (config.includes(forbidden)) throw new Error(`Production value found in development config: ${forbidden}`);
}

const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
if (branch !== "codex/tpi-development") {
  throw new Error(`Development deployment requires codex/tpi-development; current branch is ${branch || "detached"}`);
}

console.log(JSON.stringify({ ok: true, branch, config: "wrangler.dev.toml", worker: "theparanormalinitiative-dev", d1: "tpi_contributor_portal_dev", r2: "tpi-contributor-media-dev" }));
