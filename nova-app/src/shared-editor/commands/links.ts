import type { Editor } from "@tiptap/core";
import { validateLinkHref } from "./validation";

export type LinkResult = { ok: true } | { ok: false; reason: string };

// Applies or edits a link on the current selection as one transaction (one Undo).
export function setLink(editor: Editor, input: string): LinkResult {
  const check = validateLinkHref(input);
  if (!check.ok) return check;
  editor.chain().focus().extendMarkRange("link").setLink({ href: check.href }).run();
  return { ok: true };
}

export function unsetLink(editor: Editor): LinkResult {
  editor.chain().focus().extendMarkRange("link").unsetLink().run();
  return { ok: true };
}

// The current link href, or an empty string when the selection is not a link.
export function currentLinkHref(editor: Editor): string {
  return String(editor.getAttributes("link").href || "");
}
