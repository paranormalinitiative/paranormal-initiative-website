import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const config = readFileSync(new URL("../wrangler.dev.toml", import.meta.url), "utf8");
const reportOnly = process.argv.includes("--report-only");

const git = args => execFileSync("git", args, { encoding: "utf8" }).replace(/[\r\n]+$/, "");

const documentationOnly = file => (
  file.startsWith("docs/")
  || file.endsWith(".md")
);

const safeIgnoredLocalState = file => (
  file === ".dev.vars"
  || file.startsWith(".wrangler/")
  || file.startsWith("node_modules/")
  || file.startsWith("admin-center-app/node_modules/")
  || file.startsWith("backups/")
  || file.startsWith("data/")
  || file.endsWith("/.DS_Store")
  || file === ".DS_Store"
);

const changedFiles = git(["status", "--porcelain=v1", "--untracked-files=all"])
  .split("\n")
  .filter(Boolean)
  .map(line => line.slice(3));
const uncommittedApplicationFiles = changedFiles.filter(file => !documentationOnly(file));
const ignoredFiles = git([
  "ls-files", "--others", "--ignored", "--exclude-standard", "--",
  ".",
  ":(exclude).wrangler/**",
  ":(exclude)node_modules/**",
  ":(exclude)admin-center-app/node_modules/**",
  ":(exclude)backups/**",
  ":(exclude)data/**",
])
  .split("\n")
  .filter(Boolean);
const undocumentedIgnoredFiles = ignoredFiles.filter(file => !safeIgnoredLocalState(file));
const sourceReport = {
  branch: git(["branch", "--show-current"]),
  head: git(["rev-parse", "HEAD"]),
  changedFiles,
  uncommittedApplicationFiles,
  ignoredFiles,
  undocumentedIgnoredFiles,
  reproducibleFromHead: uncommittedApplicationFiles.length === 0 && undocumentedIgnoredFiles.length === 0,
};
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

const branch = sourceReport.branch;
if (branch !== "codex/tpi-development") {
  throw new Error(`Development deployment requires codex/tpi-development; current branch is ${branch || "detached"}`);
}

console.log(JSON.stringify({
  ok: sourceReport.reproducibleFromHead || reportOnly,
  config: "wrangler.dev.toml",
  worker: "theparanormalinitiative-dev",
  d1: "tpi_contributor_portal_dev",
  r2: "tpi-contributor-media-dev",
  source: sourceReport,
}, null, 2));

if (!sourceReport.reproducibleFromHead && !reportOnly) {
  const files = [
    ...sourceReport.uncommittedApplicationFiles.map(file => `uncommitted application file: ${file}`),
    ...sourceReport.undocumentedIgnoredFiles.map(file => `undocumented ignored file: ${file}`),
  ];
  throw new Error([
    "Development deployment aborted: the current application is not reproducible from HEAD.",
    "Review, commit, or explicitly remove the listed files before deploying.",
    "Documentation-only changes may remain uncommitted; application dependencies may not.",
    ...files,
  ].join("\n"));
}
