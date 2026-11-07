import { useCallback, useEffect, useState } from "react";
import { FolderPlus, Layers } from "lucide-react";
import { NovaApiError, describeNovaError, novaApi } from "../lib/api";
import type { NovaCollection, NovaItemSummary } from "../lib/types";
import { AccessNotice } from "./AccessNotice";
import { CollectionTree } from "./CollectionTree";
import { DocumentEditor } from "./DocumentEditor";
import { DocumentList } from "./DocumentList";
import { Modal } from "../shared-editor/Modal";

interface Props {
  documentId: string | null;
  onNavigateDocument: (id: string | null) => void;
}

type View = "active" | "archived" | "trash";
type FolderDialog = { mode: "create" } | { mode: "rename"; collection: NovaCollection };

const BLANK_CONTENT = {
  format: "nova-document" as const,
  version: 1 as const,
  doc: { type: "doc", content: [{ type: "paragraph" }] }
};

export default function DocumentsSurface({ documentId, onNavigateDocument }: Props) {
  const [view, setView] = useState<View>("active");
  const [filter, setFilter] = useState("all");
  const [collections, setCollections] = useState<NovaCollection[]>([]);
  const [items, setItems] = useState<NovaItemSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number | null; message: string } | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [creating, setCreating] = useState(false);
  const [folderDialog, setFolderDialog] = useState<FolderDialog | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [folderBusy, setFolderBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [collectionsResponse, itemsResponse] = await Promise.all([
        novaApi.listCollections(),
        novaApi.listItems({
          status: view,
          collectionId: filter === "all" ? undefined : filter
        })
      ]);
      setCollections(collectionsResponse.collections);
      setItems(itemsResponse.items);
      setError(null);
    } catch (loadError) {
      const status = loadError instanceof NovaApiError ? loadError.status : null;
      setError({ status, message: describeNovaError(loadError) });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [view, filter]);

  useEffect(() => { void load(); }, [load, refreshToken]);

  const refresh = () => setRefreshToken(token => token + 1);

  const selectFolder = (nextFilter: string) => {
    setFilter(nextFilter);
    setView("active");
    if (documentId) onNavigateDocument(null);
  };

  const selectView = (nextView: View) => {
    setView(nextView);
    if (documentId) onNavigateDocument(null);
  };

  const createDocument = async () => {
    if (creating) return;
    setCreating(true);
    setError(null);
    try {
      const collectionId = filter !== "all" && filter !== "unfiled" ? filter : null;
      const response = await novaApi.createItem({
        title: "Untitled Document",
        content: BLANK_CONTENT,
        collectionId
      });
      refresh();
      onNavigateDocument(response.item.id);
    } catch (createError) {
      const status = createError instanceof NovaApiError ? createError.status : null;
      setError({ status, message: describeNovaError(createError) });
    } finally {
      setCreating(false);
    }
  };

  const openFolderDialog = (dialog: FolderDialog, initialName = "") => {
    setFolderDialog(dialog);
    setFolderName(initialName);
    setFolderError("");
  };

  const submitFolder = async () => {
    if (!folderDialog || folderBusy) return;
    const name = folderName.trim();
    if (!name) {
      setFolderError("Enter a folder name.");
      return;
    }
    setFolderBusy(true);
    setFolderError("");
    try {
      if (folderDialog.mode === "rename") {
        await novaApi.renameCollection(folderDialog.collection.id, name);
      } else {
        const parentId = filter !== "all" && filter !== "unfiled" ? filter : null;
        await novaApi.createCollection({ name, parentId });
      }
      setFolderDialog(null);
      setFolderName("");
      refresh();
    } catch (folderFailure) {
      setFolderError(describeNovaError(folderFailure));
    } finally {
      setFolderBusy(false);
    }
  };

  const filterLabel = filter === "all"
    ? "All documents"
    : filter === "unfiled"
      ? "Unfiled"
      : collections.find(collection => collection.id === filter)?.name ?? "Folder";

  const authFailure = error && (error.status === 401 || error.status === 403);
  if (authFailure) {
    return <AccessNotice status={error.status} message={error.message} onRetry={() => void load()} />;
  }

  return (
    <div className="nova-surface">
      <aside className="nova-sidebar" aria-label="Nova navigation" data-testid="nova-sidebar">
        <div className="nova-sidebar-views" role="tablist" aria-label="Document views">
          {(["active", "archived", "trash"] as View[]).map(candidate => (
            <button
              key={candidate}
              type="button"
              role="tab"
              aria-selected={view === candidate}
              className={`nova-view-tab${view === candidate ? " is-active" : ""}`}
              data-testid={`view-${candidate}`}
              onClick={() => selectView(candidate)}
            >
              {candidate === "active" ? "Documents" : candidate === "archived" ? "Archive" : "Trash"}
            </button>
          ))}
        </div>

        <div className="nova-sidebar-section">
          <div className="nova-sidebar-heading">
            <span>Folders</span>
            <button
              type="button"
              className="nova-sidebar-action"
              data-testid="new-folder"
              onClick={() => openFolderDialog({ mode: "create" })}
            >
              <FolderPlus size={14} strokeWidth={1.9} aria-hidden="true" focusable="false" />
              <span>New</span>
            </button>
          </div>
          <button
            type="button"
            className={`nova-folder-row nova-folder-all${filter === "all" ? " is-selected" : ""}`}
            data-testid="folder-all"
            onClick={() => selectFolder("all")}
          >
            <Layers className="nova-folder-glyph" size={15} strokeWidth={1.9} aria-hidden="true" focusable="false" />
            <span className="nova-folder-name">All documents</span>
          </button>
          <CollectionTree
            collections={collections}
            selected={filter}
            onSelect={selectFolder}
            onRename={collection => openFolderDialog({ mode: "rename", collection }, collection.name)}
          />
        </div>

        <p className="nova-sidebar-footnote">
          Nova stores structured document JSON. Access is currently limited to the owner, administrators and Creator
          Studio accounts while Nova entitlements are finalized.
        </p>
      </aside>

      <main className="nova-main">
        {error ? (
          <div className="nova-banner nova-banner-error" role="alert" data-testid="surface-error">
            <div>
              <strong>Nova could not refresh</strong>
              <p>{error.message}</p>
            </div>
            <div className="nova-banner-actions">
              <button type="button" className="nova-button" onClick={refresh}>Try again</button>
            </div>
          </div>
        ) : null}

        {documentId ? (
          <DocumentEditor
            itemId={documentId}
            collections={collections}
            onBack={() => { refresh(); onNavigateDocument(null); }}
            onChanged={refresh}
          />
        ) : (
          <DocumentList
            items={items}
            collections={collections}
            view={view}
            filterLabel={filterLabel}
            loading={loading}
            creating={creating}
            onOpen={id => onNavigateDocument(id)}
            onCreate={() => void createDocument()}
          />
        )}
      </main>

      <Modal
        open={folderDialog !== null}
        title={folderDialog?.mode === "rename" ? "Rename folder" : "New folder"}
        description={folderDialog?.mode === "rename" ? "Renaming a folder never changes the documents inside it." : "Folders organize documents. Documents return to Unfiled if a folder is deleted."}
        onClose={() => setFolderDialog(null)}
        testId="folder-dialog"
        footer={
          <>
            <span className="nova-spacer" />
            <button type="button" className="nova-button" onClick={() => setFolderDialog(null)}>Cancel</button>
            <button type="button" className="nova-button nova-button-primary" data-testid="folder-submit" disabled={folderBusy} onClick={() => void submitFolder()}>
              {folderBusy ? "Saving…" : folderDialog?.mode === "rename" ? "Rename folder" : "Create folder"}
            </button>
          </>
        }
      >
        <label className="nova-field">
          <span>Folder name</span>
          <input
            type="text"
            data-testid="folder-name-input"
            value={folderName}
            maxLength={120}
            autoComplete="off"
            onChange={event => { setFolderName(event.target.value); setFolderError(""); }}
            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void submitFolder(); } }}
          />
        </label>
        {folderError ? <p className="nova-field-error" role="alert">{folderError}</p> : null}
      </Modal>
    </div>
  );
}
