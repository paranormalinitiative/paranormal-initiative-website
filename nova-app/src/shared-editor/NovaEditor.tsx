import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/core";
import { novaExtensions } from "./editorExtensions";
import { EditorToolbar } from "./EditorToolbar";
import { LinkDialog } from "./LinkDialog";
import { setLink, unsetLink } from "./commands/links";
import { refreshFieldDisplays } from "./commands/fields";
import type { NovaDocumentComment, NovaDocumentMeta } from "../lib/types";
import { DocumentCommentsPanel } from "../documents/DocumentCommentsPanel";
import { PageSetupPanel } from "../documents/PageSetupPanel";

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
  documentMeta?: NovaDocumentMeta;
  onDocumentMetaChange?: (meta: NovaDocumentMeta) => void;
}

const DEFAULT_DOCUMENT_META: NovaDocumentMeta = { pageSize: "letter", orientation: "portrait", margins: { top: 40, right: 44, bottom: 40, left: 44 }, header: "", footer: "", showPageNumbers: false, comments: [] };

export function NovaEditor({ content, onChange, label = "Document body", readOnly = false, documentTitle = "", documentMeta = DEFAULT_DOCUMENT_META, onDocumentMetaChange }: NovaEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [hasLink, setHasLink] = useState(false);
  const [meta, setMeta] = useState<NovaDocumentMeta>(() => ({ ...DEFAULT_DOCUMENT_META, ...documentMeta, margins: { ...DEFAULT_DOCUMENT_META.margins, ...(documentMeta.margins || {}) }, comments: documentMeta.comments || [] }));
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [pageSetupOpen, setPageSetupOpen] = useState(false);
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

  useEffect(() => {
    setMeta({ ...DEFAULT_DOCUMENT_META, ...documentMeta, margins: { ...DEFAULT_DOCUMENT_META.margins, ...(documentMeta.margins || {}) }, comments: documentMeta.comments || [] });
  }, [documentMeta]);

  const updateMeta = (next: NovaDocumentMeta) => {
    if (readOnly) return;
    setMeta(next);
    onDocumentMetaChange?.(next);
  };
  const addComment = (comment: NovaDocumentComment) => updateMeta({ ...meta, comments: [...meta.comments, comment] });
  const updateComment = (id: string, patch: Partial<NovaDocumentComment>) => updateMeta({ ...meta, comments: meta.comments.map(comment => comment.id === id ? { ...comment, ...patch } : comment) });
  const deleteComment = (id: string) => updateMeta({ ...meta, comments: meta.comments.filter(comment => comment.id !== id) });

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
        <EditorToolbar editor={editor} disabled={readOnly} documentTitle={documentTitle} onRequestLink={() => openLinkDialog(editor)} onOpenPageSetup={() => setPageSetupOpen(open => !open)} onToggleComments={() => setCommentsOpen(open => !open)} onPrint={() => window.print()} />
      ) : null}
      <div className="nova-shared-document-canvas" data-page-size={meta.pageSize} data-orientation={meta.orientation}>
        {meta.header ? <div className="nova-document-header">{meta.header}</div> : null}
        <EditorContent editor={editor} data-testid="nova-editor-surface" />
        {meta.footer || meta.showPageNumbers ? <div className="nova-document-footer"><span>{meta.footer}</span>{meta.showPageNumbers ? <span>Page 1</span> : null}</div> : null}
      </div>
      {commentsOpen && editor ? <DocumentCommentsPanel comments={meta.comments} readOnly={readOnly} selectedQuote={editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ").trim()} onAdd={addComment} onResolve={id => updateComment(id, { resolved: !meta.comments.find(comment => comment.id === id)?.resolved })} onDelete={deleteComment} onClose={() => setCommentsOpen(false)} /> : null}
      {pageSetupOpen ? <PageSetupPanel meta={meta} readOnly={readOnly} onChange={updateMeta} onClose={() => setPageSetupOpen(false)} /> : null}
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
