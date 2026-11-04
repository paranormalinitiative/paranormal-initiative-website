import { StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { JSONContent } from "@tiptap/core";
import { NovaEditor } from "./shared-editor/NovaEditor";
import "./styles.css";

// Entry for the Content Editor's Nova mode. It mounts only the shared editor
// (no standalone shell, no StudioFlow or article logic) into the container the
// Content Editor provides, and exposes a small imperative API to that page.

export interface NovaContentEditorHandle {
  getDocument(): JSONContent | null;
  setDocument(doc: JSONContent): void;
  unmount(): void;
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

let root: Root | null = null;
let currentDoc: JSONContent | null = null;
let setExternalDoc: ((doc: JSONContent) => void) | null = null;

function Host({ initial }: { initial: JSONContent }) {
  const [doc, setDoc] = useState<JSONContent>(initial);
  setExternalDoc = setDoc;
  return (
    <NovaEditor
      content={doc}
      onChange={next => {
        currentDoc = next;
      }}
    />
  );
}

export function mountNovaContentEditor(container: HTMLElement, initial: JSONContent = EMPTY_DOC): NovaContentEditorHandle {
  if (root) root.unmount();
  currentDoc = initial;
  root = createRoot(container);
  root.render(
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
    unmount: () => {
      root?.unmount();
      root = null;
      setExternalDoc = null;
    }
  };
}

declare global {
  interface Window {
    TPINovaContentEditor?: { mount: typeof mountNovaContentEditor };
  }
}

window.TPINovaContentEditor = { mount: mountNovaContentEditor };
