const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOMAIN = "https://paranormalinitiative.com";

const EXCLUDED_FILES = new Set([
  "member-login.html",
  "member-dashboard.html",
  "paper-editor.html",
  "command-center.html",
  "contributor-invite.html",
  "header.html",
  "footer.html",
  "published-article.html",
  "search.html"
]);

const EXCLUDED_PREFIXES = [
  "dist/",
  "functions/",
  "node_modules/",
  ".wrangler/",
  ".git/"
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return full;
  });
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getLastmod(filePath) {
  try {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().slice(0, 10);
  } catch (error) {
    return "";
  }
}

const pages = walk(ROOT)
  .filter(file => file.endsWith(".html"))
  .map(file => path.relative(ROOT, file).replace(/\\/g, "/"))
  .filter(file => !EXCLUDED_FILES.has(path.basename(file)))
  .filter(file => !EXCLUDED_PREFIXES.some(prefix => file.startsWith(prefix)))
  .map(file => {
    const loc = file === "index.html" ? DOMAIN + "/" : DOMAIN + "/" + file;
    const lastmod = getLastmod(path.join(ROOT, file));
    return { loc, lastmod };
  })
  .sort((a, b) => {
    if (a.loc === DOMAIN + "/") return -1;
    if (b.loc === DOMAIN + "/") return 1;
    return a.loc.localeCompare(b.loc);
  });

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...pages.map(p => {
    const lines = ["  <url>", `    <loc>${escapeXml(p.loc)}</loc>`];
    if (p.lastmod) lines.push(`    <lastmod>${p.lastmod}</lastmod>`);
    lines.push("  </url>");
    return lines.join("\n");
  }),
  "</urlset>",
  ""
].join("\n");

fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
console.log(`Sitemap written with ${pages.length} URLs.`);
