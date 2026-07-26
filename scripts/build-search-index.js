const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const excludedFiles = new Set([
  "paper-editor.html",
  "member-dashboard.html",
  "member-login.html",
  "contributor-invite.html",
  "contributor-profile.html",
  "published-article.html",
  "search.html"
]);

const excludedPrefixes = [
  "dist/",
  "functions/",
  "node_modules/"
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function stripHtml(html) {
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstMatch(html, pattern) {
  const match = html.match(pattern);
  return match ? stripHtml(match[1]) : "";
}

function getTitle(html, file) {
  return firstMatch(html, /<meta\s+name=["']pp:title["']\s+content=["']([^"']+)["']/i) ||
    firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ||
    file.replace(/\.html$/, "").replace(/[-_]+/g, " ");
}

function getSubtitle(html) {
  return firstMatch(html, /<meta\s+name=["']pp:subtitle["']\s+content=["']([^"']+)["']/i);
}

function getDescription(html, text) {
  return firstMatch(html, /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) ||
    text.split(/[.!?]\s+/).find(sentence => sentence.length > 80) ||
    text.slice(0, 220);
}

const pages = walk(root)
  .filter(file => file.endsWith(".html"))
  .map(file => path.relative(root, file).replace(/\\/g, "/"))
  .filter(file => !excludedFiles.has(path.basename(file)))
  .filter(file => !excludedPrefixes.some(prefix => file.startsWith(prefix)))
  .sort()
  .map(file => {
    const html = fs.readFileSync(path.join(root, file), "utf8");
    const text = stripHtml(html);
    return {
      title: getTitle(html, path.basename(file)),
      subtitle: getSubtitle(html),
      href: file,
      description: getDescription(html, text).slice(0, 260),
      text
    };
  });

const output = `window.TPI_SEARCH_INDEX = ${JSON.stringify(pages, null, 2)};\n`;
fs.writeFileSync(path.join(root, "search-index.js"), output);
console.log(`Search index written with ${pages.length} pages.`);
