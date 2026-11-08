import { StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { JSONContent } from "@tiptap/core";
import { NovaEditor } from "./shared-editor/NovaEditor";
import SlidesSurface from "./slides/SlidesSurface";
import "./styles.css";

// Entry for the Content Editor's Nova mode. It mounts only the shared editor
// (no standalone shell, no StudioFlow or article logic) into the container the
// Content Editor provides, and exposes a small imperative API to that page.

export interface NovaContentEditorHandle {
  getDocument(): JSONContent | null;
  setDocument(doc: JSONContent): void;
  setReadOnly(readOnly: boolean): void;
  unmount(): void;
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

let documentRoot: Root | null = null;
let slidesRoot: Root | null = null;
let currentDoc: JSONContent | null = null;
let setExternalDoc: ((doc: JSONContent) => void) | null = null;
let setExternalReadOnly: ((readOnly: boolean) => void) | null = null;

function Host({ initial }: { initial: JSONContent }) {
  const [doc, setDoc] = useState<JSONContent>(initial);
  const [readOnly, setReadOnly] = useState(false);
  setExternalDoc = setDoc;
  setExternalReadOnly = setReadOnly;
  return (
    <NovaEditor
      content={doc}
      readOnly={readOnly}
      onChange={next => {
        currentDoc = next;
      }}
    />
  );
}

export function mountNovaContentEditor(container: HTMLElement, initial: JSONContent = EMPTY_DOC): NovaContentEditorHandle {
  if (documentRoot) documentRoot.unmount();
  currentDoc = initial;
  documentRoot = createRoot(container);
  documentRoot.render(
    <StrictMode>
      <Host initial={initial} />
    </StrictMode>
  );
  return {
    getDocument: () => currentDoc,
      setDocument: doc => {
      currentDoc = doc;
      setExternalDoc?.(doc);
    },
    setReadOnly: readOnly => setExternalReadOnly?.(readOnly),
    unmount: () => {
      documentRoot?.unmount();
      documentRoot = null;
      setExternalDoc = null;
      setExternalReadOnly = null;
    }
  };
}

export interface NovaSlidesWorkspaceHandle {
  unmount(): void;
}

function SlidesHost({ initialPresentationId, onNavigatePresentation }: { initialPresentationId: string | null; onNavigatePresentation?: (id: string | null) => void }) {
  const [presentationId, setPresentationId] = useState<string | null>(initialPresentationId);
  const navigate = (id: string | null) => {
    setPresentationId(id);
    onNavigatePresentation?.(id);
  };
  return <SlidesSurface presentationId={presentationId} onNavigatePresentation={navigate} />;
}

export function mountNovaSlidesWorkspace(container: HTMLElement, initialPresentationId: string | null = null, onNavigatePresentation?: (id: string | null) => void): NovaSlidesWorkspaceHandle {
  if (slidesRoot) slidesRoot.unmount();
  slidesRoot = createRoot(container);
  slidesRoot.render(
    <StrictMode>
      <SlidesHost initialPresentationId={initialPresentationId} onNavigatePresentation={onNavigatePresentation} />
    </StrictMode>
  );
  return {
    unmount: () => {
      slidesRoot?.unmount();
      slidesRoot = null;
    }
  };
}

declare global {
  interface Window {
    TPINovaContentEditor?: { mount: typeof mountNovaContentEditor };
    TPINovaSlidesWorkspace?: { mount: typeof mountNovaSlidesWorkspace };
  }
}

window.TPINovaContentEditor = { mount: mountNovaContentEditor };
window.TPINovaSlidesWorkspace = { mount: mountNovaSlidesWorkspace };
