import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const output = resolve(root, "docs/MASTER-MARKDOWN-REFERENCE.md");
const checkOnly = process.argv.includes("--check");

const trackedMarkdown = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "*.md"],
  { cwd: root, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 },
)
  .split(/\r?\n/)
  .map(file => file.trim())
  .filter(Boolean)
  .filter(file => !file.startsWith(".local-dev/") && !file.startsWith("node_modules/"))
  .filter(file => file !== "docs/MASTER-MARKDOWN-REFERENCE.md");

const uniqueFiles = [...new Set(trackedMarkdown)].sort();

const groups = [
  {
    title: "1. Authority and operating rules",
    description: "Read these before changing the repository, releasing code, or changing operational policy.",
    match: file => /(^|\/)(AGENTS\.md|docs\/TPI-DEVELOPMENT\/100-DIRECTIVES\/|docs\/TPI-DEVELOPMENT\/TPI-LOCAL-TO-PRODUCTION-RUNBOOK\.md|docs\/TPI-DEVELOPMENT\/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW\.md)/.test(file),
  },
  {
    title: "2. Current status, handoffs, and master references",
    description: "Use these to understand the current project state and continue work safely.",
    match: file => /(^|\/)(README\.md|MASTER_BUILD_PLAN\.md|TPI_AGENT_HANDOFF\.md|TPI_NEXT_BUILD_TASKS\.md|docs\/MASTER-MARKDOWN-REFERENCE\.md|docs\/planning\/|docs\/TPI-DEVELOPMENT\/(README\.md|TPI-CURRENT-DEVELOPMENT-STATUS\.md|TPI-DEVELOPMENT-AGENT-HANDOFF\.md|TPI-STUDIOFLOW-MASTER-HANDOFF\.md))/.test(file),
  },
  {
    title: "3. Security, releases, storage, and recovery",
    description: "Current deployment, authentication, security, database, recovery, and incident records.",
    match: file => /(^|\/)(CLOUDFLARE_PORTAL_SETUP\.md|RESEND_SETUP\.md|CONTRIBUTOR_PORTAL_PLAN\.md|PAPER_EDITOR_ROADMAP\.md|docs\/TPI-DEVELOPMENT\/(005-PRODUCTION-DEPLOYMENT|006-DATABASE-AND-STORAGE|007-SECURITY-AND-PERMISSIONS|009-TESTING-AND-VERIFICATION|010-DEVELOPER-ONBOARDING)\.md|docs\/TPI-DEVELOPMENT\/200-AUDITS\/.*(ACCESS|AUTH|SECURITY|POSTMORTEM|RESILIENCE|PRODUCTION).*)/.test(file),
  },
  {
    title: "4. Quality assurance and verification",
    description: "Test inventories, release checklists, coverage maps, defect records, and QA guidance.",
    match: file => /(^|\/)docs\/quality-assurance\//.test(file) || /(^|\/)scripts\/.*\.md$/.test(file),
  },
  {
    title: "5. Active plans and contributor guidance",
    description: "Plans, architecture notes, contributor instructions, and future-work registers.",
    match: file => /(^|\/)(contributor-guidelines\/|docs\/TPI-DEVELOPMENT\/400-FUTURE-DEVELOPMENT\/|.*(PLAN|ROADMAP|ARCHITECTURE|GUIDE|GUIDELINES|STATUS)\.md$)/.test(file),
  },
  {
    title: "6. Audits and completed work",
    description: "Dated audit and completion records retained as evidence; do not treat them as current status unless the master references say so.",
    match: file => /(^|\/)docs\/(audits|TPI-DEVELOPMENT\/300-COMPLETED-WORK)\//.test(file),
  },
  {
    title: "7. Historical and reference material",
    description: "Older directives, research, experiments, migration notes, and other retained Markdown references.",
    match: () => true,
  },
];

const assigned = new Set();
const rows = [];
let number = 1;
for (const group of groups) {
  const files = uniqueFiles.filter(file => !assigned.has(file) && group.match(file));
  for (const file of files) {
    assigned.add(file);
    const target = relative(dirname(output), resolve(root, file)).replaceAll("\\", "/");
    rows.push(`${number}. [\`${file}\`](./${target})`);
    number += 1;
  }
}

if (assigned.size !== uniqueFiles.length) {
  throw new Error(`Markdown grouping missed ${uniqueFiles.length - assigned.size} file(s)`);
}

const groupBlocks = [];
let cursor = 0;
for (const group of groups) {
  const files = uniqueFiles.filter(file => {
    const groupIndex = groups.findIndex(candidate => candidate.match(file));
    return groups[groupIndex] === group;
  });
  if (!files.length) continue;
  groupBlocks.push(`### ${group.title}\n\n${group.description}\n\n${rows.slice(cursor, cursor + files.length).join("\n")}\n`);
  cursor += files.length;
}

const content = `# Master Markdown Reference\n\nGenerated from the repository's tracked Markdown files. This is the navigation and importance register; each linked Markdown file remains the authoritative source for its own subject. Keep files in their existing folders so historical links, audits, scripts, and release records remain stable.\n\n**Last generated:** 2026-11-14\n**Markdown files indexed:** ${uniqueFiles.length}\n**Ordering:** operational importance first, then path order within each importance group.\n\n## How to use this register\n\n1. Read sections 1–3 before making application, security, data, or production changes.\n2. Use section 2 for current status and handoff decisions.\n3. Use sections 4–5 for testing and planned work.\n4. Treat sections 6–7 as historical evidence unless a current-status document explicitly promotes a record.\n5. Regenerate after adding, moving, or deleting Markdown files:\n\n   \`\`\`sh\n   node scripts/verify/generate-markdown-reference.mjs\n   node scripts/verify/generate-markdown-reference.mjs --check\n   \`\`\`\n\n## Indexed files\n\n${groupBlocks.join("\n")}`;

if (checkOnly) {
  const existing = readFileSync(output, "utf8");
  if (existing !== content) {
    throw new Error("Master Markdown reference is stale; regenerate it.");
  }
  console.log(`OK: ${uniqueFiles.length} Markdown files indexed.`);
} else {
  writeFileSync(output, content);
  console.log(`Wrote ${output} with ${uniqueFiles.length} Markdown files.`);
}
