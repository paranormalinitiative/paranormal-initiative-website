import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { TpiBookmark, TpiField } from "./bookmarkFieldExtensions";
import { TpiTextStyle } from "./ribbonExtensions";
import {
  tableAttributes,
  tableCellAttributes,
  tableCellHTMLAttributes,
  tableHTMLAttributes,
  tableRowAttributes,
  tableRowHTMLAttributes
} from "./tableAttributes";
import { findBookmark } from "./commands/bookmarks";

const MAX_INDENT = 288;

function parseIndent(value: string) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(MAX_INDENT, Math.round(parsed)));
}

function renderBlockStyle(attributes: Record<string, unknown>) {
  const styles = [
    typeof attributes.textAlign === "string" && attributes.textAlign ? `text-align:${attributes.textAlign}` : "",
    Number(attributes.indentLeft) > 0 ? `margin-left:${parseIndent(String(attributes.indentLeft))}px` : "",
    Number(attributes.indentRight) > 0 ? `margin-right:${parseIndent(String(attributes.indentRight))}px` : ""
  ].filter(Boolean);
  return styles.length ? { style: styles.join(";") } : {};
}

const blockLayoutAttributes = {
  textAlign: {
    default: null,
    parseHTML: (element: HTMLElement) => element.style.textAlign || null,
    renderHTML: (attributes: Record<string, unknown>) => renderBlockStyle(attributes)
  },
  indentLeft: {
    default: 0,
    parseHTML: (element: HTMLElement) => parseIndent(element.style.marginLeft),
    renderHTML: () => ({})
  },
  indentRight: {
    default: 0,
    parseHTML: (element: HTMLElement) => parseIndent(element.style.marginRight),
    renderHTML: () => ({})
  }
};

const NovaTable = Table.extend({
  addAttributes() {
    return { ...(this.parent?.() ?? {}), ...tableAttributes };
  },
  renderHTML(props) {
    const htmlAttributes = { ...props.HTMLAttributes, ...tableHTMLAttributes(props.node.attrs) };
    return this.parent?.({ ...props, HTMLAttributes: htmlAttributes }) ?? ["table", htmlAttributes, 0];
  }
});

const NovaTableRow = TableRow.extend({
  addAttributes() {
    return { ...(this.parent?.() ?? {}), ...tableRowAttributes };
  },
  renderHTML(props) {
    const htmlAttributes = { ...props.HTMLAttributes, ...tableRowHTMLAttributes(props.node.attrs) };
    return this.parent?.({ ...props, HTMLAttributes: htmlAttributes }) ?? ["tr", htmlAttributes, 0];
  }
});

const NovaTableCell = TableCell.extend({
  addAttributes() {
    return { ...(this.parent?.() ?? {}), ...tableCellAttributes };
  },
  renderHTML(props) {
    const htmlAttributes = { ...props.HTMLAttributes, ...tableCellHTMLAttributes(props.node.attrs) };
    return this.parent?.({ ...props, HTMLAttributes: htmlAttributes }) ?? ["td", htmlAttributes, 0];
  }
});

const NovaTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...(this.parent?.() ?? {}), ...tableCellAttributes };
  },
  renderHTML(props) {
    const htmlAttributes = { ...props.HTMLAttributes, ...tableCellHTMLAttributes(props.node.attrs) };
    return this.parent?.({ ...props, HTMLAttributes: htmlAttributes }) ?? ["th", htmlAttributes, 0];
  }
});

// A click on an internal #bookmark link moves the caret to that bookmark inside
// the editor. It never reaches the browser, so nothing is opened in a new window.
const InternalBookmarkLinks = Extension.create({
  name: "tpiInternalBookmarkLinks",
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          handleClick(_view, _pos, event) {
            const anchor = (event.target as HTMLElement | null)?.closest?.("a");
            const href = anchor?.getAttribute("href") || "";
            if (!href.startsWith("#")) return false;
            event.preventDefault();
            const name = decodeURIComponent(href.slice(1));
            const found = findBookmark(editor, name);
            if (found) editor.chain().focus().setTextSelection(found.pos + 1).scrollIntoView().run();
            return true;
          }
        }
      })
    ];
  }
});

// Nova's document schema. StarterKit already includes Link and Underline in the
// pinned TipTap 3 release, so they are configured here rather than registered a
// second time. Code blocks are disabled: they are not part of the approved
// Nova-004 formatting set and would add a node the toolbar cannot manage.
export const novaExtensions = [
  StarterKit.configure({
    paragraph: false,
    heading: false,
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" }
    },
    underline: {}
  }),
  Paragraph.extend({
    addAttributes() {
      return {
        ...(this.parent?.() ?? {}),
        ...blockLayoutAttributes
      };
    }
  }),
  Heading.extend({
    addAttributes() {
      return {
        ...(this.parent?.() ?? {}),
        ...blockLayoutAttributes
      };
    }
  }).configure({ levels: [1, 2, 3] }),
  NovaTable.configure({ resizable: true, cellMinWidth: 40, allowTableNodeSelection: true }),
  NovaTableRow,
  NovaTableHeader,
  NovaTableCell,
  TpiBookmark,
  TpiField,
  TpiTextStyle,
  InternalBookmarkLinks
];
