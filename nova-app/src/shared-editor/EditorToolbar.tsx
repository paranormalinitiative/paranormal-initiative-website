import type { Editor } from "@tiptap/core";
import { GenOfficeRibbon, type DocumentViewMode } from "./GenOfficeRibbon";

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
  return <div data-testid="editor-toolbar"><GenOfficeRibbon editor={editor} disabled={disabled} onRequestLink={onRequestLink} documentTitle={documentTitle} onToggleFindReplace={onToggleFindReplace} viewMode={viewMode} onViewModeChange={onViewModeChange} /></div>;
}
