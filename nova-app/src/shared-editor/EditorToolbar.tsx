import type { Editor } from "@tiptap/core";
import { OfficeRibbon, type DocumentViewMode } from "./OfficeRibbon";

interface Props {
  editor: Editor;
  disabled: boolean;
  onRequestLink: () => void;
  documentTitle?: string;
  onToggleFindReplace?: () => void;
  viewMode?: DocumentViewMode;
  onViewModeChange?: (mode: DocumentViewMode) => void;
}

export function EditorToolbar({ editor, disabled, onRequestLink, documentTitle = "", onToggleFindReplace, viewMode, onViewModeChange }: Props) {
  return <div data-testid="editor-toolbar"><OfficeRibbon editor={editor} disabled={disabled} onRequestLink={onRequestLink} documentTitle={documentTitle} onToggleFindReplace={onToggleFindReplace} viewMode={viewMode} onViewModeChange={onViewModeChange} /></div>;
}
