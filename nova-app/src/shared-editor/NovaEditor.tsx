import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/core";
import { novaExtensions } from "./editorExtensions";
import { EditorToolbar } from "./EditorToolbar";
import { LinkDialog } from "./LinkDialog";
import { setLink, unsetLink } from "./commands/links";
import { refreshFieldDisplays } from "./commands/fields";

// A generic structured-document editor. It knows nothing about destinations,
// article types, publishing, roles or any product: it takes a TipTap JSON
// document in and reports the edited JSON document out.

export interface NovaEditorProps {
  /** Initial TipTap JSON document. Replacing this prop with a new object reloads the editor. */
  content: JSONContent;
  /** Called after each edit with the current TipTap JSON document. */
  onChange?: (doc: JSONContent) => void;
  /** Accessible label for the editing surface. */
  label?: string;
  /** When true the document cannot be edited: TipTap is not editable and formatting controls are disabled. */
  readOnly?: boolean;
  /** Logical document title; FILENAME fields display it. */
  documentTitle?: string;
}

export function NovaEditor({ content, onChange, label = "Document body", readOnly = false, documentTitle = "" }: NovaEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [hasLink, setHasLink] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: novaExtensions,
    content,
    editorProps: {
      attributes: {
        class: "nova-prose",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label
      }
    },
    onUpdate: ({ editor: instance }) => onChangeRef.current?.(instance.getJSON())
  });

  // Read-only is enforced by TipTap itself, not by CSS, so no edit transaction can apply.
  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (editor) refreshFieldDisplays(editor, documentTitle);
  }, [editor, documentTitle]);

  // Reload the document only when a different structured document is supplied.
  const lastLoadedRef = useRef<string>("");
  useEffect(() => {
    if (!editor) return;
    const serialized = JSON.stringify(content);
    if (serialized === lastLoadedRef.current) return;
    lastLoadedRef.current = serialized;
    editor.commands.setContent(content, { emitUpdate: false });
  }, [editor, content]);

  function openLinkDialog(instance: Editor) {
    setLinkUrl(String(instance.getAttributes("link").href || ""));
    setHasLink(instance.isActive("link"));
    setLinkOpen(true);
  }

  function applyLink(url: string | null) {
    setLinkOpen(false);
    if (!editor) return;
    if (url === null) unsetLink(editor);
    else setLink(editor, url);
  }

  return (
    <div className="nova-shared-editor" data-testid="nova-shared-editor">
      {editor ? (
        <EditorToolbar editor={editor} disabled={readOnly} documentTitle={documentTitle} onRequestLink={() => openLinkDialog(editor)} />
      ) : null}
      <EditorContent editor={editor} data-testid="nova-editor-surface" />
      <LinkDialog
        open={linkOpen}
        initialUrl={linkUrl}
        hasExistingLink={hasLink}
        onApply={applyLink}
        onClose={() => setLinkOpen(false)}
      />
    </div>
  );
}
