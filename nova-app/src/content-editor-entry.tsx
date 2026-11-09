import { StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { JSONContent } from "@tiptap/core";
import type { NovaDocumentMeta } from "./lib/types";
import { NovaEditor } from "./shared-editor/NovaEditor";
import { FontLibraryProvider } from "./shared-editor/FontLibrary";
import SlidesSurface from "./slides/SlidesSurface";
import "./styles.css";

// Entry for the Content Editor's Nova mode. It mounts only the shared editor
// (no standalone shell, no StudioFlow or article logic) into the container the
// Content Editor provides, and exposes a small imperative API to that page.

export interface NovaContentEditorHandle {
  getDocument(): JSONContent | null;
  getDocumentMeta(): NovaDocumentMeta;
  setDocument(doc: JSONContent): void;
  setDocumentMeta(meta: NovaDocumentMeta): void;
  setReadOnly(readOnly: boolean): void;
  unmount(): void;
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

let documentRoot: Root | null = null;
let slidesRoot: Root | null = null;
let currentDoc: JSONContent | null = null;
let setExternalDoc: ((doc: JSONContent) => void) | null = null;
let setExternalReadOnly: ((readOnly: boolean) => void) | null = null;
let currentMeta: NovaDocumentMeta = { pageSize: "letter", orientation: "portrait", margins: { top: 40, right: 44, bottom: 40, left: 44 }, header: "", footer: "", showPageNumbers: false, comments: [] };
let setExternalMeta: ((meta: NovaDocumentMeta) => void) | null = null;

function Host({ initial, initialMeta }: { initial: JSONContent; initialMeta: NovaDocumentMeta }) {
  const [doc, setDoc] = useState<JSONContent>(initial);
  const [readOnly, setReadOnly] = useState(false);
  const [meta, setMeta] = useState<NovaDocumentMeta>(initialMeta);
  setExternalDoc = setDoc;
  setExternalReadOnly = setReadOnly;
  setExternalMeta = setMeta;
  return <FontLibraryProvider><NovaEditor
      content={doc}
      readOnly={readOnly}
      documentMeta={meta}
      onDocumentMetaChange={next => { currentMeta = next; setMeta(next); }}
      onChange={next => { currentDoc = next; }}
    /></FontLibraryProvider>;
}

export function mountNovaContentEditor(container: HTMLElement, initial: JSONContent = EMPTY_DOC, initialMeta: NovaDocumentMeta = currentMeta): NovaContentEditorHandle {
  if (documentRoot) documentRoot.unmount();
  currentDoc = initial;
  currentMeta = initialMeta;
  documentRoot = createRoot(container);
  documentRoot.render(
    <StrictMode>
      <Host initial={initial} initialMeta={initialMeta} />
    </StrictMode>
  );
  return {
    getDocument: () => currentDoc,
    getDocumentMeta: () => currentMeta,
      setDocument: doc => {
      currentDoc = doc;
      setExternalDoc?.(doc);
    },
    setDocumentMeta: meta => { currentMeta = meta; setExternalMeta?.(meta); },
    setReadOnly: readOnly => setExternalReadOnly?.(readOnly),
    unmount: () => {
      documentRoot?.unmount();
      documentRoot = null;
      setExternalDoc = null;
      setExternalReadOnly = null;
      setExternalMeta = null;
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
