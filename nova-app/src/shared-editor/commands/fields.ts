import type { Editor } from "@tiptap/core";
import { FIELD_TYPES, type FieldType } from "../bookmarkFieldExtensions";

export type FieldResult = { ok: true } | { ok: false; reason: string };

// Display text is generated from the field type. The stored semantic value is
// `fieldType`; `displayText` is only a cache that the publication renderer
// regenerates.
export function formatFieldDisplay(fieldType: FieldType, date: Date, documentTitle: string): string {
  if (fieldType === "DATE") return date.toISOString().slice(0, 10);
  if (fieldType === "TIME") return date.toISOString().slice(11, 16) + " UTC";
  // FILENAME is the logical document title, never a filesystem path.
  return documentTitle.trim() || "Untitled";
}

// Refresh only the rendered field labels. The semantic node attributes remain
// untouched, so changing a document title does not create a body revision or
// rewrite the cached displayText in canonical JSON.
export function refreshFieldDisplays(editor: Editor, documentTitle: string, now: Date = new Date()): void {
  editor.view.dom.querySelectorAll<HTMLElement>("[data-tpi-field]").forEach(element => {
    const fieldType = element.dataset.tpiField;
    if (!(FIELD_TYPES as readonly string[]).includes(fieldType || "")) {
      element.textContent = "";
      return;
    }
    element.textContent = formatFieldDisplay(fieldType as FieldType, now, documentTitle);
  });
}

// Inserts a field as a single history step.
export function insertField(editor: Editor, fieldType: string, documentTitle: string, now: Date = new Date()): FieldResult {
  if (!(FIELD_TYPES as readonly string[]).includes(fieldType)) return { ok: false, reason: "Unknown field type." };
  const type = fieldType as FieldType;
  editor.chain().focus().insertContent({
    type: "tpiField",
    attrs: { fieldType: type, format: "default", displayText: formatFieldDisplay(type, now, documentTitle) }
  }).run();
  return { ok: true };
}
