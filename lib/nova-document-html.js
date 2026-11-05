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

function renderInline(nodes) {
  return (nodes || []).map(node => {
    if (node.type === "hardBreak") return "<br>";
    let html = escapeText(node.text || "");
    for (const mark of node.marks || []) {
      if (mark.type === "bold") html = `<strong>${html}</strong>`;
      else if (mark.type === "italic") html = `<em>${html}</em>`;
      else if (mark.type === "underline") html = `<u>${html}</u>`;
      else if (mark.type === "link" && mark.attrs && mark.attrs.href) html = `<a href="${escapeText(mark.attrs.href)}" rel="noopener noreferrer nofollow">${html}</a>`;
    }
    return html;
  }).join("");
}

function renderBlock(node) {
  switch (node.type) {
    case "paragraph": return `<p>${renderInline(node.content)}</p>`;
    case "heading": return `<h${node.attrs.level}>${renderInline(node.content)}</h${node.attrs.level}>`;
    case "bulletList": return `<ul>${(node.content || []).map(renderBlock).join("")}</ul>`;
    case "orderedList": return `<ol>${(node.content || []).map(renderBlock).join("")}</ol>`;
    case "listItem": return `<li>${(node.content || []).map(renderBlock).join("")}</li>`;
    case "blockquote": return `<blockquote>${(node.content || []).map(renderBlock).join("")}</blockquote>`;
    case "horizontalRule": return "<hr>";
    case "table": return `<table>${(node.content || []).map(renderBlock).join("")}</table>`;
    case "tableRow": return `<tr>${(node.content || []).map(renderBlock).join("")}</tr>`;
    case "tableHeader": return `<th>${(node.content || []).map(renderBlock).join("")}</th>`;
    case "tableCell": return `<td>${(node.content || []).map(renderBlock).join("")}</td>`;
    default: return "";
  }
}

// Converts a Nova document node (TipTap JSON) into the article body fragment the
// Education Center already renders inside `.lesson-reading-copy`.
export function novaDocToHtml(doc) {
  return (doc && doc.content ? doc.content : []).map(renderBlock).join("");
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
export function buildPublicationSnapshot({ doc, title, subtitle, author, articleType, source, labels, destination }) {
  const bodyHtml = novaDocToHtml(doc);
  return {
    bodyHtml,
    articleHtml: articleDocumentHtml({ bodyHtml, title, subtitle, author, articleType, source, labels, destination }),
    bodyBytes: new TextEncoder().encode(bodyHtml).length
  };
}
