// Conversion between the Content Editor's article HTML and the Nova structured
// document (TipTap JSON). It supports only the approved Nova formatting set:
// paragraphs, headings (h1-h3), bold, italic, underline, links, bullet and
// ordered lists, blockquotes, horizontal rules and simple tables. Anything else
// is reported in `unsupported` rather than silently dropped.
(function (global) {
  const BLOCK_TAGS = new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "HR", "TABLE", "DIV"]);
  const INLINE_MARK_TAGS = { B: "bold", STRONG: "bold", I: "italic", EM: "italic", U: "underline" };
  const SUPPORTED_TAGS = new Set([
    ...BLOCK_TAGS, "LI", "A", "BR", "SPAN", "TBODY", "THEAD", "TR", "TH", "TD", ...Object.keys(INLINE_MARK_TAGS)
  ]);

  function textNode(text, marks) {
    const node = { type: "text", text };
    if (marks && marks.length) node.marks = marks;
    return node;
  }

  function collectInline(node, marks, unsupported, out) {
    if (node.nodeType === 3) {
      if (node.nodeValue) out.push(textNode(node.nodeValue, marks));
      return;
    }
    if (node.nodeType !== 1) return;
    const tag = node.tagName;
    if (tag === "BR") {
      out.push({ type: "hardBreak" });
      return;
    }
    if (!SUPPORTED_TAGS.has(tag)) unsupported.add(tag.toLowerCase());
    let nextMarks = marks;
    if (INLINE_MARK_TAGS[tag]) {
      nextMarks = [...marks, { type: INLINE_MARK_TAGS[tag] }];
    }
    if (tag === "A") {
      const href = node.getAttribute("href");
      nextMarks = href ? [...marks, { type: "link", attrs: { href } }] : marks;
    }
    for (const child of node.childNodes) collectInline(child, nextMarks, unsupported, out);
  }

  function inlineContent(node, unsupported) {
    const out = [];
    for (const child of node.childNodes) collectInline(child, [], unsupported, out);
    return out;
  }

  function blockFromElement(node, unsupported) {
    const tag = node.tagName;
    if (!SUPPORTED_TAGS.has(tag)) unsupported.add(tag.toLowerCase());
    if (/^H[1-6]$/.test(tag)) {
      const level = Math.min(3, Math.max(1, Number(tag[1])));
      return { type: "heading", attrs: { level }, content: inlineContent(node, unsupported) };
    }
    if (tag === "P" || tag === "DIV" || tag === "SPAN") {
      const content = inlineContent(node, unsupported);
      return content.length ? { type: "paragraph", content } : { type: "paragraph" };
    }
    if (tag === "UL" || tag === "OL") {
      const type = tag === "UL" ? "bulletList" : "orderedList";
      const items = [];
      for (const li of node.children) {
        if (li.tagName !== "LI") { unsupported.add(li.tagName.toLowerCase()); continue; }
        items.push({ type: "listItem", content: [{ type: "paragraph", content: inlineContent(li, unsupported) }] });
      }
      return { type, content: items };
    }
    if (tag === "BLOCKQUOTE") {
      return { type: "blockquote", content: [{ type: "paragraph", content: inlineContent(node, unsupported) }] };
    }
    if (tag === "HR") return { type: "horizontalRule" };
    if (tag === "TABLE") {
      const rows = [];
      for (const tr of node.querySelectorAll("tr")) {
        const cells = [];
        for (const cell of tr.children) {
          const type = cell.tagName === "TH" ? "tableHeader" : "tableCell";
          cells.push({ type, content: [{ type: "paragraph", content: inlineContent(cell, unsupported) }] });
        }
        rows.push({ type: "tableRow", content: cells });
      }
      return { type: "table", content: rows };
    }
    unsupported.add(tag.toLowerCase());
    return null;
  }

  // Converts article HTML into a TipTap JSON document.
  function htmlToNovaDoc(html) {
    const unsupported = new Set();
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html || ""}</body>`, "text/html");
    const content = [];
    for (const child of doc.body.childNodes) {
      if (child.nodeType === 3) {
        if (child.nodeValue.trim()) content.push({ type: "paragraph", content: [textNode(child.nodeValue)] });
        continue;
      }
      if (child.nodeType !== 1) continue;
      const block = blockFromElement(child, unsupported);
      if (block) content.push(block);
    }
    return {
      doc: { type: "doc", content: content.length ? content : [{ type: "paragraph" }] },
      unsupported: [...unsupported]
    };
  }

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
        else if (mark.type === "link") html = `<a href="${escapeText(mark.attrs.href)}" rel="noopener noreferrer nofollow">${html}</a>`;
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

  // Converts a TipTap JSON document into article HTML for the existing preview
  // and publish pipeline. The caller still sanitises through cleanHtml().
  function novaDocToHtml(doc) {
    return (doc && doc.content ? doc.content : []).map(renderBlock).join("");
  }

  global.TPINovaConvert = { htmlToNovaDoc, novaDocToHtml };
})(window);
