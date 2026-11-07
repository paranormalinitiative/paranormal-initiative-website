// TPI-NOVA-004R6E: authoritative Nova document → publication HTML.
//
// Publication HTML is produced on the server from the exact approved Nova
// version. This module is that single deterministic conversion. It mirrors
// content-editor-nova-convert.js, the browser converter used by the Content
// Editor and the Nova Editorial Workspace preview, so an article cannot render
// one way while being reviewed and another way once published. The browser file
// is intentionally left untouched (earlier Nova acceptance evidence evaluates
// its source); the R6E verifier proves byte-identical output against it so the
// two implementations can never drift into inconsistent renderers.
//
// Only the approved Nova formatting set is emitted: paragraphs, headings h1-h3,
// bold, italic, underline, links, bullet and ordered lists, blockquotes,
// horizontal rules and simple tables. Text is escaped, so Contributor content
// can never execute inside the Education Center.

function escapeText(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// TPI-NOVA-005B2A: only these href schemes may reach publication HTML. Anything
// else (javascript:, data:, unknown schemes) is dropped to plain text.
const SAFE_HREF_SCHEMES = /^(https?:|mailto:|tel:)/i;
const BOOKMARK_NAME = /^[A-Za-z\u4e00-\u9fff_][\w\u4e00-\u9fff]*$/;

export function safeHref(href) {
  const value = String(href || "").trim();
  if (value.startsWith("#")) {
    const name = value.slice(1);
    return BOOKMARK_NAME.test(name) && name.length <= 80 ? value : null;
  }
  return SAFE_HREF_SCHEMES.test(value) && !/[\u0000-\u001f\s]/.test(value) ? value : null;
}

// Stable DOM id for a bookmark name. The name is lowercased for case-insensitive
// uniqueness and every non-ASCII-alphanumeric character is encoded, so no raw
// user text reaches an attribute.
export function bookmarkDomId(name) {
  return "nova-bm-" + String(name).toLowerCase().replace(/[^a-z0-9_-]/g, c => "_" + c.codePointAt(0).toString(16) + "_");
}

function renderInline(nodes, ctx) {
  return (nodes || []).map(node => {
    if (node.type === "hardBreak") return "<br>";
    if (node.type === "tpiBookmark") {
      const name = node.attrs && node.attrs.name;
      return typeof name === "string" && BOOKMARK_NAME.test(name) ? `<a id="${bookmarkDomId(name)}"></a>` : "";
    }
    if (node.type === "tpiField") {
      const text = fieldDisplayText(node.attrs && node.attrs.fieldType, node.attrs && node.attrs.format, ctx);
      return text ? escapeText(text) : "";
    }
    let html = escapeText(node.text || "");
    for (const mark of node.marks || []) {
      if (mark.type === "bold") html = `<strong>${html}</strong>`;
      else if (mark.type === "italic") html = `<em>${html}</em>`;
      else if (mark.type === "underline") html = `<u>${html}</u>`;
      else if (mark.type === "link") {
        const href = safeHref(mark.attrs && mark.attrs.href);
        if (href) {
          const target = href.startsWith("#") ? `#${bookmarkDomId(href.slice(1))}` : href;
          html = `<a href="${escapeText(target)}" rel="noopener noreferrer nofollow">${html}</a>`;
        }
      }
    }
    return html;
  }).join("");
}

function renderBlock(node, ctx) {
  const kids = () => (node.content || []).map(child => renderBlock(child, ctx)).join("");
  switch (node.type) {
    case "paragraph": return `<p>${renderInline(node.content, ctx)}</p>`;
    case "heading": return `<h${node.attrs.level}>${renderInline(node.content, ctx)}</h${node.attrs.level}>`;
    case "bulletList": return `<ul>${kids()}</ul>`;
    case "orderedList": return `<ol>${kids()}</ol>`;
    case "listItem": return `<li>${kids()}</li>`;
    case "blockquote": return `<blockquote>${kids()}</blockquote>`;
    case "horizontalRule": return "<hr>";
    case "table": return `<table>${kids()}</table>`;
    case "tableRow": return `<tr>${kids()}</tr>`;
    case "tableHeader": return `<th>${kids()}</th>`;
    case "tableCell": return `<td>${kids()}</td>`;
    default: return "";
  }
}

// Converts a Nova document node (TipTap JSON) into the article body fragment the
// Education Center already renders inside `.lesson-reading-copy`.
// `fieldContext` is captured once per publication: `now` (a Date) and the logical
// `title`. Without it, DATE/TIME/FILENAME fields render from the same fixed inputs
// so the browser preview and the published snapshot agree.
export function novaDocToHtml(doc, fieldContext = {}) {
  const ctx = { now: fieldContext.now instanceof Date ? fieldContext.now : new Date(0), title: String(fieldContext.title || "") };
  return (doc && doc.content ? doc.content : []).map(node => renderBlock(node, ctx)).join("");
}

// Publication-time field values. DATE and TIME use UTC so the snapshot is
// deterministic on any server; FILENAME is the logical document title only.
export function fieldDisplayText(fieldType, format, ctx) {
  if (fieldType === "DATE") return ctx.now.toISOString().slice(0, 10);
  if (fieldType === "TIME") return ctx.now.toISOString().slice(11, 16) + " UTC";
  if (fieldType === "FILENAME") return ctx.title.trim() || "Untitled";
  return "";
}

// Pinned workflow content is stored as the full Nova wrapper
// ({ format, version, doc }) while older records hold the bare document.
export function novaDocumentFromContent(content) {
  if (!content || typeof content !== "object") return null;
  if (content.doc && typeof content.doc === "object") return content.doc;
  return content;
}

// An approved round with no publishable text is refused rather than replacing a
// live publication with an empty page.
export function novaDocHasPublishableContent(doc) {
  const blocks = (doc && Array.isArray(doc.content)) ? doc.content : [];
  const hasText = node => {
    if (!node || typeof node !== "object") return false;
    if (node.type === "text" && String(node.text || "").trim()) return true;
    if (["horizontalRule", "table", "tableRow", "tableHeader", "tableCell"].includes(node.type)) return true;
    return (node.content || []).some(hasText);
  };
  return blocks.some(hasText);
}

// Standalone document mirroring the Contributor preview archive
// (paper-editor.js buildFullArticleDocument), built from the same body. The
// Education Center prefers body_html; article_html remains the stored fallback.
function articleDocumentHtml({ bodyHtml, title, subtitle, author, articleType, source, labels, destination }) {
  const meta = [author, articleType, destination, source, labels].filter(Boolean).join(" · ");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeText(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body{margin:0;background:#0f1419;color:#d7e2ec;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;line-height:1.65}
main{max-width:900px;margin:0 auto;padding:46px 24px 72px}
.kicker{color:#a855f7;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
h1{margin:12px 0 8px;color:#f4f8fb;font-size:42px;line-height:1.1}
.subtitle{margin:0;color:#c7d3de;font-size:18px}
.meta{margin:12px 0 34px;color:#8aa0b6;font-size:13px}
h3{margin:34px 0 12px;color:#f4f8fb;font-size:23px;line-height:1.25}
p{margin:0 0 16px}
a{color:#a855f7}
blockquote{margin:20px 0;padding:4px 0 4px 18px;border-left:3px solid #a855f7}
.embedded-media{margin:26px 0}.embedded-media iframe,.embedded-media video,.embedded-media img{display:block;width:100%;max-width:100%;background:#05080c;border:1px solid #243140;border-radius:6px}.embedded-media iframe,.embedded-media video{aspect-ratio:16/9;height:auto}.embedded-media img{height:auto}.embedded-media figcaption{margin-top:8px;color:#8aa0b6;font-size:13px}
</style>
</head>
<body><main>
<p class="kicker">Research Library · ${escapeText(articleType || "Article")}</p>
<h1>${escapeText(title)}</h1>
${subtitle ? `<p class="subtitle">${escapeText(subtitle)}</p>` : ""}
${meta ? `<p class="meta">${escapeText(meta)}</p>` : ""}
${bodyHtml}
</main></body></html>`;
}

// Builds both publication snapshot fields from the approved Nova document. No
// caller-supplied HTML is accepted or merged.
export function buildPublicationSnapshot({ doc, title, subtitle, author, articleType, source, labels, destination, now = new Date() }) {
  const bodyHtml = novaDocToHtml(doc, { now, title });
  return {
    bodyHtml,
    articleHtml: articleDocumentHtml({ bodyHtml, title, subtitle, author, articleType, source, labels, destination }),
    bodyBytes: new TextEncoder().encode(bodyHtml).length
  };
}
