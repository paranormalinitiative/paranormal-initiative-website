#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const sourceRoot = path.join(
  root,
  "docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/TPI-UNIFIED-MASTER",
);
const outputRoot = path.join(root, "docs/TPI-MASTER-DEVELOPMENT/DIRECTIVE-KNOWLEDGE-BASE");

const files = {
  master: path.join(sourceRoot, "TPI_UNIFIED_MASTER_ALL_SOURCES.md"),
  sequence: path.join(sourceRoot, "TPI_Master_Directive_Sequence.csv"),
  chronology: path.join(sourceRoot, "TPI_UNIFIED_MASTER_CHRONOLOGY.csv"),
  references: path.join(sourceRoot, "TPI_Handoff_Directive_References.csv"),
  handoffExtract: path.join(sourceRoot, "TPI_Update_Project_Handoff_Full_Extract.txt"),
  studioHandoff: path.join(sourceRoot, "TPI-STUDIOFLOW-MASTER-HANDOFF.md"),
  recoveryDirective: path.join(sourceRoot, "TPI_Production_Recovery_Agent_Directive.md"),
  startHere: path.join(sourceRoot, "START_HERE_UNIFIED_CODEX.md"),
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  const headers = rows.shift() ?? [];
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function normalize(text) {
  return text.replace(/\s+/g, " ").trim();
}

function idsFrom(text) {
  return [...new Set(text.match(/\bTPI-[A-Z0-9]+-[A-Z0-9]+\b/gi) ?? [])].sort();
}

function projectsFor({ ids, text, workstream }) {
  const haystack = `${ids.join(" ")} ${text}`.toLowerCase();
  const projects = [];
  const add = (project) => {
    if (!projects.includes(project)) projects.push(project);
  };

  if (/tpi-studioflow|studioflow|my studios|brand 1|creator studio/.test(haystack)) add("STUDIOFLOW");
  if (/tpi-admin|administration center|admin panel|founding 50|creator partnership/.test(haystack)) add("ADMIN_PANEL");
  if (/community feed|social feed|feed posts?|feed comments?|feed visibility/.test(haystack)) add("COMMUNITY_FEED");
  if (/tpi-creator|content creator|creator publishing/.test(haystack)) add("CREATOR_SYSTEMS");
  if (/tpi-teams|paranormal teams/.test(haystack)) add("PARANORMAL_TEAMS");
  if (/tpi-dev|tpi-ops|cloudflare|worker|wrangler|\bd1\b|\br2\b|local development|production deploy/.test(haystack)) add("OPERATIONS_CLOUDFLARE");

  if (projects.length === 0) {
    const fallback = {
      STUDIOFLOW: "STUDIOFLOW",
      ADMIN: "ADMIN_PANEL",
      OPS: "OPERATIONS_CLOUDFLARE",
      DEV: "OPERATIONS_CLOUDFLARE",
    }[workstream];
    add(fallback ?? "OTHER");
  }
  return projects;
}

function firstMeaningfulExcerpt(content, maxLength = 900) {
  const excerpt = normalize(content).replace(/^#+\s+[^ ]+[^.]*\.?\s*/, "");
  return excerpt.length <= maxLength ? excerpt : `${excerpt.slice(0, maxLength - 1)}…`;
}

function makeRecord({ sequence, chronology, section, content }) {
  const sequenceNumber = Number(section.masterNumber);
  const ids = idsFrom(`${section.heading}\n${content}`);
  const projects = projectsFor({
    ids,
    text: `${section.heading}\n${content}`,
    workstream: sequence["Primary workstream (approximate)"],
  });
  const date = sequence.Date || chronology["Explicit date"] || "";
  const sourceFile = sequence["Source chat PDF"] || section.source;
  return {
    record_type: "directive_message",
    authority_type: "historical_directive_like_message",
    active_instruction: false,
    master_sequence: sequenceNumber,
    original_archive_entry: sequence["Original archive entry"] || "",
    source_file: sourceFile,
    source_order: sequence["Original message order"] || section.original,
    source_locator: `${sourceFile}:${section.startLine}-${section.endLine}`,
    directive_ids: ids,
    primary_workstream: sequence["Primary workstream (approximate)"] || "OTHER",
    projects,
    explicit_date: date,
    date_evidence: sequence["Date evidence"] || chronology["Date confidence"] || "not stated",
    timestamp_confidence: sequence["Timestamp confidence"] || chronology["Exact message time"] || "date/time unavailable",
    entry_classification: chronology["Entry classification"] || "Historical directive-like message",
    heading: section.heading,
    source_line_start: section.startLine,
    source_line_end: section.endLine,
    excerpt: firstMeaningfulExcerpt(content),
    content,
  };
}

function documentRecord({ file, authorityType, activeInstruction, date, projects, content, note }) {
  const ids = idsFrom(content);
  return {
    record_type: "document_anchor",
    authority_type: authorityType,
    active_instruction: activeInstruction,
    master_sequence: null,
    original_archive_entry: "",
    source_file: file,
    source_order: "document",
    source_locator: file,
    directive_ids: ids,
    primary_workstream: projects[0] ?? "OTHER",
    projects,
    explicit_date: date,
    date_evidence: date ? "document metadata or stated handoff date" : "not stated",
    timestamp_confidence: "date only",
    entry_classification: note,
    heading: path.basename(file),
    source_line_start: 1,
    source_line_end: content.split("\n").length,
    excerpt: firstMeaningfulExcerpt(content),
    content,
  };
}

function chunkDocument({ file, content, authorityType, activeInstruction, projects, chunkSize = 6000 }) {
  const normalized = content.replace(/\r\n/g, "\n");
  const chunks = [];
  let start = 0;
  let chunkNumber = 1;
  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);
    if (end < normalized.length) {
      const boundary = normalized.lastIndexOf("\n\n", end);
      if (boundary > start + 1000) end = boundary;
    }
    const chunk = normalized.slice(start, end).trim();
    if (chunk) {
      const lineStart = normalized.slice(0, start).split("\n").length;
      const lineEnd = normalized.slice(0, end).split("\n").length;
      chunks.push({
        record_type: "document_chunk",
        authority_type: authorityType,
        active_instruction: activeInstruction,
        chunk_id: `${path.basename(file)}#${String(chunkNumber).padStart(4, "0")}`,
        source_file: file,
        source_locator: `${file}:${lineStart}-${lineEnd}`,
        directive_ids: idsFrom(chunk),
        projects,
        excerpt: firstMeaningfulExcerpt(chunk, 700),
        content: chunk,
      });
      chunkNumber += 1;
    }
    start = end;
  }
  return chunks;
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

for (const file of Object.values(files)) {
  if (!fs.existsSync(file)) throw new Error(`Missing source file: ${file}`);
}

const masterLines = fs.readFileSync(files.master, "utf8").split("\n");
const sequenceRows = parseCsv(fs.readFileSync(files.sequence, "utf8"));
const chronologyRows = parseCsv(fs.readFileSync(files.chronology, "utf8"));
const sequenceByMaster = new Map(sequenceRows.map((row) => [Number(row["Master sequence"]), row]));
const chronologyByMaster = new Map(chronologyRows.map((row) => [Number(row["Master entry"]), row]));
const sectionMatches = [];
for (let i = 0; i < masterLines.length; i += 1) {
  const match = masterLines[i].match(/^## Master (\d{4}) \| Original (\d+)\s+[—-]\s+(.+)$/);
  if (match) {
    sectionMatches.push({
      masterNumber: match[1],
      original: match[2].trim(),
      heading: match[0],
      startLine: i + 1,
    });
  }
}

const directiveRecords = [];
for (let i = 0; i < sectionMatches.length; i += 1) {
  const section = sectionMatches[i];
  section.endLine = (sectionMatches[i + 1]?.startLine ?? masterLines.length + 1) - 1;
  const content = masterLines.slice(section.startLine - 1, section.endLine).join("\n").trim();
  directiveRecords.push(makeRecord({
    sequence: sequenceByMaster.get(Number(section.masterNumber)) ?? {},
    chronology: chronologyByMaster.get(Number(section.masterNumber)) ?? {},
    section,
    content,
  }));
}

const handoffExtract = fs.readFileSync(files.handoffExtract, "utf8");
const studioHandoff = fs.readFileSync(files.studioHandoff, "utf8");
const recoveryDirective = fs.readFileSync(files.recoveryDirective, "utf8");
const startHere = fs.readFileSync(files.startHere, "utf8");
const referencesIndex = fs.readFileSync(files.references, "utf8");
const sequenceIndex = fs.readFileSync(files.sequence, "utf8");
const chronologyIndex = fs.readFileSync(files.chronology, "utf8");

const anchors = [
  documentRecord({
    file: "TPI-STUDIOFLOW-MASTER-HANDOFF.md",
    authorityType: "attached_current_handoff_evidence",
    activeInstruction: false,
    date: "2026-10-20",
    projects: ["STUDIOFLOW", "OPERATIONS_CLOUDFLARE", "ADMIN_PANEL", "COMMUNITY_FEED"],
    content: studioHandoff,
    note: "Current evidence/status handoff; implementation claims require current source/runtime verification.",
  }),
  documentRecord({
    file: "TPI_Production_Recovery_Agent_Directive.md",
    authorityType: "attached_operational_directive",
    activeInstruction: false,
    date: "2026-10-20",
    projects: ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "OPERATIONS_CLOUDFLARE"],
    content: recoveryDirective,
    note: "Attached recovery directive; retained as source instruction, not automatically activated by this indexing task.",
  }),
  documentRecord({
    file: "START_HERE_UNIFIED_CODEX.md",
    authorityType: "attached_archive_control_note",
    activeInstruction: false,
    date: "2026-10-20",
    projects: ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "OPERATIONS_CLOUDFLARE"],
    content: startHere,
    note: "Archive control/read-me note; not a replacement for the user's current request.",
  }),
  documentRecord({
    file: "TPI_Handoff_Directive_References.csv",
    authorityType: "attached_provenance_reference_index",
    activeInstruction: false,
    date: "2026-10-20",
    projects: ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "PARANORMAL_TEAMS", "OPERATIONS_CLOUDFLARE"],
    content: referencesIndex,
    note: "Provenance index; rows marked mention-only are pointers and not proof of an actual directive or implementation.",
  }),
  documentRecord({
    file: "TPI_Master_Directive_Sequence.csv",
    authorityType: "attached_sequence_index",
    activeInstruction: false,
    date: "2026-10-20",
    projects: ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "PARANORMAL_TEAMS", "OPERATIONS_CLOUDFLARE"],
    content: sequenceIndex,
    note: "Chronological sequence index; preserves source order and does not invent unavailable timestamps.",
  }),
  documentRecord({
    file: "TPI_UNIFIED_MASTER_CHRONOLOGY.csv",
    authorityType: "attached_chronology_index",
    activeInstruction: false,
    date: "2026-10-20",
    projects: ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "PARANORMAL_TEAMS", "OPERATIONS_CLOUDFLARE"],
    content: chronologyIndex,
    note: "Chronology/date-confidence index; unavailable dates and times remain explicitly unavailable.",
  }),
];

const chunks = [
  ...chunkDocument({
    file: "TPI_Update_Project_Handoff_Full_Extract.txt",
    content: handoffExtract,
    authorityType: "attached_historical_transcript",
    activeInstruction: false,
    projects: ["PARANORMAL_TEAMS", "STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "OPERATIONS_CLOUDFLARE"],
  }),
  ...chunkDocument({
    file: "TPI-STUDIOFLOW-MASTER-HANDOFF.md",
    content: studioHandoff,
    authorityType: "attached_current_handoff_evidence",
    activeInstruction: false,
    projects: ["STUDIOFLOW", "OPERATIONS_CLOUDFLARE", "ADMIN_PANEL", "COMMUNITY_FEED"],
  }),
  ...chunkDocument({
    file: "TPI_Production_Recovery_Agent_Directive.md",
    content: recoveryDirective,
    authorityType: "attached_operational_directive",
    activeInstruction: false,
    projects: ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "OPERATIONS_CLOUDFLARE"],
  }),
  ...chunkDocument({
    file: "START_HERE_UNIFIED_CODEX.md",
    content: startHere,
    authorityType: "attached_archive_control_note",
    activeInstruction: false,
    projects: ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "OPERATIONS_CLOUDFLARE"],
  }),
];

const currentRequest = `# Current organizing request\n\nThis file is metadata for the directive knowledge base, not a site implementation directive.\n\nThe user asked for the supplied files to be deduplicated, organized by project, ordered by source chronology where available, and made searchable for future diagnosis. The requested project buckets are Community Feed, Administration Center/Admin Panel, StudioFlow, and related operations. Development wording in the historical material may later need a production interpretation, but this indexing task must preserve the original wording and must not silently activate or deploy any attached instruction.\n`;

fs.mkdirSync(outputRoot, { recursive: true });
fs.writeFileSync(path.join(outputRoot, "DIRECTIVE-RECORDS.jsonl"), `${directiveRecords.map((record) => JSON.stringify(record)).join("\n")}\n`);
fs.writeFileSync(path.join(outputRoot, "DOCUMENT-ANCHORS.jsonl"), `${anchors.map((record) => JSON.stringify(record)).join("\n")}\n`);
fs.writeFileSync(path.join(outputRoot, "DOCUMENT-CHUNKS.jsonl"), `${chunks.map((record) => JSON.stringify(record)).join("\n")}\n`);
fs.writeFileSync(path.join(outputRoot, "CURRENT-REQUEST-SCOPE.md"), currentRequest);

const indexHeaders = [
  "master_sequence",
  "explicit_date",
  "date_evidence",
  "projects",
  "primary_workstream",
  "directive_ids",
  "source_file",
  "source_order",
  "source_locator",
  "entry_classification",
  "excerpt",
];
const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const indexRows = [indexHeaders.join(",")];
for (const record of directiveRecords) {
  indexRows.push([
    record.master_sequence,
    record.explicit_date,
    record.date_evidence,
    record.projects.join(";"),
    record.primary_workstream,
    record.directive_ids.join(";"),
    record.source_file,
    record.source_order,
    record.source_locator,
    record.entry_classification,
    record.excerpt,
  ].map(csvEscape).join(","));
}
fs.writeFileSync(path.join(outputRoot, "DIRECTIVE-INDEX.csv"), `${indexRows.join("\n")}\n`);

const projectOrder = ["STUDIOFLOW", "ADMIN_PANEL", "COMMUNITY_FEED", "CREATOR_SYSTEMS", "OPERATIONS_CLOUDFLARE", "PARANORMAL_TEAMS", "OTHER"];
const projectLines = [
  "# Project Directive Index",
  "",
  "Records are listed in original master sequence order within each project. A record can appear in multiple sections because project tags are intentionally many-to-many.",
  "",
];
for (const project of projectOrder) {
  projectLines.push(`## ${project}`, "");
  const matches = directiveRecords.filter((record) => record.projects.includes(project));
  projectLines.push(`Count: ${matches.length}`, "");
  for (const record of matches) {
    const sequence = String(record.master_sequence).padStart(4, "0");
    projectLines.push(`- **Master ${sequence}** | ${record.explicit_date || "date unavailable"} | ${record.directive_ids.join(", ") || "no explicit ID"} | ${record.source_locator}`);
    projectLines.push(`  ${record.excerpt}`);
  }
  projectLines.push("");
}
fs.writeFileSync(path.join(outputRoot, "PROJECT-DIRECTIVE-INDEX.md"), `${projectLines.join("\n")}\n`);

const sourceEntries = [
  ["Postiz installation guide.pdf", "/Users/toddknipple/Desktop/Postiz installation guide.pdf", "Postiz installation guide.pdf", "historical PDF; directive records 0001-0199", "historical_source"],
  ["StudioFlow Implementation Review.pdf", "/Users/toddknipple/Desktop/StudioFlow Implementation Review.pdf", "StudioFlow Implementation Review.pdf", "historical PDF; directive records 0200-0299", "historical_source"],
  ["TPI Cloudflare Investigation.pdf", "/Users/toddknipple/Desktop/TPI Cloudflare Investigation.pdf", "TPI Cloudflare Investigation.pdf", "historical PDF; directive records 0300-0354", "historical_source"],
  ["Update TPI project handoff.pdf", "/Users/toddknipple/Desktop/Update TPI project handoff.pdf", "Update TPI project handoff.pdf", "historical PDF; transcript chunks and chronology anchors", "historical_source"],
  ["TPI-STUDIOFLOW-MASTER-HANDOFF.md", "/Users/toddknipple/Desktop/TPI-STUDIOFLOW-MASTER-HANDOFF.md", "TPI-STUDIOFLOW-MASTER-HANDOFF.md", "current handoff evidence anchor and chunks", "attached_evidence"],
  ["TPI_UNIFIED_MASTER_CODEX_HANDOFF.zip", "/Users/toddknipple/Desktop/TPI_UNIFIED_MASTER_CODEX_HANDOFF.zip", "TPI_UNIFIED_MASTER_CODEX_HANDOFF.zip", "archive container; extracted source package", "archive_container"],
];
const sourceManifest = sourceEntries.map(([name, externalOriginalPath, archiveMember, role, kind]) => {
  const repositoryPath = name === "TPI_UNIFIED_MASTER_CODEX_HANDOFF.zip"
    ? "docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/TPI_UNIFIED_MASTER_CODEX_HANDOFF.zip"
    : `docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/TPI-UNIFIED-MASTER/${name}`;
  const absoluteRepositoryPath = path.join(root, repositoryPath);
  return {
    name,
    external_original_path: externalOriginalPath,
    archive_member: archiveMember,
    repository_path: repositoryPath,
    duplicate_group: `supplied-${name}`,
    role,
    kind,
    repository_sha256: sha256(absoluteRepositoryPath),
    repository_size_bytes: fs.statSync(absoluteRepositoryPath).size,
    duplicate_rule: "The Desktop original and repository/archive copy are the same source when SHA-256 matches; index once and preserve provenance.",
  };
});
fs.writeFileSync(path.join(outputRoot, "SOURCE-MANIFEST.json"), `${JSON.stringify(sourceManifest, null, 2)}\n`);

const projectCounts = {};
for (const record of directiveRecords) {
  for (const project of record.projects) projectCounts[project] = (projectCounts[project] ?? 0) + 1;
}
const summary = {
  generated_at: "2026-10-20",
  record_counts: { directive_messages: directiveRecords.length, document_anchors: anchors.length, document_chunks: chunks.length },
  generated_files: ["DIRECTIVE-RECORDS.jsonl", "DOCUMENT-ANCHORS.jsonl", "DOCUMENT-CHUNKS.jsonl", "DIRECTIVE-INDEX.csv", "PROJECT-DIRECTIVE-INDEX.md", "SOURCE-MANIFEST.json", "CURRENT-REQUEST-SCOPE.md"],
  project_counts: projectCounts,
  source_root: "docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/TPI-UNIFIED-MASTER",
  chronology_rule: "Sort by explicit_date when present, then master_sequence/source order; never invent missing timestamps.",
  authority_rule: "Historical and attached instructions are searchable evidence. They are not active implementation authorization unless the current user separately authorizes that work.",
};
fs.writeFileSync(path.join(outputRoot, "KNOWLEDGE-BASE-MANIFEST.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
