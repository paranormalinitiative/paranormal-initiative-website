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

  function dataNumber(node, name, min, max) {
    const parsed = Number(node.getAttribute(name));
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.round(parsed))) : null;
  }

  function tableAttrsFromElement(node) {
    const attrs = {};
    const widthPx = dataNumber(node, "data-tpi-width-px", 40, 1600);
    const widthPct = dataNumber(node, "data-tpi-width-pct", 10, 100);
    const autoFit = safeEnum(node.getAttribute("data-tpi-autofit"), TABLE_AUTOFIT);
    const alignment = safeEnum(node.getAttribute("data-tpi-alignment"), TABLE_ALIGNMENTS);
    const indentLeft = dataNumber(node, "data-tpi-indent-left", 0, 288);
    const stylePreset = safeEnum(node.getAttribute("data-tpi-style"), TABLE_STYLE_PRESETS);
    const borderStyle = safeEnum(node.getAttribute("data-tpi-border-style"), TABLE_BORDER_STYLES);
    const borderWidth = dataNumber(node, "data-tpi-border-width", 0, 6);
    const borderColor = safeColor(node.getAttribute("data-tpi-border-color"));
    if (widthPx != null) attrs.widthPx = widthPx;
    if (widthPct != null) attrs.widthPct = widthPct;
    if (autoFit) attrs.autoFit = autoFit;
    if (alignment) attrs.alignment = alignment;
    if (indentLeft != null) attrs.indentLeft = indentLeft;
    if (stylePreset) attrs.stylePreset = stylePreset;
    if (borderStyle) attrs.borderStyle = borderStyle;
    if (borderWidth != null) attrs.borderWidth = borderWidth;
    if (borderColor) attrs.borderColor = borderColor;
    return attrs;
  }

  function tableRowAttrsFromElement(node) {
    const heightPx = dataNumber(node, "data-tpi-height-px", 24, 640);
    return heightPx == null ? {} : { heightPx };
  }

  function tableCellAttrsFromElement(node) {
    const attrs = {};
    const colspan = dataNumber(node, "colspan", 1, 63);
    const rowspan = dataNumber(node, "rowspan", 1, 200);
    const verticalAlign = safeEnum(node.getAttribute("data-tpi-vertical-align"), CELL_VERTICAL_ALIGNMENTS);
    const fill = safeColor(node.getAttribute("data-tpi-fill"));
    const borderStyle = safeEnum(node.getAttribute("data-tpi-cell-border-style"), TABLE_BORDER_STYLES);
    const borderWidth = dataNumber(node, "data-tpi-cell-border-width", 0, 6);
    const borderColor = safeColor(node.getAttribute("data-tpi-cell-border-color"));
    if (colspan && colspan > 1) attrs.colspan = colspan;
    if (rowspan && rowspan > 1) attrs.rowspan = rowspan;
    if (verticalAlign) attrs.verticalAlign = verticalAlign;
    if (fill) attrs.fill = fill;
    if (borderStyle) attrs.borderStyle = borderStyle;
    if (borderWidth != null) attrs.borderWidth = borderWidth;
    if (borderColor) attrs.borderColor = borderColor;
    return attrs;
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
          const attrs = tableCellAttrsFromElement(cell);
          cells.push({ type, ...(Object.keys(attrs).length ? { attrs } : {}), content: [{ type: "paragraph", content: inlineContent(cell, unsupported) }] });
        }
        const attrs = tableRowAttrsFromElement(tr);
        rows.push({ type: "tableRow", ...(Object.keys(attrs).length ? { attrs } : {}), content: cells });
      }
      const attrs = tableAttrsFromElement(node);
      return { type: "table", ...(Object.keys(attrs).length ? { attrs } : {}), content: rows };
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

  // TPI-NOVA-005B2A: mirrors lib/nova-document-html.js exactly. Only these href
  // schemes may reach article HTML; anything else is dropped to plain text.
  const SAFE_HREF_SCHEMES = /^(https?:|mailto:|tel:)/i;
  const BOOKMARK_NAME = /^[A-Za-z\u4e00-\u9fff_][\w\u4e00-\u9fff]*$/;

  function safeHref(href) {
    const value = String(href || "").trim();
    if (value.startsWith("#")) {
      const name = value.slice(1);
      return BOOKMARK_NAME.test(name) && name.length <= 80 ? value : null;
    }
    return SAFE_HREF_SCHEMES.test(value) && !/[\u0000-\u001f\s]/.test(value) ? value : null;
  }

  function bookmarkDomId(name) {
    return "nova-bm-" + String(name).toLowerCase().replace(/[^a-z0-9_-]/g, c => "_" + c.codePointAt(0).toString(16) + "_");
  }

  function textStyleCss(attrs) {
    const css = [];
    const fonts = new Set(["Georgia", "Arial", "Calibri", "Garamond", "Inter", "Times New Roman"]);
    const sizes = new Set(["11px", "12px", "14px", "16px", "17px", "18px", "20px", "24px", "28px", "32px", "40px"]);
    if (fonts.has(String(attrs && attrs.fontFamily || ""))) css.push(`font-family:${attrs.fontFamily}`);
    if (sizes.has(String(attrs && attrs.fontSize || ""))) css.push(`font-size:${attrs.fontSize}`);
    if (/^#[0-9a-f]{6}$/i.test(String(attrs && attrs.color || ""))) css.push(`color:${attrs.color}`);
    if (/^#[0-9a-f]{6}$/i.test(String(attrs && attrs.backgroundColor || ""))) css.push(`background-color:${attrs.backgroundColor}`);
    return css.join(";");
  }

  function blockStyle(node) {
    const align = ["left", "center", "right", "justify"].includes(node.attrs && node.attrs.textAlign) ? node.attrs.textAlign : "";
    const indent = value => {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? Math.max(0, Math.min(288, Math.round(parsed))) : 0;
    };
    const styles = [
      align ? `text-align:${align}` : "",
      indent(node.attrs && node.attrs.indentLeft) > 0 ? `margin-left:${indent(node.attrs && node.attrs.indentLeft)}px` : "",
      indent(node.attrs && node.attrs.indentRight) > 0 ? `margin-right:${indent(node.attrs && node.attrs.indentRight)}px` : ""
    ].filter(Boolean);
    return styles.length ? ` style="${styles.join(";")}"` : "";
  }

  const TABLE_AUTOFIT = new Set(["fixed", "contents", "window"]);
  const TABLE_ALIGNMENTS = new Set(["left", "center", "right"]);
  const TABLE_BORDER_STYLES = new Set(["none", "solid", "dashed", "dotted"]);
  const TABLE_STYLE_PRESETS = new Set(["plain", "grid", "striped", "accent"]);
  const CELL_VERTICAL_ALIGNMENTS = new Set(["top", "middle", "bottom"]);
  const safeNumber = (value, min, max) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.round(parsed))) : null;
  };
  const safeColor = value => /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : null;
  const safeEnum = (value, values) => typeof value === "string" && values.has(value) ? value : null;

  function tableAttributes(node) {
    const attrs = node.attrs || {};
    const widthPx = safeNumber(attrs.widthPx, 40, 1600);
    const widthPct = safeNumber(attrs.widthPct, 10, 100);
    const autoFit = safeEnum(attrs.autoFit, TABLE_AUTOFIT);
    const alignment = safeEnum(attrs.alignment, TABLE_ALIGNMENTS);
    const indentLeft = safeNumber(attrs.indentLeft, 0, 288) || 0;
    const stylePreset = safeEnum(attrs.stylePreset, TABLE_STYLE_PRESETS);
    const borderStyle = safeEnum(attrs.borderStyle, TABLE_BORDER_STYLES);
    const borderWidth = safeNumber(attrs.borderWidth, 0, 6) ?? 1;
    const borderColor = safeColor(attrs.borderColor);
    const styles = [
      widthPx ? `width:${widthPx}px` : widthPct ? `width:${widthPct}%` : "",
      autoFit === "fixed" ? "table-layout:fixed" : autoFit === "contents" ? "table-layout:auto" : "",
      alignment === "center" ? "margin-left:auto;margin-right:auto" : alignment === "right" ? "margin-left:auto;margin-right:0" : indentLeft ? `margin-left:${indentLeft}px` : "",
      borderStyle && borderWidth > 0 ? `border-collapse:collapse;border-style:${borderStyle};border-width:${borderWidth}px;border-color:${borderColor || "#33403a"}` : ""
    ].filter(Boolean);
    const output = {};
    if (widthPx) output["data-tpi-width-px"] = widthPx;
    if (widthPct) output["data-tpi-width-pct"] = widthPct;
    if (autoFit) output["data-tpi-autofit"] = autoFit;
    if (alignment) output["data-tpi-alignment"] = alignment;
    if (indentLeft) output["data-tpi-indent-left"] = indentLeft;
    if (stylePreset) output["data-tpi-style"] = stylePreset;
    if (borderStyle) output["data-tpi-border-style"] = borderStyle;
    if (attrs.borderWidth != null) output["data-tpi-border-width"] = borderWidth;
    if (borderColor) output["data-tpi-border-color"] = borderColor;
    if (styles.length) output.style = styles.join(";");
    return output;
  }

  function tableRowAttributes(node) {
    const heightPx = safeNumber(node.attrs && node.attrs.heightPx, 24, 640);
    return heightPx ? { "data-tpi-height-px": heightPx, style: `height:${heightPx}px` } : {};
  }

  function tableCellAttributes(node) {
    const attrs = node.attrs || {};
    const verticalAlign = safeEnum(attrs.verticalAlign, CELL_VERTICAL_ALIGNMENTS);
    const fill = safeColor(attrs.fill);
    const borderStyle = safeEnum(attrs.borderStyle, TABLE_BORDER_STYLES);
    const borderWidth = safeNumber(attrs.borderWidth, 0, 6) ?? 1;
    const borderColor = safeColor(attrs.borderColor);
    const styles = [
      verticalAlign ? `vertical-align:${verticalAlign}` : "",
      fill ? `background-color:${fill}` : "",
      borderStyle && borderWidth > 0 ? `border-style:${borderStyle};border-width:${borderWidth}px;border-color:${borderColor || "#33403a"}` : ""
    ].filter(Boolean);
    const output = {};
    if (attrs.colspan > 1) output.colspan = safeNumber(attrs.colspan, 1, 63);
    if (attrs.rowspan > 1) output.rowspan = safeNumber(attrs.rowspan, 1, 200);
    if (verticalAlign) output["data-tpi-vertical-align"] = verticalAlign;
    if (fill) output["data-tpi-fill"] = fill;
    if (borderStyle) output["data-tpi-cell-border-style"] = borderStyle;
    if (attrs.borderWidth != null) output["data-tpi-cell-border-width"] = borderWidth;
    if (borderColor) output["data-tpi-cell-border-color"] = borderColor;
    if (styles.length) output.style = styles.join(";");
    return output;
  }

  function htmlAttributes(attributes) {
    return Object.entries(attributes).map(([name, value]) => ` ${name}="${escapeText(value)}"`).join("");
  }

  function fieldDisplayText(fieldType, format, ctx) {
    if (fieldType === "DATE") return ctx.now.toISOString().slice(0, 10);
    if (fieldType === "TIME") return ctx.now.toISOString().slice(11, 16) + " UTC";
    if (fieldType === "FILENAME") return ctx.title.trim() || "Untitled";
    return "";
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
        else if (mark.type === "tpiTextStyle") {
          const style = textStyleCss(mark.attrs);
          if (style) html = `<span style="${style}">${html}</span>`;
        }
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
      case "paragraph": return `<p${blockStyle(node)}>${renderInline(node.content, ctx)}</p>`;
      case "heading": return `<h${node.attrs.level}${blockStyle(node)}>${renderInline(node.content, ctx)}</h${node.attrs.level}>`;
      case "bulletList": return `<ul>${kids()}</ul>`;
      case "orderedList": return `<ol>${kids()}</ol>`;
      case "listItem": return `<li>${kids()}</li>`;
      case "blockquote": return `<blockquote>${kids()}</blockquote>`;
      case "horizontalRule": return "<hr>";
      case "table": return `<table${htmlAttributes(tableAttributes(node))}>${kids()}</table>`;
      case "tableRow": return `<tr${htmlAttributes(tableRowAttributes(node))}>${kids()}</tr>`;
      case "tableHeader": return `<th${htmlAttributes(tableCellAttributes(node))}>${kids()}</th>`;
      case "tableCell": return `<td${htmlAttributes(tableCellAttributes(node))}>${kids()}</td>`;
      default: return "";
    }
  }

  // Converts a TipTap JSON document into article HTML for the existing preview
  // and publish pipeline. The caller still sanitises through cleanHtml().
  // fieldContext mirrors lib/nova-document-html.js: { now: Date, title: string }.
  function novaDocToHtml(doc, fieldContext) {
    const fc = fieldContext || {};
    // Accept a Date from any realm: an instanceof check fails across frames.
    const parsed = fc.now ? new Date(Number(fc.now.valueOf ? fc.now.valueOf() : fc.now)) : null;
    const ctx = { now: parsed && !isNaN(parsed.getTime()) ? parsed : new Date(0), title: String(fc.title || "") };
    return (doc && doc.content ? doc.content : []).map(node => renderBlock(node, ctx)).join("");
  }

  global.TPINovaConvert = { htmlToNovaDoc, novaDocToHtml };
})(window);
