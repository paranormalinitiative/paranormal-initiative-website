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
  onOpenPageSetup?: () => void;
  onToggleComments?: () => void;
  onPrint?: () => void;
}

export function EditorToolbar({ editor, disabled, onRequestLink, documentTitle = "", onToggleFindReplace, viewMode, onViewModeChange, onOpenPageSetup, onToggleComments, onPrint }: Props) {
  return <div data-testid="editor-toolbar"><OfficeRibbon editor={editor} disabled={disabled} onRequestLink={onRequestLink} documentTitle={documentTitle} onToggleFindReplace={onToggleFindReplace} viewMode={viewMode} onViewModeChange={onViewModeChange} onOpenPageSetup={onOpenPageSetup} onToggleComments={onToggleComments} onPrint={onPrint} /></div>;
}
