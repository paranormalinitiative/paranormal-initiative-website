import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { ArrowLeft, Archive, History, Trash2, XCircle } from "lucide-react";
import type { Editor, JSONContent } from "@tiptap/core";
import { NovaApiError, describeNovaError, novaApi } from "../lib/api";
import { clearDraft, readDraft, writeDraft, type NovaDraft } from "../lib/draft";
import { formatShortTimestamp, formatTimestamp, statusLabel } from "../lib/format";
import { collectionPath } from "../lib/tree";
import type { NovaCollection, NovaDocumentEnvelope, NovaItem } from "../lib/types";
import { AccessNotice } from "./AccessNotice";
import { EditorToolbar } from "../shared-editor/EditorToolbar";
import { LinkDialog } from "../shared-editor/LinkDialog";
import { setLink, unsetLink } from "../shared-editor/commands/links";
import { Modal } from "../shared-editor/Modal";
import { RevisionsPanel } from "./RevisionsPanel";
import { novaExtensions } from "../shared-editor/editorExtensions";

// Matches the StudioFlow Notes autosave cadence: long enough to avoid writing on
// every keystroke, short enough that a lost tab costs little work.
const AUTOSAVE_DELAY = 1200;

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: string }
  | { kind: "error"; message: string };

interface EditorProps {
  itemId: string;
  collections: NovaCollection[];
  onBack: () => void;
  onChanged: () => void;
}

interface WorkspaceProps {
  item: NovaItem;
  collections: NovaCollection[];
  onBack: () => void;
  onChanged: () => void;
}

function envelope(doc: JSONContent): NovaDocumentEnvelope {
  return { format: "nova-document", version: 1, doc };
}

function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function conflictPayload(error: unknown): NovaItem | null {
  if (!(error instanceof NovaApiError) || error.status !== 409) return null;
  const payload = error.payload as { item?: NovaItem } | null;
  return payload?.item ?? null;
}

export function DocumentEditor({ itemId, collections, onBack, onChanged }: EditorProps) {
  const [item, setItem] = useState<NovaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState<{ status: number | null; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailure(null);
    try {
      const response = await novaApi.getItem(itemId);
      setItem(response.item);
    } catch (error) {
      const status = error instanceof NovaApiError ? error.status : null;
      setFailure({ status, message: describeNovaError(error) });
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="nova-booting" role="status" data-testid="editor-loading">Opening document…</div>;
  }

  if (failure || !item) {
    if (failure && (failure.status === 401 || failure.status === 403)) {
      return <AccessNotice status={failure.status} message={failure.message} />;
    }
    return (
      <div className="nova-error-panel" role="alert" data-testid="editor-error">
        <h1>This document could not be opened</h1>
        <p>{failure?.message ?? "The document is unavailable."}</p>
        <div className="nova-access-actions">
          <button type="button" className="nova-button" onClick={() => void load()}>Try again</button>
          <button type="button" className="nova-button nova-button-quiet" onClick={onBack}>Back to Documents</button>
        </div>
      </div>
    );
  }

  return (
    <DocumentWorkspace
      key={item.id}
      item={item}
      collections={collections}
      onBack={onBack}
      onChanged={onChanged}
    />
  );
}

function DocumentWorkspace({ item, collections, onBack, onChanged }: WorkspaceProps) {
  const [serverItem, setServerItem] = useState<NovaItem>(item);
  const [title, setTitle] = useState(item.title);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [conflict, setConflict] = useState<NovaItem | null>(null);
  const [recoveredDraft, setRecoveredDraft] = useState<NovaDraft | null>(null);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [dirty, setDirty] = useState(false);

  const readOnly = serverItem.status !== "active";

  const versionRef = useRef(item.version);
  const savedContentRef = useRef(JSON.stringify(item.content));
  const savedTitleRef = useRef(item.title);
  const serverUpdatedRef = useRef(item.updatedAt);
  const titleRef = useRef(item.title);
  const dirtyRef = useRef(false);
  const readOnlyRef = useRef(readOnly);
  const conflictRef = useRef<NovaItem | null>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const savingRef = useRef(false);
  const inFlightRef = useRef<Promise<void> | null>(null);
  const pendingSaveRef = useRef(false);
  const editorRef = useRef<Editor | null>(null);
  const draftCheckedRef = useRef(false);
  const onChangedRef = useRef(onChanged);
  const onBackRef = useRef(onBack);
  const onUpdateRef = useRef<(instance: Editor) => void>(() => {});

  const editor = useEditor({
    extensions: novaExtensions,
    content: item.content.doc,
    editable: item.status === "active",
    editorProps: {
      attributes: {
        class: "nova-prose",
        "aria-label": "Document body",
        spellcheck: "true"
      }
    },
    onUpdate: ({ editor: instance }) => onUpdateRef.current(instance)
  });

  useEffect(() => { editorRef.current = editor ?? null; }, [editor]);
  useEffect(() => { onChangedRef.current = onChanged; onBackRef.current = onBack; });
  useEffect(() => { readOnlyRef.current = readOnly; }, [readOnly]);
  useEffect(() => { conflictRef.current = conflict; }, [conflict]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Crash recovery is offered only when the stored draft differs from the copy
  // the server just returned. Identical drafts are cleaned up silently.
  useEffect(() => {
    if (draftCheckedRef.current) return;
    draftCheckedRef.current = true;
    const draft = readDraft(item.id);
    if (!draft) return;
    if (sameJson(draft.content, item.content) && draft.title === item.title) {
      clearDraft(item.id);
      return;
    }
    setRecoveredDraft(draft);
  }, [item.id, item.content, item.title]);

  const buildContent = (instance: Editor) => envelope(instance.getJSON());

  const scheduleSave = (delay = AUTOSAVE_DELAY) => {
    if (timerRef.current !== undefined) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = undefined;
      void persist();
    }, delay);
  };

  const performSave = async (): Promise<void> => {
    const instance = editorRef.current;
    if (!instance || readOnlyRef.current || conflictRef.current) return;

    const content = buildContent(instance);
    const contentJson = JSON.stringify(content);
    const nextTitle = titleRef.current.trim() || "Untitled Document";

    if (contentJson === savedContentRef.current && nextTitle === savedTitleRef.current) {
      dirtyRef.current = false;
      setDirty(false);
      clearDraft(item.id);
      setSaveState({ kind: "saved", at: serverUpdatedRef.current });
      return;
    }

    setSaveState({ kind: "saving" });
    try {
      const response = await novaApi.updateItem(item.id, {
        expectedVersion: versionRef.current,
        title: nextTitle,
        content
      });
      const updated = response.item;
      versionRef.current = updated.version;
      savedContentRef.current = JSON.stringify(updated.content);
      savedTitleRef.current = updated.title;
      serverUpdatedRef.current = updated.updatedAt;
      setServerItem(previous => ({ ...previous, ...updated, content: previous.content }));
      clearDraft(item.id);
      setSaveState({ kind: "saved", at: updated.updatedAt });

      const latestInstance = editorRef.current;
      const latestJson = latestInstance ? JSON.stringify(buildContent(latestInstance)) : contentJson;
      if (latestJson !== savedContentRef.current) {
        dirtyRef.current = true;
        setDirty(true);
        pendingSaveRef.current = true;
      } else {
        dirtyRef.current = false;
        setDirty(false);
      }
      onChangedRef.current();
    } catch (error) {
      const newestServerCopy = conflictPayload(error);
      if (newestServerCopy) {
        setConflict(newestServerCopy);
        setSaveState({
          kind: "error",
          message: "Version conflict — the newer server copy was not overwritten. Your local edits are preserved."
        });
      } else {
        setSaveState({ kind: "error", message: describeNovaError(error) });
      }
      dirtyRef.current = true;
      setDirty(true);
    }
  };

  const persist = (): Promise<void> => {
    if (inFlightRef.current) return inFlightRef.current;
    savingRef.current = true;
    const promise = performSave().finally(() => {
      savingRef.current = false;
      inFlightRef.current = null;
    });
    inFlightRef.current = promise;
    return promise;
  };

  const markDirty = (instance: Editor) => {
    if (readOnlyRef.current) return;
    const content = buildContent(instance);
    // Mounting the editor can emit an update for content that did not actually
    // change. Opening a stored document must not report unsaved changes or
    // spend a document version on a no-op save.
    const nextTitle = titleRef.current.trim() || "Untitled Document";
    if (JSON.stringify(content) === savedContentRef.current && nextTitle === savedTitleRef.current) {
      dirtyRef.current = false;
      setDirty(false);
      return;
    }
    dirtyRef.current = true;
    setDirty(true);
    writeDraft({
      itemId: item.id,
      title: titleRef.current,
      content,
      baseVersion: versionRef.current,
      updatedAt: new Date().toISOString()
    });
    scheduleSave();
  };

  onUpdateRef.current = markDirty;

  const handleTitleChange = (next: string) => {
    setTitle(next);
    titleRef.current = next;
    if (readOnlyRef.current) return;
    dirtyRef.current = true;
    setDirty(true);
    const instance = editorRef.current;
    if (instance) {
      writeDraft({
        itemId: item.id,
        title: next,
        content: buildContent(instance),
        baseVersion: versionRef.current,
        updatedAt: new Date().toISOString()
      });
    }
    scheduleSave();
  };

  const applyServerItem = (fresh: NovaItem) => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    versionRef.current = fresh.version;
    savedContentRef.current = JSON.stringify(fresh.content);
    savedTitleRef.current = fresh.title;
    serverUpdatedRef.current = fresh.updatedAt;
    titleRef.current = fresh.title;
    dirtyRef.current = false;
    setDirty(false);
    pendingSaveRef.current = false;
    setConflict(null);
    conflictRef.current = null;
    setServerItem(fresh);
    setTitle(fresh.title);
    editorRef.current?.commands.setContent(fresh.content.doc);
    clearDraft(fresh.id);
    setSaveState({ kind: "saved", at: fresh.updatedAt });
    onChangedRef.current();
  };

  const reloadServerCopy = async () => {
    setBusy(true);
    setActionError("");
    try {
      const response = await novaApi.getItem(item.id);
      applyServerItem(response.item);
    } catch (error) {
      setActionError(describeNovaError(error));
    } finally {
      setBusy(false);
    }
  };

  const restoreDraft = () => {
    const draft = recoveredDraft;
    if (!draft) return;
    setRecoveredDraft(null);
    editorRef.current?.commands.setContent(draft.content.doc);
    setTitle(draft.title);
    titleRef.current = draft.title;
    dirtyRef.current = true;
    setDirty(true);
    setConflict(null);
    conflictRef.current = null;
    void persist();
  };

  const discardDraft = () => {
    clearDraft(item.id);
    setRecoveredDraft(null);
  };

  const runAction = async (action: "archive" | "trash" | "restore") => {
    if (busy) return;
    setBusy(true);
    setActionError("");
    try {
      if (dirtyRef.current) await persist();
      const response = await novaApi.act(item.id, action, versionRef.current);
      const updated = response.item;
      versionRef.current = updated.version;
      setServerItem(updated);
      if (action === "trash") {
        onChangedRef.current();
        onBackRef.current();
        return;
      }
      if (action === "restore") {
        savedContentRef.current = JSON.stringify(updated.content);
        setSaveState({ kind: "idle" });
      }
      onChangedRef.current();
    } catch (error) {
      setActionError(describeNovaError(error));
    } finally {
      setBusy(false);
    }
  };

  const changeFolder = async (value: string) => {
    if (busy) return;
    setBusy(true);
    setActionError("");
    try {
      if (dirtyRef.current) await persist();
      const response = await novaApi.updateItem(item.id, {
        expectedVersion: versionRef.current,
        collectionId: value || null
      });
      versionRef.current = response.item.version;
      setServerItem(previous => ({
        ...previous,
        collectionId: response.item.collectionId,
        version: response.item.version,
        updatedAt: response.item.updatedAt
      }));
      onChangedRef.current();
    } catch (error) {
      setActionError(describeNovaError(error));
    } finally {
      setBusy(false);
    }
  };

  const permanentlyDelete = async () => {
    if (deleteConfirm !== "DELETE PERMANENTLY") {
      setActionError("Type DELETE PERMANENTLY exactly to confirm permanent deletion.");
      return;
    }
    setBusy(true);
    setActionError("");
    try {
      await novaApi.permanentlyDelete(item.id, versionRef.current);
      setDeleteOpen(false);
      onChangedRef.current();
      onBackRef.current();
    } catch (error) {
      setActionError(describeNovaError(error));
    } finally {
      setBusy(false);
    }
  };

  const applyLink = (url: string | null) => {
    setLinkOpen(false);
    const editorInstance = editorRef.current;
    if (!editorInstance) return;
    if (url === null) unsetLink(editorInstance);
    else setLink(editorInstance, url);
  };

  const handleBack = () => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
    if (dirtyRef.current && !readOnlyRef.current) void persist();
    onBack();
  };

  const currentLink = editor?.getAttributes("link").href ?? "";
  const saveKind = readOnly
    ? "readonly"
    : conflict
      ? "conflict"
      : saveState.kind === "saving"
        ? "saving"
        : saveState.kind === "error"
          ? "error"
          : dirty
            ? "dirty"
            : "saved";
  const saveText = readOnly
    ? `${statusLabel(serverItem.status)} — read-only`
    : conflict
      ? "Save failed — conflict"
      : saveState.kind === "saving"
        ? "Saving…"
        : saveState.kind === "error"
          ? "Save failed"
          : dirty
            ? "Unsaved changes"
            : "Saved";

  return (
    <div className="nova-workspace">
      <div className="nova-editor-main">
        <div className="nova-editor-bar">
          <button type="button" className="nova-button nova-button-quiet nova-back" data-testid="back-to-list" title="Back to documents" onClick={handleBack}>
            <ArrowLeft size={16} strokeWidth={1.9} aria-hidden="true" focusable="false" />
            <span>Documents</span>
          </button>
          <input
            className="nova-title-input"
            data-testid="document-title"
            aria-label="Document title"
            value={title}
            disabled={readOnly}
            onChange={event => handleTitleChange(event.target.value)}
            onBlur={() => { if (dirtyRef.current && !readOnlyRef.current) scheduleSave(0); }}
            placeholder="Untitled Document"
          />
          <span className={`nova-save nova-save-${saveKind}`} data-testid="save-status" data-save-state={saveKind} role="status">
            {saveState.kind === "saving" ? <span className="nova-save-dot" aria-hidden="true" /> : null}
            {saveText}
          </span>
        </div>

        {conflict ? (
          <div className="nova-banner nova-banner-conflict" role="alert" data-testid="conflict-banner">
            <div>
              <strong>Someone or something saved a newer version of this document.</strong>
              <p>
                Nova did not overwrite the server copy (now version {conflict.version}, updated{" "}
                {formatTimestamp(conflict.updatedAt)}). Your local edits are still here and kept as a local draft;
                autosave is paused until you choose how to continue.
              </p>
            </div>
            <div className="nova-banner-actions">
              <button type="button" className="nova-button nova-button-primary" data-testid="reload-server" disabled={busy} onClick={() => void reloadServerCopy()}>
                Load server version
              </button>
              <button type="button" className="nova-button" onClick={() => setConflict(null)}>
                Keep local edits
              </button>
            </div>
          </div>
        ) : null}

        {recoveredDraft ? (
          <div className="nova-banner nova-banner-draft" role="status" data-testid="draft-banner">
            <div>
              <strong>Unsaved local draft recovered</strong>
              <p>
                A draft from {formatTimestamp(recoveredDraft.updatedAt)} was found in this browser. It is not on the
                server yet.
              </p>
            </div>
            <div className="nova-banner-actions">
              <button type="button" className="nova-button nova-button-primary" data-testid="restore-draft" onClick={restoreDraft}>
                Restore draft
              </button>
              <button type="button" className="nova-button" data-testid="discard-draft" onClick={discardDraft}>
                Discard draft
              </button>
            </div>
          </div>
        ) : null}

        {saveState.kind === "error" && !conflict ? (
          <div className="nova-banner nova-banner-error" role="alert" data-testid="save-error">
            <div>
              <strong>Save failed</strong>
              <p>{saveState.message} Your edits remain in the editor and in a local draft.</p>
            </div>
            <div className="nova-banner-actions">
              <button type="button" className="nova-button" data-testid="retry-save" onClick={() => void persist()}>
                Retry save
              </button>
            </div>
          </div>
        ) : null}

        {actionError ? (
          <div className="nova-banner nova-banner-error" role="alert" data-testid="action-error">
            <p>{actionError}</p>
          </div>
        ) : null}

        {readOnly ? (
          <div className="nova-banner nova-banner-readonly" role="status" data-testid="readonly-banner">
            <div>
              <strong>This document is {serverItem.status === "archived" ? "archived" : "in Trash"} and read-only.</strong>
              <p>Restore it to continue editing. Nothing is lost while it sits here.</p>
            </div>
            <div className="nova-banner-actions">
              <button type="button" className="nova-button" data-testid="restore-document" disabled={busy} onClick={() => void runAction("restore")}>
                Restore
              </button>
            </div>
          </div>
        ) : null}

        <div className="nova-meta-row">
          <label className="nova-inline-field">
            <span>Folder</span>
            <select
              data-testid="document-folder"
              value={serverItem.collectionId ?? ""}
              disabled={busy || readOnly}
              onChange={event => void changeFolder(event.target.value)}
            >
              <option value="">Unfiled</option>
              {collections.map(collection => (
                <option key={collection.id} value={collection.id}>
                  {collectionPath(collections, collection.id)}
                </option>
              ))}
            </select>
          </label>

          <span className="nova-meta-text" data-testid="document-version">v{serverItem.version}</span>
          <span className="nova-meta-text">{formatShortTimestamp(serverItem.updatedAt)}</span>

          <span className="nova-spacer" />

          <button type="button" className="nova-button nova-button-small nova-action" data-testid="toggle-revisions" aria-pressed={historyOpen} title={historyOpen ? "Hide revision history" : "Show revision history"} onClick={() => setHistoryOpen(open => !open)}>
            <History size={14} strokeWidth={1.9} aria-hidden="true" focusable="false" />
            <span>{historyOpen ? "Hide history" : "History"}</span>
          </button>
          {!readOnly ? (
            <>
              <button type="button" className="nova-button nova-button-small nova-action" data-testid="archive-document" title="Archive this document" disabled={busy} onClick={() => void runAction("archive")}>
                <Archive size={14} strokeWidth={1.9} aria-hidden="true" focusable="false" />
                <span>Archive</span>
              </button>
              <button type="button" className="nova-button nova-button-small nova-button-danger-quiet nova-action" data-testid="trash-document" title="Move this document to Trash" disabled={busy} onClick={() => void runAction("trash")}>
                <Trash2 size={14} strokeWidth={1.9} aria-hidden="true" focusable="false" />
                <span>Move to Trash</span>
              </button>
            </>
          ) : null}
          {serverItem.status === "trash" ? (
            <button type="button" className="nova-button nova-button-small nova-button-danger-quiet nova-action" data-testid="permanent-delete" title="Permanently delete this document" disabled={busy} onClick={() => { setDeleteConfirm(""); setDeleteOpen(true); }}>
              <XCircle size={14} strokeWidth={1.9} aria-hidden="true" focusable="false" />
              <span>Delete permanently</span>
            </button>
          ) : null}
        </div>

        <EditorToolbar
          editor={editor}
          disabled={readOnly || !editor}
          documentTitle={title}
          onRequestLink={() => setLinkOpen(true)}
        />

        <div className="nova-canvas" data-testid="editor">
          <EditorContent editor={editor} />
        </div>
      </div>

      {historyOpen ? (
        <RevisionsPanel
          itemId={item.id}
          currentVersion={serverItem.version}
          onRestored={applyServerItem}
          onClose={() => setHistoryOpen(false)}
        />
      ) : null}

      <LinkDialog
        open={linkOpen}
        initialUrl={currentLink}
        hasExistingLink={Boolean(currentLink)}
        onApply={applyLink}
        onClose={() => setLinkOpen(false)}
      />

      <Modal
        open={deleteOpen}
        title="Delete this document permanently?"
        description="Permanent deletion removes the document and every stored revision. This cannot be undone, and it is only available for documents already in Trash."
        onClose={() => setDeleteOpen(false)}
        testId="delete-dialog"
        footer={
          <>
            <span className="nova-spacer" />
            <button type="button" className="nova-button" onClick={() => setDeleteOpen(false)}>Cancel</button>
            <button type="button" className="nova-button nova-button-danger" data-testid="delete-confirm" disabled={busy} onClick={() => void permanentlyDelete()}>
              {busy ? "Deleting…" : "Delete permanently"}
            </button>
          </>
        }
      >
        <label className="nova-field">
          <span>Type DELETE PERMANENTLY to confirm</span>
          <input
            type="text"
            data-testid="delete-confirm-input"
            value={deleteConfirm}
            autoComplete="off"
            onChange={event => setDeleteConfirm(event.target.value)}
          />
        </label>
      </Modal>
    </div>
  );
}
