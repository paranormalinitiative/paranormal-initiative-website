import { Suspense, lazy, useEffect, useState } from "react";

// Documents and Slides are separate lazy surfaces, so the shell never pulls
// either editor into the initial application bundle.
const DocumentsSurface = lazy(() => import("../documents/DocumentsSurface"));
const SlidesSurface = lazy(() => import("../slides/SlidesSurface"));

function parseDocumentRoute(hash: string): string | null {
  const match = /^#\/documents\/([^/?#]+)/.exec(hash);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function parsePresentationRoute(hash: string): string | null {
  const match = /^#\/slides\/([^/?#]+)/.exec(hash);
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
  const [presentationId, setPresentationId] = useState<string | null>(() => parsePresentationRoute(window.location.hash));
  const [slidesActive, setSlidesActive] = useState(() => window.location.hash.startsWith("#/slides"));

  useEffect(() => {
    const onHashChange = () => {
      setPresentationId(parsePresentationRoute(window.location.hash));
      setSlidesActive(window.location.hash.startsWith("#/slides"));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigatePresentation = (id: string | null) => {
    window.location.hash = id ? `#/slides/${encodeURIComponent(id)}` : "#/slides";
  };

  return (
    <div className="nova-app">
      <header className="nova-topbar">
        <a className="nova-brand" href="#/documents" aria-label="Nova home">
          <span className="nova-brand-mark" aria-hidden="true">N</span>
          <span className="nova-brand-text">
            <span className="nova-brand-name">Nova</span>
            <span className="nova-brand-sub">Editorial Workspace</span>
          </span>
        </a>
        <nav className="nova-topnav" aria-label="Nova sections">
          <a className={`nova-topnav-link${!slidesActive ? " is-active" : ""}`} href="#/documents" aria-current={!slidesActive ? "page" : undefined}>Documents</a>
          <a className={`nova-topnav-link${slidesActive ? " is-active" : ""}`} href="#/slides" aria-current={slidesActive ? "page" : undefined}>Slides</a>
        </nav>
        <a className="nova-return" href="/">The Paranormal Initiative</a>
      </header>

      <Suspense fallback={<div className="nova-booting" role="status">Opening Nova…</div>}>
        {slidesActive ? <SlidesSurface presentationId={presentationId} onNavigatePresentation={navigatePresentation} /> : <DocumentsSurface documentId={documentId} onNavigateDocument={navigate} />}
      </Suspense>
    </div>
  );
}
