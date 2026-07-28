const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const legacySource = fs.readFileSync(path.join(repoRoot, "legacy-contributions.js"), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(legacySource, context);

const legacy = context.window.TPILegacyContributions?.all?.todd || [];
const outputPath = path.join(repoRoot, "migrations", "0010_convert_todd_legacy_contributions.sql");

function sql(value) {
  return String(value || "").replace(/'/g, "''");
}

function slugFromHref(href) {
  return href.replace(/\.html$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function meta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`<meta\\s+name=["']${escaped}["']\\s+content=["']([^"']*)["']`, "i");
  return html.match(pattern)?.[1]?.trim() || "";
}

function stripOuterBody(html) {
  return html
    .replace(/<!doctype[^>]*>/gi, "")
    .replace(/<html[\s\S]*?<body[^>]*>/i, "")
    .replace(/<\/body>[\s\S]*?<\/html>/i, "")
    .replace(/<div\s+id=["']site-header["']><\/div>/gi, "")
    .replace(/<div\s+id=["']site-footer["']><\/div>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<link[\s\S]*?>/gi, "")
    .replace(/<section\s+class=["']lesson-navigation-band["'][\s\S]*?<\/section>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

function extractBody(html) {
  const readable = html.match(/<section\s+class=["'][^"']*lesson-reading-section[^"']*["'][\s\S]*?<\/section>/gi);
  const authorNote = html.match(/<section\s+class=["'][^"']*paper-author-note[^"']*["'][\s\S]*?<\/section>/i)?.[0] || "";
  if (readable?.length) return `${readable.join("\n\n")}${authorNote ? `\n\n${authorNote}` : ""}`;
  return stripOuterBody(html);
}

const rows = legacy.map(item => {
  const filePath = path.join(repoRoot, item.href);
  const html = fs.readFileSync(filePath, "utf8");
  const id = `legacy-${slugFromHref(item.href)}`;
  const title = meta(html, "pp:title") || item.title;
  const subtitle = meta(html, "pp:subtitle") || item.subtitle || "Legacy Site Page";
  const bodyHtml = extractBody(html);
  return {
    id,
    destination: item.destination,
    href: `published-article.html?id=${encodeURIComponent(id)}`,
    title,
    subtitle,
    articleType: item.contributionType || "Legacy Site Page",
    author: "Todd Wayne",
    source: item.href,
    bodyHtml,
    articleHtml: "",
    labels: "Imported, Legacy Site Page",
    status: "published"
  };
});

const statements = [
  "-- Converts Todd Wayne's legacy profile contribution queue into editable published Content Editor articles.",
  "-- Run this in Cloudflare D1 Console against tpi_contributor_portal.",
  "-- Safe to rerun: rows use stable ids and update on conflict.",
  "",
  "INSERT INTO articles (id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by, updated_at)",
  "SELECT v.id, v.destination, v.href, v.title, v.subtitle, v.article_type, v.author, v.source, v.body_html, v.article_html, v.labels, v.status, c.id, CURRENT_TIMESTAMP",
  "FROM ("
];

rows.forEach((row, index) => {
  statements.push(
    `${index ? "  UNION ALL SELECT" : "  SELECT"} '${sql(row.id)}' AS id, '${sql(row.destination)}' AS destination, '${sql(row.href)}' AS href, '${sql(row.title)}' AS title, '${sql(row.subtitle)}' AS subtitle, '${sql(row.articleType)}' AS article_type, '${sql(row.author)}' AS author, '${sql(row.source)}' AS source, '${sql(row.bodyHtml)}' AS body_html, '${sql(row.articleHtml)}' AS article_html, '${sql(row.labels)}' AS labels, '${sql(row.status)}' AS status`
  );
});

statements.push(
  ") v",
  "JOIN contributors c ON c.username = 'Todd_Wayne'",
  "ON CONFLICT(id) DO UPDATE SET",
  "  destination = excluded.destination,",
  "  href = excluded.href,",
  "  title = excluded.title,",
  "  subtitle = excluded.subtitle,",
  "  article_type = excluded.article_type,",
  "  author = excluded.author,",
  "  source = excluded.source,",
  "  body_html = excluded.body_html,",
  "  article_html = excluded.article_html,",
  "  labels = excluded.labels,",
  "  status = excluded.status,",
  "  updated_at = CURRENT_TIMESTAMP;",
  "",
  "SELECT COUNT(*) AS converted_legacy_articles",
  "FROM articles",
  "WHERE source IN (",
  rows.map(row => `  '${sql(row.source)}'`).join(",\n"),
  ");",
  ""
);

fs.writeFileSync(outputPath, statements.join("\n"));
console.log(`Wrote ${rows.length} legacy conversion rows to ${path.relative(repoRoot, outputPath)}`);
