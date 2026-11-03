import { Suspense, lazy, useEffect, useState } from "react";

// Only Documents ships today. Slides is a separate future surface and will be
// another dynamic import, so the shell never pulls an editor into the initial
// application bundle.
const DocumentsSurface = lazy(() => import("../documents/DocumentsSurface"));

function parseDocumentRoute(hash: string): string | null {
  const match = /^#\/documents\/([^/?#]+)/.exec(hash);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function useDocumentRoute(): [string | null, (id: string | null) => void] {
  const [documentId, setDocumentId] = useState<string | null>(() => parseDocumentRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setDocumentId(parseDocumentRoute(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (id: string | null) => {
    window.location.hash = id ? `#/documents/${encodeURIComponent(id)}` : "#/documents";
  };

  return [documentId, navigate];
}

export function App() {
  const [documentId, navigate] = useDocumentRoute();

  return (
    <div className="nova-app">
      <header className="nova-topbar">
        <a className="nova-brand" href="#/documents" aria-label="Nova home">
          <span className="nova-brand-mark" aria-hidden="true">N</span>
          <span className="nova-brand-text">
            <span className="nova-brand-name">Nova</span>
            <span className="nova-brand-sub">Edit Documents</span>
          </span>
        </a>
        <nav className="nova-topnav" aria-label="Nova sections">
          <a className="nova-topnav-link is-active" href="#/documents" aria-current="page">Documents</a>
          <span className="nova-topnav-link is-future" aria-disabled="true" title="Nova Slides is a later phase">
            Slides <span className="nova-pill-soft">Later</span>
          </span>
        </nav>
        <a className="nova-return" href="/">The Paranormal Initiative</a>
      </header>

      <Suspense fallback={<div className="nova-booting" role="status">Opening Nova…</div>}>
        <DocumentsSurface documentId={documentId} onNavigateDocument={navigate} />
      </Suspense>
    </div>
  );
}
