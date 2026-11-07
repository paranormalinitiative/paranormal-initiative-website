import StarterKit from "@tiptap/starter-kit";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { TpiBookmark, TpiField } from "./bookmarkFieldExtensions";
import { findBookmark } from "./commands/bookmarks";

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
    heading: { levels: [1, 2, 3] },
    codeBlock: false,
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" }
    },
    underline: {}
  }),
  Table.configure({ resizable: false, allowTableNodeSelection: true }),
  TableRow,
  TableHeader,
  TableCell,
  TpiBookmark,
  TpiField,
  InternalBookmarkLinks
];
