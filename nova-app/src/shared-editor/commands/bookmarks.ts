import type { Editor } from "@tiptap/core";
import { validateBookmarkName } from "./validation";

// Bookmarks are `tpiBookmark` atoms at the start of the caret's paragraph,
// heading or list item. Names are unique per document, compared
// case-insensitively, and display casing is kept.
const TARGET_TYPES = ["paragraph", "heading", "listItem"];

export type BookmarkResult = { ok: true } | { ok: false; reason: string };

type Found = { pos: number; name: string };

// Every bookmark atom in the document, in document order.
function collectBookmarks(editor: Editor): Found[] {
  const found: Found[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "tpiBookmark") found.push({ pos, name: String(node.attrs.name) });
    return true;
  });
  return found;
}

export function listBookmarks(editor: Editor): string[] {
  return collectBookmarks(editor).map(bookmark => bookmark.name);
}

export function findBookmark(editor: Editor, name: string): Found | null {
  const wanted = name.toLowerCase();
  return collectBookmarks(editor).find(bookmark => bookmark.name.toLowerCase() === wanted) ?? null;
}

// Returns the content position at the start of the caret's textblock. A list
// item's text lives in its paragraph, so list items resolve through that.
function activeTargetStart(editor: Editor): number | null {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (node.isTextblock) return TARGET_TYPES.includes(node.type.name) ? $from.start(depth) : null;
  }
  return null;
}

export function createBookmark(editor: Editor, input: string): BookmarkResult {
  const check = validateBookmarkName(input);
  if (!check.ok) return check;
  if (findBookmark(editor, check.name)) return { ok: false, reason: `A bookmark named "${check.name}" already exists.` };
  const start = activeTargetStart(editor);
  if (start === null) return { ok: false, reason: "Place the cursor in a paragraph, heading or list item." };
  const atom = editor.schema.nodes.tpiBookmark.create({ name: check.name });
  // One transaction, so one command is one Undo step.
  editor.chain().focus().command(({ tr }) => {
    tr.insert(start, atom);
    return true;
  }).run();
  return { ok: true };
}

export function removeBookmark(editor: Editor, name: string): BookmarkResult {
  const found = findBookmark(editor, name);
  if (!found) return { ok: false, reason: "That bookmark no longer exists." };
  editor.chain().focus().command(({ tr }) => {
    tr.delete(found.pos, found.pos + 1);
    return true;
  }).run();
  return { ok: true };
}

// Moves the selection to the bookmark and scrolls it into view. Stays inside
// the editor; no browser navigation.
export function navigateBookmark(editor: Editor, name: string): BookmarkResult {
  const found = findBookmark(editor, name);
  if (!found) return { ok: false, reason: "Bookmark not found." };
  editor.chain().focus().setTextSelection(found.pos + 1).scrollIntoView().run();
  return { ok: true };
}
