import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { novaDocumentExtensions } from "./extensions";
import { SAMPLE_DOCUMENT, serializeDocument, parseDocument, type NovaDocJSON } from "./model";

export function DocumentSpike() {
  const [saved, setSaved] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const editor = useEditor({
    extensions: novaDocumentExtensions,
    content: SAMPLE_DOCUMENT,
    editorProps: {
      attributes: {
        "data-testid": "nova-document",
        "aria-label": "Nova document editor",
        role: "textbox",
        "aria-multiline": "true",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    window.__novaSpike = { ...window.__novaSpike, docJSON: () => editor.getJSON() };
  }, [editor]);

  const save = (ed: Editor) => {
    const json: NovaDocJSON = ed.getJSON();
    const text = serializeDocument(json);
    setSaved(text);
    setStatus(`Saved ${text.length} characters of structured JSON`);
  };

  const reload = (ed: Editor) => {
    if (!saved) {
      setStatus("Nothing saved yet");
      return;
    }
    ed.commands.setContent(parseDocument(saved));
    setStatus("Reloaded from JSON");
  };

  if (!editor) return <p>Loading editor…</p>;

  const btn = (label: string, id: string, action: () => void, active?: boolean) => (
    <button
      type="button"
      data-testid={id}
      aria-pressed={active ? "true" : "false"}
      onClick={action}
    >
      {label}
    </button>
  );

  return (
    <section aria-labelledby="doc-heading">
      <h2 id="doc-heading">Documents (TipTap / ProseMirror)</h2>
      <div role="toolbar" aria-label="Formatting" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {btn("Bold", "fmt-bold", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
        {btn("Italic", "fmt-italic", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
        {btn("Bullets", "fmt-bullet", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
        {btn("Numbers", "fmt-ordered", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
        {btn("Add row", "tbl-row", () => editor.chain().focus().addRowAfter().run())}
        {btn("Undo", "undo", () => editor.chain().focus().undo().run())}
        {btn("Redo", "redo", () => editor.chain().focus().redo().run())}
        {btn("Save JSON", "doc-save", () => save(editor))}
        {btn("Reload JSON", "doc-reload", () => reload(editor))}
      </div>
      <div
        style={{ border: "1px solid #aaa", padding: 12, minHeight: 200, marginTop: 8, background: "#fff", color: "#111" }}
      >
        <EditorContent editor={editor} />
      </div>
      <p data-testid="doc-status" role="status">{status}</p>
    </section>
  );
}
