import { useCallback, useEffect, useState } from "react";
import { describeNovaError, novaApi } from "../lib/api";
import { formatTimestamp } from "../lib/format";
import type { NovaItem, NovaRevision } from "../lib/types";
import { Modal } from "../shared-editor/Modal";

interface Props {
  itemId: string;
  currentVersion: number;
  onRestored: (item: NovaItem) => void;
  onClose: () => void;
}

export function RevisionsPanel({ itemId, currentVersion, onRestored, onClose }: Props) {
  const [revisions, setRevisions] = useState<NovaRevision[] | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<NovaRevision | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await novaApi.listRevisions(itemId);
      setRevisions(response.revisions);
    } catch (loadError) {
      setError(describeNovaError(loadError));
      setRevisions([]);
    }
  }, [itemId]);

  useEffect(() => { void load(); }, [load]);

  const restore = async () => {
    if (!pending) return;
    setBusy(true);
    setError("");
    try {
      const response = await novaApi.restoreRevision(itemId, pending.id, currentVersion);
      onRestored(response.item);
      setPending(null);
      await load();
    } catch (restoreError) {
      setError(describeNovaError(restoreError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="nova-history" aria-label="Revision history" data-testid="revisions-panel">
      <div className="nova-history-head">
        <div>
          <p className="nova-kicker">History</p>
          <h2>Revisions</h2>
        </div>
        <button type="button" className="nova-icon-button" aria-label="Close revision history" data-testid="close-revisions" onClick={onClose}>×</button>
      </div>

      <p className="nova-history-note">
        Revision snapshots are created whenever content changes. Restoring a revision creates a new current version; nothing historical is rewritten.
      </p>

      {error ? <p className="nova-inline-error" role="alert">{error}</p> : null}

      {revisions === null ? (
        <p className="nova-muted">Loading revisions…</p>
      ) : revisions.length === 0 ? (
        <p className="nova-muted" data-testid="revisions-empty">No revisions are stored for this document yet.</p>
      ) : (
        <ol className="nova-revision-list">
          {revisions.map(revision => (
            <li key={revision.id} className="nova-revision" data-testid="revision-row">
              <div className="nova-revision-meta">
                <span className="nova-revision-number">Revision {revision.revisionNumber}</span>
                <span className="nova-revision-time">{formatTimestamp(revision.createdAt)}</span>
              </div>
              <p className="nova-revision-title">{revision.title || "Untitled Document"}</p>
              {revision.restoredFromRevision !== null ? (
                <p className="nova-revision-source">Restored from revision {revision.restoredFromRevision}</p>
              ) : null}
              <button
                type="button"
                className="nova-button nova-button-small"
                data-testid="revision-restore"
                disabled={busy || revision.revisionNumber === currentVersion}
                onClick={() => setPending(revision)}
              >
                {revision.revisionNumber === currentVersion ? "Current version" : "Restore this revision"}
              </button>
            </li>
          ))}
        </ol>
      )}

      <Modal
        open={pending !== null}
        title={pending ? `Restore revision ${pending.revisionNumber}?` : "Restore revision"}
        description="The document's current content is replaced by this revision and saved as a new version. The current version stays in history."
        onClose={() => setPending(null)}
        testId="revision-dialog"
        footer={
          <>
            <span className="nova-spacer" />
            <button type="button" className="nova-button" onClick={() => setPending(null)}>Cancel</button>
            <button type="button" className="nova-button nova-button-primary" data-testid="revision-confirm" disabled={busy} onClick={() => void restore()}>
              {busy ? "Restoring…" : "Restore revision"}
            </button>
          </>
        }
      >
        <p className="nova-muted">
          {pending ? `${formatTimestamp(pending.createdAt)} — ${pending.title || "Untitled Document"}` : ""}
        </p>
      </Modal>
    </aside>
  );
}
