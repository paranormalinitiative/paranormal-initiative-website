import type { NovaCollection, NovaItemStatus, NovaItemSummary } from "../lib/types";
import { collectionPath } from "../lib/tree";
import { formatShortTimestamp, statusLabel } from "../lib/format";

interface Props {
  items: NovaItemSummary[];
  collections: NovaCollection[];
  view: "active" | "archived" | "trash";
  filterLabel: string;
  loading: boolean;
  onOpen: (id: string) => void;
  onCreate: () => void;
  creating: boolean;
}

export function DocumentList({ items, collections, view, filterLabel, loading, onOpen, onCreate, creating }: Props) {
  return (
    <section className="nova-list-panel" aria-label="Documents" data-testid="document-list-panel">
      <div className="nova-list-head">
        <div>
          <p className="nova-kicker">{view === "active" ? "Documents" : view === "archived" ? "Archive" : "Trash"}</p>
          <h1 className="nova-list-title">{filterLabel}</h1>
          <p className="nova-list-count" data-testid="document-count">
            {loading ? "Loading…" : `${items.length} document${items.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {view === "active" ? (
          <button
            type="button"
            className="nova-button nova-button-primary"
            data-testid="new-document"
            disabled={creating}
            onClick={onCreate}
          >
            {creating ? "Creating…" : "New document"}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="nova-muted" role="status">Loading documents…</p>
      ) : items.length === 0 ? (
        <div className="nova-empty" data-testid="document-empty">
          <h2>{view === "active" ? "No documents here yet" : view === "archived" ? "Nothing archived" : "Trash is empty"}</h2>
          <p>
            {view === "active"
              ? "Create a document to start writing. Nova saves structured document JSON, not HTML."
              : view === "archived"
                ? "Archived documents remain available and can be restored at any time."
                : "Documents in Trash can be restored until they are permanently deleted."}
          </p>
          {view === "active" ? (
            <button type="button" className="nova-button" onClick={onCreate} disabled={creating}>Create a document</button>
          ) : null}
        </div>
      ) : (
        <ul className="nova-doc-rows">
          {items.map(item => (
            <li key={item.id}>
              <button
                type="button"
                className="nova-doc-row"
                data-testid="document-row"
                data-document-id={item.id}
                onClick={() => onOpen(item.id)}
              >
                <span className="nova-doc-main">
                  <span className="nova-doc-title">{item.title || "Untitled Document"}</span>
                  <span className="nova-doc-folder">{collectionPath(collections, item.collectionId)}</span>
                </span>
                <span className="nova-doc-meta">
                  {item.status !== "active" ? (
                    <span className={`nova-status nova-status-${item.status}`}>{statusLabel(item.status)}</span>
                  ) : (
                    <span className="nova-status nova-status-active">Active</span>
                  )}
                  <span className="nova-doc-updated" data-testid="document-updated">{formatShortTimestamp(item.updatedAt)}</span>
                  <span className="nova-doc-version">v{item.version}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function viewForStatus(status: NovaItemStatus): "active" | "archived" | "trash" {
  return status === "trash" ? "trash" : status === "archived" ? "archived" : "active";
}
